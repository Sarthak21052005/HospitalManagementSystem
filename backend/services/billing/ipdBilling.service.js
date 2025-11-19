// backend/services/billing/ipdBilling.service.js
const pool = require('../../config/database');
const calc = require('./calculations.service');
const { billHasColumn } = require('./billUtils');

/* ================================
   GET ACTIVE ADMISSION (for Billing)
================================ */
async function getPatientAdmissionForBilling(patientId) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        a.admission_id,
        a.patient_id,
        a.admission_date,
        a.admission_reason,
        p.name as patient_name,
        p.age,
        p.gender,
        p.blood_type,
        p.contact,
        p.emergency_contact,
        p.is_serious_case,
        a.bed_id,
        b.bed_number,
        w.ward_id,
        w.name AS ward_name,
        w.category AS ward_category,
        d.doctor_id,
        d.name AS doctor_name,
        d.specialization
      FROM IPD_Admission a
      JOIN Patient p ON a.patient_id = p.patient_id
      LEFT JOIN Bed b ON a.bed_id = b.bed_id         -- 🔥 LEFT JOIN (bed may be NULL)
      LEFT JOIN Ward w ON b.ward_id = w.ward_id
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      WHERE a.patient_id = $1 AND a.status = 'active'
      ORDER BY a.admission_date DESC
      LIMIT 1
    `, [patientId]);

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/* ================================
   CALCULATE BILL (No DB changes)
================================ */
async function calculateIPDBill(admissionId, dischargeDate = null) {
  const client = await pool.connect();
  try {
    const admissionResult = await client.query(`
      SELECT 
        a.*,
        p.name AS patient_name,
        p.age,
        p.gender,
        p.is_serious_case,
        a.bed_id,
        b.bed_number,
        w.name AS ward_name,
        w.category AS ward_category,
        d.name AS doctor_name,
        d.specialization
      FROM IPD_Admission a
      JOIN Patient p ON a.patient_id = p.patient_id
      LEFT JOIN Bed b ON a.bed_id = b.bed_id         -- 🔥 LEFT JOIN (patient may not have bed)
      LEFT JOIN Ward w ON b.ward_id = w.ward_id
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      WHERE a.admission_id = $1
    `, [admissionId]);

    if (admissionResult.rows.length === 0) throw new Error('Admission not found');

    const admission = admissionResult.rows[0];

    /* -------- Days Calculation -------- */
    const discharge = dischargeDate ? new Date(dischargeDate) : new Date();
    const admissionDateObj = new Date(admission.admission_date);
    const days = Math.max(1, Math.ceil((discharge - admissionDateObj) / (1000 * 60 * 60 * 24)));

    /* ==========================================
       🔥 ROOM CHARGE ONLY IF BED EXISTS
    =========================================== */
    const hasBed = admission.bed_id !== null;
    let wardRate = 0;
    let roomCharges = 0;

    if (hasBed) {
      wardRate = calc.RATES.WARD_RATES[admission.ward_name] || calc.RATES.WARD_RATES["General Ward"];
      roomCharges = days * wardRate;
    }

    /* -------- Other Charges -------- */
    const consult = await calc.getConsultationCharges(client, admission.patient_id, admission.admission_date);
    const lab = await calc.getLabCharges(client, admission.patient_id, admission.admission_date);
    const meds = await calc.getMedicineCharges(client, admission.patient_id, admission.admission_date);

    const nursing = await calc.getNursingCharges(
      client,
      admission.patient_id,
      admission.admission_date,
      null,
      days
    );

    const emergencyCharges = admission.is_serious_case ? calc.RATES.EMERGENCY_SURCHARGE : 0;
    const equipmentCharges = await calc.getEquipmentCharges(client, admission.patient_id, admission.admission_date);

    /* -------- Totals -------- */
    const subtotal =
      roomCharges +
      consult.total +
      lab.total +
      meds.total +
      nursing.total +
      emergencyCharges +
      equipmentCharges;

    const taxAmount = calc.computeTax(subtotal);
    const totalAmount = +(subtotal + taxAmount).toFixed(2);

    return {
      admission_id: admissionId,
      patient_id: admission.patient_id,
      patient_name: admission.patient_name,
      age: admission.age,
      gender: admission.gender,
      ward_name: admission.ward_name,
      bed_number: admission.bed_number,
      hasBed,
      doctor_name: admission.doctor_name,
      specialization: admission.specialization,
      admission_date: admission.admission_date,
      discharge_date: discharge.toISOString().split('T')[0],
      total_days: days,

      breakdown: {
        room: {
          hasBed,
          days: hasBed ? days : 0,
          rate: hasBed ? wardRate : 0,
          total: roomCharges
        },
        consultation: { ...consult },
        lab: { ...lab },
        medicines: { ...meds },
        nursing: { total: nursing.total, vitalCount: nursing.vitalCount },
        emergency: { applicable: admission.is_serious_case, total: emergencyCharges },
        equipment: { total: equipmentCharges }
      },

      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    };
  } finally {
    client.release();
  }
}

/* ================================
   GENERATE BILL (writes to DB)
================================ */
async function generateIPDBill(admissionId, dischargeDate, discount = 0, paymentMethod = null, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const calculation = await calculateIPDBill(admissionId, dischargeDate);

    /* -------- Discounts -------- */
    const discountAmount =
      discount > 0 ? +(calculation.total_amount * discount / 100).toFixed(2) : 0;

    const finalAmount = +(calculation.total_amount - discountAmount).toFixed(2);

    /* -------- Dynamic Column Insert -------- */
    const hasSubtotal = await billHasColumn(client, "subtotal");
    const hasTax = await billHasColumn(client, "tax_amount");
    const hasDiscount = await billHasColumn(client, "discount");

    const columns = ["admission_id", "patient_id"];
    const params = [admissionId, calculation.patient_id];

    if (hasSubtotal) { columns.push("subtotal"); params.push(calculation.subtotal); }
    if (hasTax) { columns.push("tax_amount"); params.push(calculation.tax_amount); }
    if (hasDiscount) { columns.push("discount"); params.push(discountAmount); }

    columns.push("total_amount", "paid_amount", "payment_status", "payment_method");
    params.push(finalAmount, 0, "pending", (paymentMethod || "CASH").toUpperCase());

    const placeholders = params.map((_, i) => `$${i + 1}`);
    const insertQuery = `
      INSERT INTO Bill (${columns.join(",")})
      VALUES (${placeholders.join(",")})
      RETURNING *
    `;

    const billRes = await client.query(insertQuery, params);
    const bill = billRes.rows[0];

    /* -------- BILL ITEMS -------- */
    const items = [];

    // ROOM only if bed exists
    if (calculation.breakdown.room.total > 0) {
      items.push({
        item_type: "ROOM",
        description: `${calculation.ward_name} - Bed ${calculation.bed_number} (${calculation.total_days} days @ ₹${calculation.breakdown.room.rate}/day)`,
        quantity: calculation.total_days,
        unit_price: calculation.breakdown.room.rate,
        total_price: calculation.breakdown.room.total
      });
    }

    // CONSULT
    if (calculation.breakdown.consultation.total > 0) {
      items.push({
        item_type: "CONSULTATION",
        description: `Doctor Consultation - ${calculation.breakdown.consultation.count} visits`,
        quantity: calculation.breakdown.consultation.count,
        unit_price: calc.RATES.CONSULTATION,
        total_price: calculation.breakdown.consultation.total
      });
    }

    // LAB
    if (calculation.breakdown.lab.total > 0) {
      items.push({
        item_type: "LAB_TEST",
        description: `Lab Tests - ${calculation.breakdown.lab.count}`,
        quantity: calculation.breakdown.lab.count,
        unit_price: calculation.breakdown.lab.total / Math.max(1, calculation.breakdown.lab.count),
        total_price: calculation.breakdown.lab.total
      });
    }

    // MEDICINES
    if (calculation.breakdown.medicines.total > 0) {
      items.push({
        item_type: "MEDICINE",
        description: `Medicines - ${calculation.breakdown.medicines.count}`,
        quantity: calculation.breakdown.medicines.count,
        unit_price: calculation.breakdown.medicines.total / Math.max(1, calculation.breakdown.medicines.count),
        total_price: calculation.breakdown.medicines.total
      });
    }

    // NURSING
    if (calculation.breakdown.nursing.total > 0) {
      items.push({
        item_type: "NURSING",
        description: "Nursing Care",
        quantity: 1,
        unit_price: calculation.breakdown.nursing.total,
        total_price: calculation.breakdown.nursing.total
      });
    }

    // EQUIPMENT
    if (calculation.breakdown.equipment.total > 0) {
      items.push({
        item_type: "EQUIPMENT",
        description: "Equipment Usage",
        quantity: 1,
        unit_price: calculation.breakdown.equipment.total,
        total_price: calculation.breakdown.equipment.total
      });
    }

    // TAX
    if (calculation.tax_amount > 0) {
      items.push({
        item_type: "TAX",
        description: `GST @ ${calc.RATES.TAX_RATE * 100}%`,
        quantity: 1,
        unit_price: calculation.tax_amount,
        total_price: calculation.tax_amount
      });
    }

    // DISCOUNT
    if (discountAmount > 0) {
      items.push({
        item_type: "DISCOUNT",
        description: `Discount - ${discount}%`,
        quantity: 1,
        unit_price: -Math.abs(discountAmount),
        total_price: -Math.abs(discountAmount)
      });
    }

    // Insert each bill item
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

    await client.query("COMMIT");

    return {
      ...bill,
      breakdown: calculation.breakdown,
      subtotal: calculation.subtotal,
      tax_amount: calculation.tax_amount,
      discount_amount: discountAmount,
      total_amount: finalAmount
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getPatientAdmissionForBilling,
  calculateIPDBill,
  generateIPDBill
};
