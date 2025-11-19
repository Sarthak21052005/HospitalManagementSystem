// backend/services/billing/payments.service.js
const pool = require('../../config/database');
const { normalizePaymentMethodForTransaction } = require('./billUtils');

async function processPayment(billId, amount, paymentMethod, referenceNumber, adminId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const billResult = await client.query(`SELECT * FROM Bill WHERE bill_id = $1 FOR UPDATE`, [billId]);
    if (!billResult.rows.length) throw new Error('Bill not found');

    const bill = billResult.rows[0];
    const currentPaid = parseFloat(bill.paid_amount) || 0;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error('Invalid payment amount');

    const newPaidAmount = +(currentPaid + parsedAmount).toFixed(2);
    const totalAmount = parseFloat(bill.total_amount) || 0;

    let paymentStatus = 'pending';
    if (newPaidAmount >= totalAmount) paymentStatus = 'paid';
    else if (newPaidAmount > 0) paymentStatus = 'partial';

    const normalizedForTxn = normalizePaymentMethodForTransaction(paymentMethod);
    const normalizedMethod = (paymentMethod || 'CASH').toUpperCase();

    const paymentResult = await client.query(`
      INSERT INTO Payment_Transaction (bill_id, amount, payment_method, reference_number, status, notes)
      VALUES ($1,$2,$3,$4,'SUCCESS',$5) RETURNING *
    `, [billId, parsedAmount, normalizedForTxn, referenceNumber || `PAY-${Date.now()}`, `Payment of ₹${parsedAmount} processed by ${adminId || 'admin'}`]);

    await client.query(`
      UPDATE Bill SET paid_amount = $1, payment_status = $2, payment_method = $3 WHERE bill_id = $4
    `, [newPaidAmount, paymentStatus, normalizedMethod, billId]);

    if (paymentStatus === 'paid' && bill.admission_id) {
      await client.query(`
        UPDATE IPD_Admission SET status = 'discharged', discharge_date = CURRENT_DATE, discharge_time = CURRENT_TIME, discharge_summary = 'Payment completed - Patient discharged' WHERE admission_id = $1
      `, [bill.admission_id]);

      await client.query(`
        UPDATE Bed SET status = 'available', current_patient_id = NULL WHERE bed_id = (SELECT bed_id FROM IPD_Admission WHERE admission_id = $1)
      `, [bill.admission_id]);
    }

    await client.query('COMMIT');

    return {
      ...paymentResult.rows[0],
      bill_id: billId,
      new_paid_amount: newPaidAmount,
      remaining_balance: +(totalAmount - newPaidAmount).toFixed(2),
      payment_status: paymentStatus,
      patient_discharged: paymentStatus === 'paid' && bill.admission_id ? true : false
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updatePaymentStatus(billId, status) {
  const client = await pool.connect();
  try {
    await client.query(`UPDATE Bill SET payment_status = $1 WHERE bill_id = $2`, [status, billId]);
  } finally {
    client.release();
  }
}

module.exports = {
  processPayment,
  updatePaymentStatus
};
