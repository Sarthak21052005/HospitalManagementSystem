// backend/services/billing/queries.service.js
const pool = require('../../config/database');

async function getBillingStats() {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [pendingResult, paidTodayResult, monthlyResult, overdueResult] = await Promise.all([
      client.query(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount - paid_amount),0) as total_pending
        FROM Bill WHERE payment_status IN ('pending','partial')
      `),
      client.query(`SELECT COALESCE(SUM(paid_amount),0) as total_paid_today FROM Bill WHERE bill_date = $1 AND payment_status = 'paid'`, [today]),
      client.query(`SELECT COALESCE(SUM(paid_amount),0) as monthly_revenue FROM Bill WHERE bill_date >= $1 AND payment_status IN ('paid','partial')`, [firstDayOfMonth]),
      client.query(`SELECT COUNT(*) as count FROM Bill WHERE payment_status = 'pending' AND bill_date < CURRENT_DATE - INTERVAL '7 days'`)
    ]);

    return {
      pendingBills: parseInt(pendingResult.rows[0].count,10),
      pendingAmount: parseFloat(pendingResult.rows[0].total_pending),
      paidToday: parseFloat(paidTodayResult.rows[0].total_paid_today),
      monthlyRevenue: parseFloat(monthlyResult.rows[0].monthly_revenue),
      overdueBills: parseInt(overdueResult.rows[0].count,10)
    };
  } finally {
    client.release();
  }
}

async function getAllBills(filters = {}) {
  const client = await pool.connect();
  try {
    let query = `
      SELECT b.*, p.name as patient_name, p.age, p.gender, d.name as doctor_name, a.admission_date, w.name as ward_name
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;
    if (filters.status) {
      if (filters.status === 'pending') {
        query += ` AND b.payment_status IN ('pending','partial')`;
      } else {
        query += ` AND b.payment_status = $${i++}`;
        params.push(filters.status);
      }
    }
    if (filters.from) { query += ` AND b.bill_date >= $${i++}`; params.push(filters.from); }
    if (filters.to) { query += ` AND b.bill_date <= $${i++}`; params.push(filters.to); }
    if (filters.patientName) { query += ` AND LOWER(p.name) LIKE LOWER($${i++})`; params.push(`%${filters.patientName}%`); }
    query += ` ORDER BY b.bill_date DESC, b.bill_id DESC`;
    const res = await client.query(query, params);
    return res.rows;
  } finally {
    client.release();
  }
}

async function getPendingBills() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT b.*, p.name as patient_name, p.age, p.gender, p.contact, d.name as doctor_name, a.admission_date, w.name as ward_name,
             (b.total_amount - b.paid_amount) as balance_due
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE b.payment_status IN ('pending','partial')
      ORDER BY CASE b.payment_status WHEN 'partial' THEN 1 WHEN 'pending' THEN 2 END, b.bill_date ASC
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

async function getBillDetails(billId) {
  const client = await pool.connect();
  try {
    const billRes = await client.query(`
      SELECT b.*, p.name as patient_name, p.age, p.gender, p.blood_type, p.contact, p.emergency_contact,
             d.name as doctor_name, d.specialization, w.name as ward_name, bed.bed_number
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE b.bill_id = $1
    `, [billId]);
    if (!billRes.rows.length) return null;
    const bill = billRes.rows[0];
    const items = await client.query(`SELECT * FROM Bill_Item WHERE bill_id = $1 ORDER BY item_id`, [billId]);
    const payments = await client.query(`SELECT * FROM Payment_Transaction WHERE bill_id = $1 ORDER BY transaction_date DESC`, [billId]);
    bill.items = items.rows;
    bill.payments = payments.rows;
    return bill;
  } finally {
    client.release();
  }
}

async function getPatientBillingHistory(patientId) {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT b.*, p.name as patient_name, d.name as doctor_name, w.name as ward_name
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE b.patient_id = $1
      ORDER BY b.bill_date DESC
    `, [patientId]);
    return res.rows;
  } finally {
    client.release();
  }
}

async function getActiveAdmissions() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT a.admission_id, a.patient_id, a.admission_date, a.admission_reason, p.name as patient_name, p.age,
             p.gender, p.is_serious_case, b.bed_number, w.ward_id, w.name as ward_name, w.category as ward_category,
             d.doctor_id, d.name as doctor_name, d.specialization,
             CURRENT_DATE - a.admission_date::date as days_admitted
      FROM IPD_Admission a
      JOIN Patient p ON a.patient_id = p.patient_id
      JOIN Bed b ON a.bed_id = b.bed_id
      JOIN Ward w ON b.ward_id = w.ward_id
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      WHERE a.status = 'active' AND NOT EXISTS (SELECT 1 FROM Bill WHERE Bill.admission_id = a.admission_id)
      ORDER BY a.admission_date ASC
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  getBillingStats,
  getAllBills,
  getPendingBills,
  getBillDetails,
  getPatientBillingHistory,
  getActiveAdmissions
};
