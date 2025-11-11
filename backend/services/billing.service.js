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

// ===== GET BILLING STATS =====
exports.getBillingStats = async () => {
  const client = await pool.connect();
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    const [pendingResult, paidTodayResult, monthlyResult, overdueResult] = await Promise.all([
      // Pending bills
      client.query(`
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount - paid_amount), 0) as total_pending
        FROM Bill
        WHERE payment_status = 'pending'
      `),
      
      // Paid today
      client.query(`
        SELECT COALESCE(SUM(paid_amount), 0) as total_paid_today
        FROM Bill
        WHERE bill_date = $1 AND payment_status = 'paid'
      `, [today]),
      
      // Monthly revenue
      client.query(`
        SELECT COALESCE(SUM(paid_amount), 0) as monthly_revenue
        FROM Bill
        WHERE bill_date >= $1 AND payment_status IN ('paid', 'partial')
      `, [firstDayOfMonth]),
      
      // Overdue bills (pending > 7 days)
      client.query(`
        SELECT COUNT(*) as count
        FROM Bill
        WHERE payment_status = 'pending'
        AND bill_date < CURRENT_DATE - INTERVAL '7 days'
      `)
    ]);
    
    return {
      pendingBills: parseInt(pendingResult.rows[0].count),
      pendingAmount: parseFloat(pendingResult.rows[0].total_pending),
      paidToday: parseFloat(paidTodayResult.rows[0].total_paid_today),
      monthlyRevenue: parseFloat(monthlyResult.rows[0].monthly_revenue),
      overdueBills: parseInt(overdueResult.rows[0].count)
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
    const consultationCount = parseInt(consultationResult.rows[0].count);
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
    const labCharges = parseFloat(labResult.rows[0].total_lab_cost);
    const labTestCount = parseInt(labResult.rows[0].test_count);
    
    // 4. Medicine Charges (Prescriptions)
    const medicineResult = await client.query(`
      SELECT COALESCE(SUM(mi.unit_price * p.quantity_prescribed), 0) as total_medicine_cost,
             COUNT(p.prescription_id) as medicine_count
      FROM Prescription p
      LEFT JOIN Medical_Inventory mi ON LOWER(p.medicine_name) = LOWER(mi.item_name)
      WHERE p.patient_id = $1 AND p.prescribed_date >= $2
    `, [admission.patient_id, admission.admission_date]);
    const medicineCharges = parseFloat(medicineResult.rows[0].total_medicine_cost);
    const medicineCount = parseInt(medicineResult.rows[0].medicine_count);
    
    // 5. Nursing Charges (Vital Signs)
    const vitalResult = await client.query(`
      SELECT COUNT(*) as count
      FROM Vital_Signs
      WHERE patient_id = $1 AND recorded_at >= $2
    `, [admission.patient_id, admission.admission_date]);
    const vitalCount = parseInt(vitalResult.rows[0].count);
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
    const equipmentCharges = parseFloat(equipmentResult.rows[0].equipment_cost);
    
    // Calculate Subtotal
    const subtotal = roomCharges + consultationFee + labCharges + medicineCharges + 
                     nursingCharges + emergencyCharges + equipmentCharges;
    
    // Calculate Tax
    const taxAmount = subtotal * RATES.TAX_RATE;
    
    // Calculate Total
    const totalAmount = subtotal + taxAmount;
    
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

// ===== GENERATE FINAL BILL =====
exports.generateBill = async (admissionId, dischargeDate, discount = 0, paymentMethod = null, adminId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First, calculate the bill
    const calculation = await exports.calculateBill(admissionId, dischargeDate);
    
    // Apply discount
    const discountAmount = discount > 0 ? (calculation.total_amount * discount / 100) : 0;
    const finalAmount = calculation.total_amount - discountAmount;
    
    // ✅ Insert bill - ONLY columns that exist in YOUR Bill table
    const billResult = await client.query(`
      INSERT INTO Bill (
        admission_id,
        patient_id,
        bill_date,
        total_amount,
        paid_amount,
        payment_status,
        payment_method
      ) VALUES (
        $1, $2, CURRENT_DATE, $3, 0, 'pending', $4
      ) RETURNING *
    `, [
      admissionId,
      calculation.patient_id,
      finalAmount,
      paymentMethod
    ]);
    
    const bill = billResult.rows[0];
    
    // Insert bill items (detailed breakdown)
    const billItems = [];
    
    // 1. Room Charges
    if (calculation.breakdown.room.total > 0) {
      billItems.push({
        type: 'ROOM',
        description: `${calculation.ward_name} - Bed ${calculation.bed_number} (${calculation.total_days} days @ ₹${calculation.breakdown.room.rate}/day)`,
        quantity: calculation.total_days,
        unit_price: calculation.breakdown.room.rate,
        total: calculation.breakdown.room.total
      });
    }
    
    // 2. Doctor Consultation
    if (calculation.breakdown.consultation.total > 0) {
      billItems.push({
        type: 'CONSULTATION',
        description: `Doctor Consultation - ${calculation.breakdown.consultation.count} visits @ ₹${RATES.CONSULTATION}/visit`,
        quantity: calculation.breakdown.consultation.count,
        unit_price: RATES.CONSULTATION,
        total: calculation.breakdown.consultation.total
      });
    }
    
    // 3. Lab Tests
    if (calculation.breakdown.lab.total > 0) {
      billItems.push({
        type: 'LAB_TEST',
        description: `Laboratory Tests - ${calculation.breakdown.lab.count} tests completed`,
        quantity: calculation.breakdown.lab.count,
        unit_price: calculation.breakdown.lab.total / Math.max(1, calculation.breakdown.lab.count),
        total: calculation.breakdown.lab.total
      });
    }
    
    // 4. Medicines
    if (calculation.breakdown.medicines.total > 0) {
      billItems.push({
        type: 'MEDICINE',
        description: `Prescribed Medicines - ${calculation.breakdown.medicines.count} items`,
        quantity: calculation.breakdown.medicines.count,
        unit_price: calculation.breakdown.medicines.total / Math.max(1, calculation.breakdown.medicines.count),
        total: calculation.breakdown.medicines.total
      });
    }
    
    // 5. Nursing Care
    if (calculation.breakdown.nursing.total > 0) {
      billItems.push({
        type: 'NURSING',
        description: `Nursing Care - ${calculation.total_days} days + ${calculation.breakdown.nursing.vitalCount} vital recordings`,
        quantity: 1,
        unit_price: calculation.breakdown.nursing.total,
        total: calculation.breakdown.nursing.total
      });
    }
    
    // 6. Emergency Charges
    if (calculation.breakdown.emergency.total > 0) {
      billItems.push({
        type: 'EMERGENCY',
        description: 'Emergency Surcharge - Critical care',
        quantity: 1,
        unit_price: calculation.breakdown.emergency.total,
        total: calculation.breakdown.emergency.total
      });
    }
    
    // 7. Equipment Charges
    if (calculation.breakdown.equipment.total > 0) {
      billItems.push({
        type: 'EQUIPMENT',
        description: 'Medical Equipment Usage',
        quantity: 1,
        unit_price: calculation.breakdown.equipment.total,
        total: calculation.breakdown.equipment.total
      });
    }
    
    // 8. Tax
    billItems.push({
      type: 'TAX',
      description: `GST @ ${RATES.TAX_RATE * 100}%`,
      quantity: 1,
      unit_price: calculation.tax_amount,
      total: calculation.tax_amount
    });
    
    // 9. Discount (if applicable)
    if (discountAmount > 0) {
      billItems.push({
        type: 'DISCOUNT',
        description: `Discount - ${discount}%`,
        quantity: 1,
        unit_price: -discountAmount,
        total: -discountAmount
      });
    }
    
    // Insert all bill items
    for (const item of billItems) {
      await client.query(`
        INSERT INTO Bill_Item (
          bill_id, item_type, description, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [bill.bill_id, item.type, item.description, item.quantity, item.unit_price, item.total]);
    }
    
    // Update admission status to 'discharged'
    await client.query(`
      UPDATE IPD_Admission 
      SET status = 'discharged', 
          discharge_date = $1
      WHERE admission_id = $2
    `, [calculation.discharge_date, admissionId]);
    
    // Update bed status to 'available'
    await client.query(`
      UPDATE Bed 
      SET status = 'available', 
          current_patient_id = NULL
      WHERE bed_id = (
        SELECT bed_id FROM IPD_Admission WHERE admission_id = $1
      )
    `, [admissionId]);
    
    // Update patient discharge date
    await client.query(`
      UPDATE Patient 
      SET date_discharge = $1
      WHERE patient_id = $2
    `, [calculation.discharge_date, calculation.patient_id]);
    
    await client.query('COMMIT');
    
    console.log(`✅ Bill generated: Bill ID ${bill.bill_id} for ${calculation.patient_name} - Total: ₹${finalAmount}`);
    
    return {
      ...bill,
      patient_name: calculation.patient_name,
      ward_name: calculation.ward_name,
      doctor_name: calculation.doctor_name,
      admission_date: calculation.admission_date,
      discharge_date: calculation.discharge_date,
      total_days: calculation.total_days,
      breakdown: calculation.breakdown
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
    
    // Filter by payment status
    if (filters.status) {
      query += ` AND b.payment_status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
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
    
    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
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
    
    if (parseInt(paymentCheck.rows[0].count) > 0) {
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
      SELECT * FROM Bill WHERE bill_id = $1
    `, [billId]);
    
    if (billResult.rows.length === 0) {
      throw new Error('Bill not found');
    }
    
    const bill = billResult.rows[0];
    const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(amount);
    const totalAmount = parseFloat(bill.total_amount);
    
    // Determine payment status
    let paymentStatus;
    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'pending';
    }
    
    // Insert payment transaction
    const paymentResult = await client.query(`
      INSERT INTO Payment_Transaction (
        bill_id, amount, payment_method, reference_number, status, created_by
      ) VALUES ($1, $2, $3, $4, 'SUCCESS', $5)
      RETURNING *
    `, [billId, amount, paymentMethod, referenceNumber, adminId]);
    
    // Update bill
    await client.query(`
      UPDATE Bill 
      SET paid_amount = $1,
          payment_status = $2,
          payment_method = $3,
          payment_date = CASE WHEN $2 = 'paid' THEN CURRENT_DATE ELSE payment_date END,
          updated_at = CURRENT_TIMESTAMP
      WHERE bill_id = $4
    `, [newPaidAmount, paymentStatus, paymentMethod, billId]);
    
    await client.query('COMMIT');
    
    console.log(`✅ Payment processed: ₹${amount} for Bill ID ${billId}`);
    
    return paymentResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
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
          payment_date = CASE WHEN $1 = 'paid' THEN CURRENT_DATE ELSE payment_date END,
          updated_at = CURRENT_TIMESTAMP
      WHERE bill_id = $2
    `, [status, billId]);
  } finally {
    client.release();
  }
};

// ===== GET INVOICE =====
exports.getInvoice = async (billId) => {
  // Reuse getBillDetails as it has all the information needed
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
      ORDER BY a.admission_date ASC
    `);
    
    return result.rows;
  } finally {
    client.release();
  }
};
