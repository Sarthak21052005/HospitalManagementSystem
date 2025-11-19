// backend/services/billing/opdBilling.service.js
const pool = require('../../config/database');
const calc = require('./calculations.service');
const { billHasColumn } = require('./billUtils');

/* ====================================================
   Helper: Get active admission (patient may not have bed)
==================================================== */
async function getActiveAdmissionForPatient(client, patientId) {
  const res = await client.query(`
    SELECT 
      a.admission_id,
      a.admission_date,
      a.bed_id,
      b.bed_number,
      w.name AS ward_name
    FROM IPD_Admission a
    LEFT JOIN Bed b ON a.bed_id = b.bed_id
    LEFT JOIN Ward w ON b.ward_id = w.ward_id
    WHERE a.patient_id = $1 AND a.status = 'active'
    ORDER BY a.admission_date DESC
    LIMIT 1
  `, [patientId]);
  return res.rows[0] || null;
}

/* ====================================================
   CALCULATE OPD BILL
==================================================== */
async function calculateOPDBill(patientId, options = {}) {
  const client = await pool.connect();
  try {
    const from = options.from || new Date().toISOString().split('T')[0];
    const to = options.to || new Date().toISOString().split('T')[0];

    // Consultation, labs, medicines, equipment for OPD
    const consult = await calc.getConsultationCharges(client, patientId, from);
    const lab = await calc.getLabCharges(client, patientId, from, to);
    const meds = await calc.getMedicineCharges(client, patientId, from, to);
    const equipment = await calc.getEquipmentCharges(client, patientId, from, to);

    /* ====================================================
       ROOM CHARGES ONLY IF:
       ✔ Patient has active admission AND
       ✔ admission.bed_id is NOT NULL
    ===================================================== */
    const admission = await getActiveAdmissionForPatient(client, patientId);

    let roomDetail = null;
    let roomTotal = 0;

    if (admission && admission.bed_id !== null) {
      // Patient is admitted AND has a bed → Apply room fees
      const admissionDate = new Date(admission.admission_date);
      const toDate = new Date(to);
      const days = Math.max(1, Math.ceil((toDate - admissionDate) / (1000 * 60 * 60 * 24)));

      const wardName = admission.ward_name || "General Ward";
      const wardRate = calc.RATES.WARD_RATES[wardName] || calc.RATES.WARD_RATES["General Ward"];

      roomTotal = days * wardRate;

      roomDetail = {
        days,
        wardName,
        rate: wardRate,
        total: roomTotal,
        bedNumber: admission.bed_number
      };
    }

    // Total bill
    const subtotal = roomTotal + consult.total + lab.total + meds.total + equipment;
    const taxAmount = calc.computeTax(subtotal);
    const totalAmount = +(subtotal + taxAmount).toFixed(2);

    // Patient info
    const pRes = await client.query(
      `SELECT patient_id, name, age, gender, is_serious_case FROM Patient WHERE patient_id = $1`,
      [patientId]
    );
    const patient = pRes.rows[0] || { patient_id: patientId };

    return {
      admission: admission || null,
      patient_id: patientId,
      patient_name: patient.name,
      age: patient.age,
      gender: patient.gender,
      is_serious_case: patient.is_serious_case,
      date_from: from,
      date_to: to,

      breakdown: {
        room: roomDetail,                               // null if NO BED
        consultation: { ...consult },
        lab: { ...lab },
        medicines: { ...meds },
        equipment: { total: equipment }
      },

      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    };
  } finally {
    client.release();
  }
}

/* ====================================================
   GENERATE OPD BILL
==================================================== */
async function generateOPDBill(patientId, options = {}, discount = 0, paymentMethod = null, adminId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const calculation = await calculateOPDBill(patientId, options);

    const discountAmount =
      discount > 0 ? +(calculation.total_amount * discount / 100).toFixed(2) : 0;

    const finalAmount = +(calculation.total_amount - discountAmount).toFixed(2);

    const hasSubtotal = await billHasColumn(client, 'subtotal');
    const hasTax = await billHasColumn(client, 'tax_amount');
    const hasDiscount = await billHasColumn(client, 'discount');

    const columns = ['patient_id'];
    const params = [patientId];

    if (calculation.admission) {
      columns.push('admission_id');
      params.push(calculation.admission.admission_id);
    }

    if (hasSubtotal) { columns.push('subtotal'); params.push(calculation.subtotal); }
    if (hasTax) { columns.push('tax_amount'); params.push(calculation.tax_amount); }
    if (hasDiscount) { columns.push('discount'); params.push(discountAmount); }

    columns.push('total_amount', 'paid_amount', 'payment_status', 'payment_method');
    params.push(finalAmount, 0, 'pending', (paymentMethod || 'CASH').toUpperCase());

    const placeholders = params.map((_, i) => `$${i + 1}`);
    const insertQuery = `
      INSERT INTO Bill (${columns.join(',')})
      VALUES (${placeholders.join(',')})
      RETURNING *
    `;

    const billRes = await client.query(insertQuery, params);
    const bill = billRes.rows[0];

    /* ====================================================
       BILL ITEMS
    ===================================================== */
    const items = [];

    // ROOM ITEM (ONLY IF bed existed)
    if (calculation.breakdown.room) {
      items.push({
        item_type: 'ROOM',
        description: `${calculation.breakdown.room.wardName} - Bed ${calculation.breakdown.room.bedNumber} (${calculation.breakdown.room.days} days @ ₹${calculation.breakdown.room.rate}/day)`,
        quantity: calculation.breakdown.room.days,
        unit_price: calculation.breakdown.room.rate,
        total_price: calculation.breakdown.room.total
      });
    }

    // CONSULTATION
    if (calculation.breakdown.consultation.total > 0) {
      items.push({
        item_type: 'CONSULTATION',
        description: `OPD Consultation - ${calculation.breakdown.consultation.count} visits`,
        quantity: calculation.breakdown.consultation.count,
        unit_price: calc.RATES.CONSULTATION,
        total_price: calculation.breakdown.consultation.total
      });
    }

    // LAB
    if (calculation.breakdown.lab.total > 0) {
      items.push({
        item_type: 'LAB_TEST',
        description: `Lab Tests - ${calculation.breakdown.lab.count}`,
        quantity: calculation.breakdown.lab.count,
        unit_price:
          calculation.breakdown.lab.total /
          Math.max(1, calculation.breakdown.lab.count),
        total_price: calculation.breakdown.lab.total
      });
    }

    // MEDICINES
    if (calculation.breakdown.medicines.total > 0) {
      items.push({
        item_type: 'MEDICINE',
        description: `Medicines - ${calculation.breakdown.medicines.count}`,
        quantity: calculation.breakdown.medicines.count,
        unit_price:
          calculation.breakdown.medicines.total /
          Math.max(1, calculation.breakdown.medicines.count),
        total_price: calculation.breakdown.medicines.total
      });
    }

    // TAX
    if (calculation.tax_amount > 0) {
      items.push({
        item_type: 'TAX',
        description: `GST @ ${calc.RATES.TAX_RATE * 100}%`,
        quantity: 1,
        unit_price: calculation.tax_amount,
        total_price: calculation.tax_amount
      });
    }

    // DISCOUNT
    if (discountAmount > 0) {
      items.push({
        item_type: 'DISCOUNT',
        description: `Discount - ${discount}%`,
        quantity: 1,
        unit_price: -Math.abs(discountAmount),
        total_price: -Math.abs(discountAmount)
      });
    }

    // Insert bill items
    const insertItem = `
      INSERT INTO Bill_Item (bill_id, item_type, description, quantity, unit_price, total_price)
      VALUES ($1,$2,$3,$4,$5,$6)
    `;
    for (const it of items) {
      await client.query(insertItem, [
        bill.bill_id,
        it.item_type,
        it.description,
        it.quantity,
        it.unit_price,
        it.total_price
      ]);
    }

    await client.query('COMMIT');

    return {
      ...bill,
      breakdown: calculation.breakdown,
      subtotal: calculation.subtotal,
      tax_amount: calculation.tax_amount,
      discount_amount: discountAmount,
      total_amount: finalAmount
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  calculateOPDBill,
  generateOPDBill
};
