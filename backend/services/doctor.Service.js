const pool = require('../config/database');

class DoctorService {
  // ===== STATS =====
  static async getStats(doctorId) {
    const [total, today, pending, completed] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM Patient'),
      pool.query('SELECT COUNT(*) as count FROM Patient WHERE date_registered = CURRENT_DATE'),
      pool.query(`
        SELECT COUNT(*) as count FROM Patient p
        LEFT JOIN Medical_Record mr ON p.patient_id = mr.patient_id
        WHERE p.date_registered < CURRENT_DATE AND mr.record_id IS NULL
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM Medical_Record
        WHERE EXTRACT(MONTH FROM visit_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM visit_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      `)
    ]);

    return {
      totalPatients: parseInt(total.rows[0].count),
      todayAppointments: parseInt(today.rows[0].count),
      pendingAppointments: parseInt(pending.rows[0].count),
      completedThisMonth: parseInt(completed.rows[0].count)
    };
  }

  // ===== GET ALL PATIENTS (only those WITHOUT a report today) =====
  static async getPatients(doctorId) {
    const result = await pool.query(`
      SELECT
        p.patient_id as patientid,
        p.name,
        p.age,
        p.gender,
        p.contact,
        p.blood_type as bloodtype,
        p.address,
        p.emergency_contact as emergencycontact,
        p.is_serious_case as isseriouscase,
        p.date_registered as dateregistered,
        p.time_registered as timeregistered,
        CASE WHEN EXISTS (
          SELECT 1 FROM Medical_Record mr
          WHERE mr.patient_id = p.patient_id
          AND DATE(mr.visit_date) = CURRENT_DATE
        ) THEN true ELSE false END as has_report_today,
        COUNT(mr.record_id) as total_reports
      FROM Patient p
      LEFT JOIN Medical_Record mr ON p.patient_id = mr.patient_id
      WHERE NOT EXISTS (
        SELECT 1 FROM Medical_Record mr2
        WHERE mr2.patient_id = p.patient_id
        AND DATE(mr2.visit_date) = CURRENT_DATE
      )
      GROUP BY p.patient_id
      ORDER BY p.date_registered DESC, p.time_registered DESC
    `);
    
    return result.rows;
  }

  // ===== TODAY'S SCHEDULE =====
  static async getTodaySchedule() {
    const result = await pool.query(`
      SELECT
        p.patient_id as "patientid",
        p.name as "patientname",
        p.age,
        p.gender,
        p.contact,
        p.blood_type as "bloodtype",
        p.is_serious_case as "isseriouscase",
        p.date_registered as "dateregistered",
        p.time_registered as "timeslot",
        p.address as "reason",
        CASE
          WHEN EXISTS (
            SELECT 1 FROM Medical_Record mr
            WHERE mr.patient_id = p.patient_id AND mr.visit_date = CURRENT_DATE
          ) THEN 'completed'
          ELSE 'scheduled'
        END as status
      FROM Patient p
      WHERE p.date_registered = CURRENT_DATE
      ORDER BY p.time_registered
    `);
    
    return result.rows;
  }

  // ===== PENDING PATIENTS (APPOINTMENTS) =====
  static async getPendingAppointments() {
    const result = await pool.query(`
      SELECT
        p.patient_id as "patientid",
        p.name as "patientname",
        p.age,
        p.gender,
        p.contact,
        p.blood_type as "bloodtype",
        p.is_serious_case as "isseriouscase",
        p.date_registered as "appointmentdate",
        p.time_registered as "timeslot",
        p.address as "reason",
        'scheduled' as status
      FROM Patient p
      WHERE p.date_registered < CURRENT_DATE
      AND NOT EXISTS (SELECT 1 FROM Medical_Record mr WHERE mr.patient_id = p.patient_id)
      ORDER BY p.date_registered DESC, p.time_registered DESC
    `);
    
    return result.rows;
  }

  // ===== PATIENT HISTORY =====
  static async getPatientHistory(patientId) {
    const patientResult = await pool.query(
      'SELECT * FROM Patient WHERE patient_id = $1',
      [patientId]
    );
    
    if (patientResult.rows.length === 0) {
      throw new Error('PATIENT_NOT_FOUND');
    }

    const recordsResult = await pool.query(`
      SELECT mr.*, d.name as doctor_name, d.specialization
      FROM Medical_Record mr
      JOIN Doctor d ON mr.doctor_id = d.doctor_id
      WHERE mr.patient_id = $1
      ORDER BY mr.visit_date DESC LIMIT 10
    `, [patientId]);
    
    return {
      patient: patientResult.rows[0],
      medicalRecords: recordsResult.rows
    };
  }

  // ===== CREATE MEDICAL REPORT (WITH LAB TESTS) =====
  static async createMedicalReport(doctorId, reportData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const {
        patient_id,
        chief_complaint,
        symptoms,
        final_diagnosis,
        prescription,
        follow_up_date,
        notes,
        requires_lab_tests,
        lab_tests,
        lab_urgency,
        lab_notes
      } = reportData;

      // Validation
      if (!patient_id || !chief_complaint) {
        throw new Error('VALIDATION_ERROR: Patient ID and chief complaint are required');
      }

      // Get patient details
      const patientResult = await client.query(
        'SELECT * FROM Patient WHERE patient_id = $1',
        [patient_id]
      );
      
      if (patientResult.rows.length === 0) {
        throw new Error('PATIENT_NOT_FOUND');
      }

      const patient = patientResult.rows[0];

      // STEP 1: Create medical record
      const medicalRecordResult = await client.query(`
        INSERT INTO Medical_Record (
          patient_id,
          doctor_id,
          diagnosis,
          prescription,
          follow_up_date,
          notes,
          visit_date
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, CURRENT_TIMESTAMP)
        RETURNING record_id
      `, [
        patient_id,
        doctorId,
        final_diagnosis || '',
        prescription || '',
        follow_up_date || null,
        JSON.stringify({
          chief_complaint,
          symptoms: symptoms || '',
          final_diagnosis: final_diagnosis || '',
          additional_notes: notes || '',
          lab_tests_required: requires_lab_tests || false
        })
      ]);

      const recordId = medicalRecordResult.rows[0].record_id;

      // STEP 2: Create Nurse Task (ALWAYS)
      const taskPriority = patient.is_serious_case ? 'URGENT' : 'ROUTINE';
      const taskNotes = final_diagnosis
        ? `Medical report completed: ${final_diagnosis}. Please record vital signs.`
        : `Medical report completed for ${patient.name}. Please record vital signs.`;

      await client.query(`
        INSERT INTO Nurse_Task (
          patient_id,
          doctor_id,
          record_id,
          priority,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, 'PENDING', $5)
      `, [
        patient_id,
        doctorId,
        recordId,
        taskPriority,
        taskNotes
      ]);

      // STEP 3: Create Lab Order (ONLY if checkbox is ticked)
      let labOrderCreated = false;
      if (requires_lab_tests === true && lab_tests && lab_tests.length > 0) {
        const labOrderResult = await client.query(`
          INSERT INTO Lab_Order (
            patient_id,
            doctor_id,
            record_id,
            urgency,
            status,
            clinical_notes
          )
          VALUES ($1, $2, $3, $4, 'PENDING', $5)
          RETURNING order_id
        `, [
          patient_id,
          doctorId,
          recordId,
          lab_urgency || 'ROUTINE',
          lab_notes || `Lab tests ordered for diagnosis: ${final_diagnosis || 'examination'}`
        ]);

        const orderId = labOrderResult.rows[0].order_id;

        // Add individual tests to the order
        for (const testId of lab_tests) {
          await client.query(`
            INSERT INTO Lab_Order_Test (order_id, test_id)
            VALUES ($1, $2)
          `, [orderId, testId]);
        }

        labOrderCreated = true;
      }

      await client.query('COMMIT');

      return {
        success: true,
        record_id: recordId,
        nurse_task_created: true,
        lab_order_created: labOrderCreated
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== GET PATIENT REPORTS =====
  static async getPatientReports(patientId) {
    const result = await pool.query(`
      SELECT
        mr.*,
        d.name as doctor_name,
        d.specialization,
        p.name as patient_name,
        p.age,
        p.gender
      FROM Medical_Record mr
      JOIN Doctor d ON mr.doctor_id = d.doctor_id
      JOIN Patient p ON mr.patient_id = p.patient_id
      WHERE mr.patient_id = $1
      ORDER BY mr.visit_date DESC, mr.record_id DESC
    `, [patientId]);
    
    return result.rows;
  }

  // ===== GET AVAILABLE MEDICINES =====
  static async getAvailableMedicines() {
    const result = await pool.query(`
      SELECT
        item_id,
        item_name,
        item_category,
        quantity_in_stock,
        unit_of_measure,
        reorder_level
      FROM Medical_Inventory
      WHERE item_category = 'Medicine'
      AND quantity_in_stock > 0
      ORDER BY item_name
    `);
    
    return result.rows;
  }

  // ===== PRESCRIBE MEDICINES (Auto-deduct inventory) =====
  static async prescribeMedicines(doctorId, prescriptionData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { record_id, medicines } = prescriptionData;

      for (const med of medicines) {
        // Check stock
        const stockCheck = await client.query(
          'SELECT quantity_in_stock, item_name FROM Medical_Inventory WHERE item_id = $1',
          [med.item_id]
        );

        if (stockCheck.rows.length === 0) {
          throw new Error(`MEDICINE_NOT_FOUND: ${med.medicine_name}`);
        }

        const currentStock = stockCheck.rows[0].quantity_in_stock;
        const itemName = stockCheck.rows[0].item_name;

        if (currentStock < med.quantity) {
          throw new Error(`INSUFFICIENT_STOCK: ${itemName}. Available: ${currentStock}, Required: ${med.quantity}`);
        }

        // Insert prescription
        await client.query(`
          INSERT INTO Prescription_Item
          (record_id, item_id, medicine_name, dosage, frequency, duration, quantity_prescribed, instructions)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          record_id,
          med.item_id,
          med.medicine_name,
          med.dosage,
          med.frequency,
          med.duration,
          med.quantity,
          med.instructions
        ]);

        // Deduct from inventory
        await client.query(`
          UPDATE Medical_Inventory
          SET quantity_in_stock = quantity_in_stock - $1
          WHERE item_id = $2
        `, [med.quantity, med.item_id]);

        const newStock = currentStock - med.quantity;

        // Log transaction
        await client.query(`
          INSERT INTO Inventory_Transaction
          (item_id, transaction_type, quantity_changed, quantity_before, quantity_after, reason, performed_by)
          VALUES ($1, 'usage', $2, $3, $4, $5, $6)
        `, [
          med.item_id,
          -med.quantity,
          currentStock,
          newStock,
          `Prescribed to patient (Record ID: ${record_id})`,
          doctorId
        ]);
      }

      await client.query('COMMIT');
      return { success: true, count: medicines.length };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== GET PRESCRIBED MEDICINES FOR A REPORT =====
  static async getPrescribedMedicines(recordId) {
    const result = await pool.query(`
      SELECT
        prescription_id,
        medicine_name,
        dosage,
        frequency,
        duration,
        quantity_prescribed,
        instructions
      FROM Prescription_Item
      WHERE record_id = $1
      ORDER BY prescription_id
    `, [recordId]);
    
    return result.rows;
  }

  // ===== GET COMPLETED LAB REPORTS =====
  static async getCompletedLabReports(doctorId) {
    const result = await pool.query(`
      SELECT
        lo.order_id,
        lo.completed_date,
        p.patient_id,
        p.name AS patient_name,
        p.age AS patient_age,
        d.name AS doctor_name,
        lo.status
      FROM Lab_Order lo
      JOIN Patient p ON lo.patient_id = p.patient_id
      JOIN Doctor d ON lo.doctor_id = d.doctor_id
      WHERE lo.status = 'COMPLETED' AND lo.doctor_id = $1
      ORDER BY lo.completed_date DESC
    `, [doctorId]);
    
    return result.rows;
  }

  // ===== GET LAB REPORT DETAILS =====
  static async getLabReportDetails(orderId) {
    const orderResult = await pool.query(`
      SELECT lo.*, p.name as patient_name, d.name as doctor_name
      FROM Lab_Order lo
      JOIN Patient p ON lo.patient_id = p.patient_id
      JOIN Doctor d ON lo.doctor_id = d.doctor_id
      WHERE lo.order_id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      throw new Error('LAB_REPORT_NOT_FOUND');
    }

    const testsResult = await pool.query(`
      SELECT lot.result_value, lot.is_abnormal, ltc.test_name, ltc.normal_range, ltc.unit
      FROM Lab_Order_Test lot
      JOIN Lab_Test_Catalog ltc ON lot.test_id = ltc.test_id
      WHERE lot.order_id = $1
      ORDER BY ltc.test_name
    `, [orderId]);

    const report = orderResult.rows[0];
    report.tests = testsResult.rows;
    
    return report;
  }
}

module.exports = DoctorService;
