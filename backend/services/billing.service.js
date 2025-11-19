// services/billing.service.js
const pool = require('../config/database');

// ===== BILLING RATES & CONFIGURATION =====
const RATES = {
  CONSULTATION: 500,
  WARD_RATES: {
    'General Ward': 800,
    'ICU': 5000,
    'Pediatric Ward': 1200,
    'Emergency Ward': 2000,
    'Maternity Ward': 1500
  },
  LAB_TEST_BASE: 300,
  NURSING_CARE_PER_DAY: 200,
  VITAL_SIGNS_RECORDING: 100,
  EMERGENCY_SURCHARGE: 2000,
  TAX_RATE: 0.18 // 18% GST
};

// ----------------------
// Helper: check if column exists in Bill table
// ----------------------
async function billHasColumn(client, columnName) {
  const q = `
    SELECT COUNT(*)::int AS cnt
    FROM information_schema.columns
    WHERE table_name = 'bill' AND column_name = $1
  `;
  const res = await client.query(q, [columnName]);
  return res.rows[0].cnt > 0;
}

// ===== FIXED: GET BILLING STATS =====
exports.getBillingStats = async () => {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const [pendingResult, paidTodayResult, monthlyResult, overdueResult] = await Promise.all([
      // pending + partial
      client.query(`
        SELECT COUNT(*) as count, 
               COALESCE(SUM(total_amount - paid_amount), 0) as total_pending
        FROM Bill
        WHERE payment_status IN ('pending', 'partial')
      `),

      // Paid today
      client.query(
        `
        SELECT COALESCE(SUM(paid_amount), 0) as total_paid_today
        FROM Bill
        WHERE bill_date = $1 AND payment_status = 'paid'
      `,
        [today]
      ),

      // Monthly revenue (paid or partial)
      client.query(
        `
        SELECT COALESCE(SUM(paid_amount), 0) as monthly_revenue
        FROM Bill
        WHERE bill_date >= $1 
        AND payment_status IN ('paid', 'partial')
      `,
        [firstDayOfMonth]
      ),

      // Overdue > 7 days (only pending)
      client.query(`
        SELECT COUNT(*) as count
        FROM Bill
        WHERE payment_status = 'pending'
        AND bill_date < CURRENT_DATE - INTERVAL '7 days'
      `)
    ]);

    return {
      pendingBills: parseInt(pendingResult.rows[0].count, 10),
      pendingAmount: parseFloat(pendingResult.rows[0].total_pending),
      paidToday: parseFloat(paidTodayResult.rows[0].total_paid_today),
      monthlyRevenue: parseFloat(monthlyResult.rows[0].monthly_revenue),
      overdueBills: parseInt(overdueResult.rows[0].count, 10)
    };
  } finally {
    client.release();
  }
};

// ===== GET PATIENT ADMISSION FOR BILLING =====
exports.getPatientAdmissionForBilling = async (patientId) => {
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
        b.bed_id,
        b.bed_number,
        w.ward_id,
        w.name as ward_name,
        w.category as ward_category,
        d.doctor_id,
        d.name as doctor_name,
        d.specialization
      FROM IPD_Admission a
      JOIN Patient p ON a.patient_id = p.patient_id
      JOIN Bed b ON a.bed_id = b.bed_id
      JOIN Ward w ON b.ward_id = w.ward_id
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      WHERE a.patient_id = $1 AND a.status = 'active'
      ORDER BY a.admission_date DESC
      LIMIT 1
    `, [patientId]);
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

// ===== CALCULATE BILL (PREVIEW) =====
exports.calculateBill = async (admissionId, dischargeDate = null) => {
  const client = await pool.connect();
  try {
    // Get admission details
    const admissionResult = await client.query(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.age,
        p.gender,
        p.is_serious_case,
        b.bed_number,
        w.name as ward_name,
        w.category as ward_category,
        d.name as doctor_name,
        d.specialization
      FROM IPD_Admission a
      JOIN Patient p ON a.patient_id = p.patient_id
      JOIN Bed b ON a.bed_id = b.bed_id
      JOIN Ward w ON b.ward_id = w.ward_id
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      WHERE a.admission_id = $1
    `, [admissionId]);
    
    if (admissionResult.rows.length === 0) {
      throw new Error('Admission not found');
    }
    
    const admission = admissionResult.rows[0];
    const discharge = dischargeDate ? new Date(dischargeDate) : new Date();
    const admissionDateObj = new Date(admission.admission_date);
    
    // Calculate days (minimum 1 day)
    const days = Math.max(1, Math.ceil((discharge - admissionDateObj) / (1000 * 60 * 60 * 24)));
    
    // 1. Room Charges
    const wardRate = RATES.WARD_RATES[admission.ward_name] || RATES.WARD_RATES['General Ward'];
    const roomCharges = days * wardRate;
    
    // 2. Consultation Fees (Medical Records)
    const consultationResult = await client.query(`
      SELECT COUNT(*) as count
      FROM Medical_Record
      WHERE patient_id = $1 AND visit_date >= $2
    `, [admission.patient_id, admission.admission_date]);
    const consultationCount = parseInt(consultationResult.rows[0].count, 10);
    const consultationFee = consultationCount * RATES.CONSULTATION;
    
    // 3. Lab Charges
    const labResult = await client.query(`
      SELECT COALESCE(SUM(ltc.cost), 0) as total_lab_cost, COUNT(lot.test_id) as test_count
      FROM Lab_Order lo
      JOIN Lab_Order_Test lot ON lo.order_id = lot.order_id
      JOIN Lab_Test_Catalog ltc ON lot.test_id = ltc.test_id
      WHERE lo.patient_id = $1 
        AND lo.order_date >= $2
        AND lo.status = 'COMPLETED'
    `, [admission.patient_id, admission.admission_date]);
    const labCharges = parseFloat(labResult.rows[0].total_lab_cost) || 0;
    const labTestCount = parseInt(labResult.rows[0].test_count, 10) || 0;
    
    // 4. Medicine Charges (Prescriptions)
    const medicineResult = await client.query(`
      SELECT COALESCE(SUM(mi.unit_price * p.quantity_prescribed), 0) as total_medicine_cost,
             COUNT(p.prescription_id) as medicine_count
      FROM Prescription p
      LEFT JOIN Medical_Inventory mi ON LOWER(p.medicine_name) = LOWER(mi.item_name)
      WHERE p.patient_id = $1 AND p.prescribed_date >= $2
    `, [admission.patient_id, admission.admission_date]);
    const medicineCharges = parseFloat(medicineResult.rows[0].total_medicine_cost) || 0;
    const medicineCount = parseInt(medicineResult.rows[0].medicine_count, 10) || 0;
    
    // 5. Nursing Charges (Vital Signs)
    const vitalResult = await client.query(`
      SELECT COUNT(*) as count
      FROM Vital_Signs
      WHERE patient_id = $1 AND recorded_at >= $2
    `, [admission.patient_id, admission.admission_date]);
    const vitalCount = parseInt(vitalResult.rows[0].count, 10) || 0;
    const nursingCharges = (days * RATES.NURSING_CARE_PER_DAY) + (vitalCount * RATES.VITAL_SIGNS_RECORDING);
    
    // 6. Emergency Charges
    const emergencyCharges = admission.is_serious_case ? RATES.EMERGENCY_SURCHARGE : 0;
    
    // 7. Equipment Charges (if any inventory items were used)
    const equipmentResult = await client.query(`
      SELECT COALESCE(SUM(ABS(quantity_changed) * mi.unit_price), 0) as equipment_cost
      FROM Inventory_Transaction it
      JOIN Medical_Inventory mi ON it.item_id = mi.item_id
      WHERE it.transaction_type = 'usage'
        AND it.transaction_date >= $1
        AND it.reason LIKE '%patient ' || $2 || '%'
    `, [admission.admission_date, admission.patient_id]);
    const equipmentCharges = parseFloat(equipmentResult.rows[0].equipment_cost) || 0;
    
    // Calculate Subtotal
    const subtotal = roomCharges + consultationFee + labCharges + medicineCharges + 
                     nursingCharges + emergencyCharges + equipmentCharges;
    
    // Calculate Tax
    const taxAmount = +(subtotal * RATES.TAX_RATE).toFixed(2);
    
    // Calculate Total
    const totalAmount = +(subtotal + taxAmount).toFixed(2);
    
    return {
      admission_id: admissionId,
      patient_id: admission.patient_id,
      patient_name: admission.patient_name,
      age: admission.age,
      gender: admission.gender,
      ward_name: admission.ward_name,
      bed_number: admission.bed_number,
      doctor_name: admission.doctor_name,
      specialization: admission.specialization,
      admission_date: admission.admission_date,
      discharge_date: discharge.toISOString().split('T')[0],
      total_days: days,
      is_serious_case: admission.is_serious_case,
      breakdown: {
        room: {
          days,
          rate: wardRate,
          total: roomCharges
        },
        consultation: {
          count: consultationCount,
          rate: RATES.CONSULTATION,
          total: consultationFee
        },
        lab: {
          count: labTestCount,
          total: labCharges
        },
        medicines: {
          count: medicineCount,
          total: medicineCharges
        },
        nursing: {
          days,
          vitalCount,
          total: nursingCharges
        },
        emergency: {
          applicable: admission.is_serious_case,
          total: emergencyCharges
        },
        equipment: {
          total: equipmentCharges
        }
      },
      subtotal,
      tax_rate: RATES.TAX_RATE,
      tax_amount: taxAmount,
      total_amount: totalAmount
    };
  } finally {
    client.release();
  }
};

// ===== FIXED & ROBUST: GENERATE FINAL BILL =====
// This version writes only columns present in DB; if subtotal/tax/discount are present they are included.
exports.generateBill = async (admissionId, dischargeDate, discount = 0, paymentMethod = null, adminId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Calculate bill preview
    const calculation = await exports.calculateBill(admissionId, dischargeDate);

    // 2) Discount logic (percentage)
    const discountAmount = discount > 0 ? +(calculation.total_amount * discount / 100).toFixed(2) : 0;
    const finalAmount = +(calculation.total_amount - discountAmount).toFixed(2);

    // 3) Determine available columns in Bill table
    const hasSubtotal = await billHasColumn(client, 'subtotal');
    const hasTax = await billHasColumn(client, 'tax_amount');
    const hasDiscount = await billHasColumn(client, 'discount');
    const hasUpdatedAt = await billHasColumn(client, 'updated_at');

    // Build INSERT dynamically
    const cols = ['admission_id', 'patient_id', 'bill_date', 'total_amount', 'paid_amount', 'payment_status', 'payment_method'];
    const placeholders = ['$1','$2','CURRENT_DATE','$3', '0', "'pending'", '$4']; 
    // We'll adjust placeholders/values to be safe and parameterized
    const values = [admissionId, calculation.patient_id, finalAmount, (paymentMethod || 'CASH').toUpperCase()];

    // If DB supports subtotal/tax/discount, insert them before total_amount (so adjust positions)
    // We'll create a clean param list instead of relying on the earlier placeholder list
    const insertCols = ['admission_id','patient_id','bill_date'];
    const insertVals = [];
    const insertParams = [];
    let paramIndex = 1;

    insertCols.push('total_amount'); // always save total_amount
    // build dynamic column list and params
    const columnsToInsert = ['admission_id','patient_id','bill_date'];
    const params = [];
    // admission_id, patient_id handled via params
    params.push(admissionId); // $1
    params.push(calculation.patient_id); // $2

    if (hasSubtotal) {
      columnsToInsert.push('subtotal');
      params.push(calculation.subtotal); // $3 if present
    }
    if (hasTax) {
      columnsToInsert.push('tax_amount');
      params.push(calculation.tax_amount);
    }
    if (hasDiscount) {
      columnsToInsert.push('discount');
      params.push(discountAmount);
    }

    // always: total_amount, paid_amount (0), payment_status, payment_method, created_at is default
    columnsToInsert.push('total_amount');
    params.push(finalAmount);

    columnsToInsert.push('paid_amount');
    params.push(0);

    columnsToInsert.push('payment_status');
    params.push('pending');

    columnsToInsert.push('payment_method');
    params.push((paymentMethod || 'CASH').toUpperCase());

    // Build SQL placeholders
    const placeholdersArr = params.map((_, i) => `$${i+1}`);
    const insertQuery = `
      INSERT INTO Bill (${columnsToInsert.join(',')})
      VALUES (${placeholdersArr.join(',')})
      RETURNING *
    `;

    // Insert bill
    const billResult = await client.query(insertQuery, params);
    const bill = billResult.rows[0];

    // 4) Insert bill items (detailed breakdown)
    const billItems = [];

    if (calculation.breakdown.room.total > 0) {
      billItems.push({
        item_type: 'ROOM',
        description: `${calculation.ward_name} - Bed ${calculation.bed_number} (${calculation.total_days} days @ ₹${calculation.breakdown.room.rate}/day)`,
        quantity: calculation.total_days,
        unit_price: calculation.breakdown.room.rate,
        total_price: calculation.breakdown.room.total
      });
    }

    if (calculation.breakdown.consultation.total > 0) {
      billItems.push({
        item_type: 'CONSULTATION',
        description: `Doctor Consultation - ${calculation.breakdown.consultation.count} visits @ ₹${RATES.CONSULTATION}/visit`,
        quantity: calculation.breakdown.consultation.count,
        unit_price: RATES.CONSULTATION,
        total_price: calculation.breakdown.consultation.total
      });
    }

    if (calculation.breakdown.lab.total > 0) {
      billItems.push({
        item_type: 'LAB_TEST',
        description: `Laboratory Tests - ${calculation.breakdown.lab.count} tests`,
        quantity: calculation.breakdown.lab.count,
        unit_price: calculation.breakdown.lab.total / Math.max(1, calculation.breakdown.lab.count),
        total_price: calculation.breakdown.lab.total
      });
    }

    if (calculation.breakdown.medicines.total > 0) {
      billItems.push({
        item_type: 'MEDICINE',
        description: `Prescribed Medicines - ${calculation.breakdown.medicines.count} items`,
        quantity: calculation.breakdown.medicines.count,
        unit_price: calculation.breakdown.medicines.total / Math.max(1, calculation.breakdown.medicines.count),
        total_price: calculation.breakdown.medicines.total
      });
    }

    if (calculation.breakdown.nursing.total > 0) {
      billItems.push({
        item_type: 'NURSING',
        description: `Nursing Care - ${calculation.total_days} days + ${calculation.breakdown.nursing.vitalCount} vitals`,
        quantity: 1,
        unit_price: calculation.breakdown.nursing.total,
        total_price: calculation.breakdown.nursing.total
      });
    }

    if (calculation.breakdown.emergency.total > 0) {
      billItems.push({
        item_type: 'EMERGENCY',
        description: `Emergency Surcharge`,
        quantity: 1,
        unit_price: calculation.breakdown.emergency.total,
        total_price: calculation.breakdown.emergency.total
      });
    }

    if (calculation.breakdown.equipment.total > 0) {
      billItems.push({
        item_type: 'EQUIPMENT',
        description: `Medical Equipment Usage`,
        quantity: 1,
        unit_price: calculation.breakdown.equipment.total,
        total_price: calculation.breakdown.equipment.total
      });
    }

    // Tax item
    if (calculation.tax_amount > 0) {
      billItems.push({
        item_type: 'TAX',
        description: `GST @ ${RATES.TAX_RATE * 100}%`,
        quantity: 1,
        unit_price: calculation.tax_amount,
        total_price: calculation.tax_amount
      });
    }

    // Discount (as negative line)
    if (discountAmount > 0) {
      billItems.push({
        item_type: 'DISCOUNT',
        description: `Discount - ${discount}%`,
        quantity: 1,
        unit_price: -Math.abs(discountAmount),
        total_price: -Math.abs(discountAmount)
      });
    }

    // Insert bill items
    const insertItemQuery = `
      INSERT INTO Bill_Item (bill_id, item_type, description, quantity, unit_price, total_price)
      VALUES ($1,$2,$3,$4,$5,$6)
    `;
    for (const item of billItems) {
      await client.query(insertItemQuery, [
        bill.bill_id,
        item.item_type,
        item.description,
        item.quantity,
        item.unit_price,
        item.total_price
      ]);
    }

    // 5) Optionally discharge patient and free bed if desired here (existing behavior)
    // NOTE: Current workflow in your schema expects discharge on full payment, but generateBill previously discharged automatically.
    // We'll keep minimal behavior: don't force discharge here (since generateBill was used to finalize billing and discharge earlier).
    // If you want auto-discharge at bill generation, uncomment the following block:

    /*
    await client.query(`
      UPDATE IPD_Admission
      SET status = 'discharged',
          discharge_date = $1
      WHERE admission_id = $2
    `, [calculation.discharge_date, admissionId]);

    await client.query(`
      UPDATE Bed
      SET status = 'available',
          current_patient_id = NULL
      WHERE bed_id = (
        SELECT bed_id FROM IPD_Admission WHERE admission_id = $1
      )
    `, [admissionId]);

    await client.query(`
      UPDATE Patient 
      SET date_discharge = $1
      WHERE patient_id = $2
    `, [calculation.discharge_date, calculation.patient_id]);
    */

    await client.query('COMMIT');

    return {
      ...bill,
      patient_name: calculation.patient_name,
      ward_name: calculation.ward_name,
      doctor_name: calculation.doctor_name,
      breakdown: calculation.breakdown,
      subtotal: calculation.subtotal,
      tax_amount: calculation.tax_amount,
      discount_amount: discountAmount,
      total_amount: finalAmount
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error generating bill:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ===== GET ALL BILLS WITH FILTERS =====
exports.getAllBills = async (filters = {}) => {
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        b.*,
        p.name as patient_name,
        p.age,
        p.gender,
        d.name as doctor_name,
        a.admission_date,
        w.name as ward_name
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Filter by payment status - include both 'pending' AND 'partial'
    if (filters.status) {
      if (filters.status === 'pending') {
        // Show both pending and partial bills
        query += ` AND b.payment_status IN ('pending', 'partial')`;
      } else {
        // For other statuses (paid, overdue), show exact match
        query += ` AND b.payment_status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }
    }
    
    // Filter by date range
    if (filters.from) {
      query += ` AND b.bill_date >= $${paramCount}`;
      params.push(filters.from);
      paramCount++;
    }
    
    if (filters.to) {
      query += ` AND b.bill_date <= $${paramCount}`;
      params.push(filters.to);
      paramCount++;
    }
    
    // Search by patient name
    if (filters.patientName) {
      query += ` AND LOWER(p.name) LIKE LOWER($${paramCount})`;
      params.push(`%${filters.patientName}%`);
      paramCount++;
    }
    
    query += ` ORDER BY b.bill_date DESC, b.bill_id DESC`;
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// ===== GET PENDING BILLS (pending + partial) =====
exports.getPendingBills = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        b.*,
        p.name as patient_name,
        p.age,
        p.gender,
        p.contact,
        d.name as doctor_name,
        a.admission_date,
        w.name as ward_name,
        (b.total_amount - b.paid_amount) as balance_due
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE b.payment_status IN ('pending', 'partial')
      ORDER BY 
        CASE b.payment_status
          WHEN 'partial' THEN 1
          WHEN 'pending' THEN 2
        END,
        b.bill_date ASC
    `);
    
    return result.rows;
  } finally {
    client.release();
  }
};

// ===== GET BILL DETAILS =====
exports.getBillDetails = async (billId) => {
  const client = await pool.connect();
  try {
    // Get bill with related information
    const billResult = await client.query(`
      SELECT 
        b.*,
        p.name as patient_name,
        p.age,
        p.gender,
        p.blood_type,
        p.contact,
        p.emergency_contact,
        d.name as doctor_name,
        d.specialization,
        w.name as ward_name,
        bed.bed_number
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE b.bill_id = $1
    `, [billId]);
    
    if (billResult.rows.length === 0) { 
      return null;
    }
    
    const bill = billResult.rows[0];
    
    // Get bill items
    const itemsResult = await client.query(`
      SELECT * FROM Bill_Item
      WHERE bill_id = $1
      ORDER BY item_id
    `, [billId]);
    
    bill.items = itemsResult.rows;
    
    // Get payment transactions
    const paymentsResult = await client.query(`
      SELECT * FROM Payment_Transaction
      WHERE bill_id = $1
      ORDER BY transaction_date DESC
    `, [billId]);
    
    bill.payments = paymentsResult.rows;
    
    return bill;
  } finally {
    client.release();
  }
};

// ===== UPDATE BILL =====
exports.updateBill = async (billId, updates) => {
  const client = await pool.connect();
  try {
    const allowedFields = ['discount', 'payment_method', 'payment_status'];
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    setClause.push(`created_at = created_at`); // keep created_at as-is
    values.push(billId);
    
    const query = `
      UPDATE Bill 
      SET ${setClause.join(', ')}
      WHERE bill_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
};

// ===== DELETE BILL (SOFT DELETE) =====
exports.deleteBill = async (billId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if bill has payments
    const paymentCheck = await client.query(`
      SELECT COUNT(*) as count FROM Payment_Transaction
      WHERE bill_id = $1
    `, [billId]);
    
    if (parseInt(paymentCheck.rows[0].count, 10) > 0) {
      throw new Error('Cannot delete bill with payment history');
    }
    
    // Delete bill items first (due to foreign key)
    await client.query(`DELETE FROM Bill_Item WHERE bill_id = $1`, [billId]);
    
    // Delete bill
    await client.query(`DELETE FROM Bill WHERE bill_id = $1`, [billId]);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ===== PROCESS PAYMENT =====
exports.processPayment = async (billId, amount, paymentMethod, referenceNumber, adminId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get current bill
    const billResult = await client.query(`
      SELECT * FROM Bill WHERE bill_id = $1 FOR UPDATE
    `, [billId]);
    
    if (billResult.rows.length === 0) {
      throw new Error('Bill not found');
    }
    
    const bill = billResult.rows[0];
    const currentPaid = parseFloat(bill.paid_amount) || 0;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Invalid payment amount');
    }
    const newPaidAmount = +(currentPaid + parsedAmount).toFixed(2);
    const totalAmount = parseFloat(bill.total_amount) || 0;
    
    // Determine payment status
    let paymentStatus;
    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'pending';
    }
    
    // Normalize payment method
    const normalizedPaymentMethod = (paymentMethod || 'CASH').toUpperCase();
    
    // Insert payment transaction
    const paymentResult = await client.query(`
      INSERT INTO Payment_Transaction (
        bill_id, amount, payment_method, reference_number, status, notes
      ) VALUES ($1, $2, $3, $4, 'SUCCESS', $5)
      RETURNING *
    `, [
      billId,
      parsedAmount,
      // Payment_Transaction has a CHECK that expects specific casing (Cash, Card, UPI, Bank Transfer, Insurance).
      // We'll insert with Title Case to satisfy the CHECK (fallback to 'Cash' if not matched).
      (function normalizeForTransaction(pm) {
        const up = pm.toUpperCase();
        if (up.includes('CARD')) return 'Card';
        if (up.includes('UPI')) return 'UPI';
        if (up.includes('BANK')) return 'Bank Transfer';
        if (up.includes('INSURANCE')) return 'Insurance';
        return 'Cash';
      })(normalizedPaymentMethod),
      referenceNumber || `PAY-${Date.now()}`,
      `Payment of ₹${parsedAmount} processed by ${adminId || 'admin'}`
    ]);
    
    // Update bill
    await client.query(`
      UPDATE Bill 
      SET paid_amount = $1,
          payment_status = $2,
          payment_method = $3
      WHERE bill_id = $4
    `, [newPaidAmount, paymentStatus, normalizedPaymentMethod, billId]);
    
    // If fully paid, discharge patient automatically
    if (paymentStatus === 'paid' && bill.admission_id) {
      await client.query(`
        UPDATE IPD_Admission
        SET status = 'discharged',
            discharge_date = CURRENT_DATE,
            discharge_time = CURRENT_TIME,
            discharge_summary = 'Payment completed - Patient discharged'
        WHERE admission_id = $1
      `, [bill.admission_id]);
      
      await client.query(`
        UPDATE Bed
        SET status = 'available',
            current_patient_id = NULL
        WHERE bed_id = (
          SELECT bed_id FROM IPD_Admission WHERE admission_id = $1
        )
      `, [bill.admission_id]);
    }
    
    await client.query('COMMIT');
    
    console.log(`✅ Payment processed: ₹${parsedAmount} for Bill ID ${billId}. New balance: ₹${(totalAmount - newPaidAmount).toFixed(2)}`);
    
    return {
      ...paymentResult.rows[0],
      bill_id: billId,
      new_paid_amount: newPaidAmount,
      remaining_balance: +(totalAmount - newPaidAmount).toFixed(2),
      payment_status: paymentStatus,
      patient_discharged: paymentStatus === 'paid' && bill.admission_id ? true : false
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error processing payment:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ===== UPDATE PAYMENT STATUS =====
exports.updatePaymentStatus = async (billId, status) => {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE Bill 
      SET payment_status = $1,
          created_at = created_at
      WHERE bill_id = $2
    `, [status, billId]);
  } finally {
    client.release();
  }
};

// ===== GET INVOICE =====
exports.getInvoice = async (billId) => {
  return await exports.getBillDetails(billId);
};

// ===== GET PATIENT BILLING HISTORY =====
exports.getPatientBillingHistory = async (patientId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        b.*,
        p.name as patient_name,
        d.name as doctor_name,
        w.name as ward_name
      FROM Bill b
      JOIN Patient p ON b.patient_id = p.patient_id
      LEFT JOIN IPD_Admission a ON b.admission_id = a.admission_id
      LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN Bed bed ON a.bed_id = bed.bed_id
      LEFT JOIN Ward w ON bed.ward_id = w.ward_id
      WHERE b.patient_id = $1
      ORDER BY b.bill_date DESC
    `, [patientId]);
    
    return result.rows;
  } finally {
    client.release();
  }
};

// ===== GET ACTIVE ADMISSIONS (READY FOR DISCHARGE) =====
exports.getActiveAdmissions = async () => {
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
        p.is_serious_case,
        b.bed_number,
        w.ward_id,
        w.name as ward_name,
        w.category as ward_category,
        d.doctor_id,
        d.name as doctor_name,
        d.specialization,
        CURRENT_DATE - a.admission_date::date as days_admitted
      FROM IPD_Admission a
      JOIN Patient p ON a.patient_id = p.patient_id
      JOIN Bed b ON a.bed_id = b.bed_id
      JOIN Ward w ON b.ward_id = w.ward_id
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      WHERE a.status = 'active'
        AND NOT EXISTS (
          SELECT 1 FROM Bill 
          WHERE Bill.admission_id = a.admission_id
        )
      ORDER BY a.admission_date ASC
    `);
    
    return result.rows;
  } finally {
    client.release();
  }
};
