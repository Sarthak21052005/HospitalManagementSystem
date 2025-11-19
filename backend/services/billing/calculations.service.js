// backend/services/billing/calculations.service.js
const pool = require('../../config/database');

const RATES = {
  CONSULTATION: 500,
  WARD_RATES: {
    'General Ward': 800,
    'ICU': 5000,
    'Pediatric Ward': 1200,
    'Emergency Ward': 2000,
    'Maternity Ward': 1500
  },
  NURSING_CARE_PER_DAY: 200,
  VITAL_SIGNS_RECORDING: 100,
  EMERGENCY_SURCHARGE: 2000,
  TAX_RATE: 0.18
};

async function getConsultationCharges(client, patientId, fromDate = null) {
  const q = `
    SELECT COUNT(*) as count
    FROM Medical_Record
    WHERE patient_id = $1
    ${fromDate ? `AND visit_date >= $2` : ''}
  `;
  const params = fromDate ? [patientId, fromDate] : [patientId];
  const res = await client.query(q, params);
  const count = parseInt(res.rows[0].count, 10) || 0;
  return { count, total: count * RATES.CONSULTATION };
}

async function getLabCharges(client, patientId, fromDate = null, toDate = null) {
  let q = `
    SELECT COALESCE(SUM(ltc.cost), 0) as total_lab_cost, COUNT(lot.test_id) as test_count
    FROM Lab_Order lo
    JOIN Lab_Order_Test lot ON lo.order_id = lot.order_id
    JOIN Lab_Test_Catalog ltc ON lot.test_id = ltc.test_id
    WHERE lo.patient_id = $1
      AND lo.status = 'COMPLETED'
  `;
  const params = [patientId];
  if (fromDate) {
    params.push(fromDate);
    q += ` AND lo.order_date >= $${params.length}`;
  }
  if (toDate) {
    params.push(toDate);
    q += ` AND lo.order_date <= $${params.length}`;
  }
  const res = await client.query(q, params);
  return {
    total: parseFloat(res.rows[0].total_lab_cost) || 0,
    count: parseInt(res.rows[0].test_count, 10) || 0
  };
}

async function getMedicineCharges(client, patientId, fromDate = null, toDate = null) {
  let q = `
    SELECT COALESCE(SUM(mi.unit_price * p.quantity_prescribed), 0) as total_medicine_cost,
           COUNT(p.prescription_id) as medicine_count
    FROM Prescription p
    LEFT JOIN Medical_Inventory mi ON LOWER(p.medicine_name) = LOWER(mi.item_name)
    WHERE p.patient_id = $1
  `;
  const params = [patientId];
  if (fromDate) {
    params.push(fromDate);
    q += ` AND p.prescribed_date >= $${params.length}`;
  }
  if (toDate) {
    params.push(toDate);
    q += ` AND p.prescribed_date <= $${params.length}`;
  }
  const res = await client.query(q, params);
  return {
    total: parseFloat(res.rows[0].total_medicine_cost) || 0,
    count: parseInt(res.rows[0].medicine_count, 10) || 0
  };
}

async function getNursingCharges(client, patientId, admissionDate, toDate = null, days = 0) {
  // Nursing charges only meaningful for IPD; include vital sign recording count
  let q = `
    SELECT COUNT(*) as count
    FROM Vital_Signs
    WHERE patient_id = $1
      AND recorded_at >= $2
  `;
  const params = [patientId, admissionDate];
  if (toDate) {
    params.push(toDate);
    q += ` AND recorded_at <= $${params.length}`;
  }
  const res = await client.query(q, params);
  const vitalCount = parseInt(res.rows[0].count, 10) || 0;
  const nursing = (days * RATES.NURSING_CARE_PER_DAY) + (vitalCount * RATES.VITAL_SIGNS_RECORDING);
  return { total: nursing, vitalCount };
}

async function getEquipmentCharges(client, patientId, fromDate = null, toDate = null) {
  let q = `
    SELECT COALESCE(SUM(ABS(quantity_changed) * mi.unit_price), 0) as equipment_cost
    FROM Inventory_Transaction it
    JOIN Medical_Inventory mi ON it.item_id = mi.item_id
    WHERE it.transaction_type = 'usage'
      AND it.reason LIKE '%patient ' || $1 || '%'
  `;
  const params = [patientId];
  if (fromDate) {
    params.push(fromDate);
    q += ` AND it.transaction_date >= $${params.length}`;
  }
  if (toDate) {
    params.push(toDate);
    q += ` AND it.transaction_date <= $${params.length}`;
  }
  const res = await client.query(q, params);
  return parseFloat(res.rows[0].equipment_cost) || 0;
}

function computeTax(amount) {
  return +(amount * RATES.TAX_RATE).toFixed(2);
}

module.exports = {
  RATES,
  getConsultationCharges,
  getLabCharges,
  getMedicineCharges,
  getNursingCharges,
  getEquipmentCharges,
  computeTax
};
