const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const pool = require('../config/database');

// ===== STATS =====
router.get('/stats', requireRole('doctor'), async (req, res) => {
  try {
    const totalResult = await pool.query(`SELECT COUNT(*) as count FROM Patient`);
    const todayResult = await pool.query(
      `SELECT COUNT(*) as count FROM Patient WHERE date_registered = CURRENT_DATE`
    );
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as count FROM Patient p
       LEFT JOIN Medical_Record mr ON p.patient_id = mr.patient_id
       WHERE p.date_registered < CURRENT_DATE AND mr.record_id IS NULL`
    );
    const completedResult = await pool.query(
      `SELECT COUNT(*) as count FROM Medical_Record 
       WHERE EXTRACT(MONTH FROM visit_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM visit_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );
    
    res.json({
      totalPatients: parseInt(totalResult.rows[0].count),
      todayAppointments: parseInt(todayResult.rows[0].count),
      pendingAppointments: parseInt(pendingResult.rows[0].count),
      completedThisMonth: parseInt(completedResult.rows[0].count)
    });
  } catch (err) {
    console.error('❌ Error fetching doctor stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== GET ALL PATIENTS (only those WITHOUT a report today) =====
router.get('/patients', requireRole('doctor'), async (req, res) => {
  try {
    const doctorId = req.session.user.id;
    
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
        -- Check if patient has a report TODAY
        CASE WHEN EXISTS (
          SELECT 1 FROM Medical_Record mr 
          WHERE mr.patient_id = p.patient_id 
          AND DATE(mr.visit_date) = CURRENT_DATE
        ) THEN true ELSE false END as has_report_today,
        -- Total reports
        COUNT(mr.record_id) as total_reports
      FROM Patient p
      LEFT JOIN Medical_Record mr ON p.patient_id = mr.patient_id
      WHERE NOT EXISTS (
        -- ✅ FILTER OUT patients who already have a report today
        SELECT 1 FROM Medical_Record mr2 
        WHERE mr2.patient_id = p.patient_id 
        AND DATE(mr2.visit_date) = CURRENT_DATE
      )
      GROUP BY p.patient_id
      ORDER BY p.date_registered DESC, p.time_registered DESC
    `);
    
    console.log(`✅ Retrieved ${result.rows.length} patients (without today's report)`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching patients:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== TODAY'S PATIENTS =====
router.get('/schedule/today', requireRole('doctor'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
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
       ORDER BY p.time_registered`
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching today\'s patients:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== PENDING PATIENTS =====
router.get('/appointments', requireRole('doctor'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
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
       ORDER BY p.date_registered DESC, p.time_registered DESC`
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching pending patients:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== PATIENT HISTORY =====
router.get('/patients/:id/history', requireRole('doctor'), async (req, res) => {
  try {
    const patientId = req.params.id;
    
    const patientResult = await pool.query(
      'SELECT * FROM Patient WHERE patient_id = $1',
      [patientId]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const recordsResult = await pool.query(
      `SELECT mr.*, d.name as doctor_name, d.specialization
       FROM Medical_Record mr
       JOIN Doctor d ON mr.doctor_id = d.doctor_id
       WHERE mr.patient_id = $1
       ORDER BY mr.visit_date DESC LIMIT 10`,
      [patientId]
    );
    
    res.json({
      patient: patientResult.rows[0],
      medicalRecords: recordsResult.rows
    });
  } catch (err) {
    console.error('❌ Error fetching patient history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ===== CREATE MEDICAL REPORT (WITH LAB TESTS) =====
router.post('/create-report', requireRole('doctor'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const doctorId = req.session.user.id;
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
    } = req.body;

    console.log(`📝 Creating medical report for patient: ${patient_id}`);

    // Validation
    if (!patient_id || !chief_complaint) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Patient ID and chief complaint are required' });
    }

    // Get patient details
    const patientResult = await client.query(
      'SELECT * FROM Patient WHERE patient_id = $1',
      [patient_id]
    );
    
    if (patientResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = patientResult.rows[0];

    // ✅ STEP 1: Create medical record (ALWAYS)
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
    console.log(`✅ Medical record created: Record ID ${recordId}`);

    // ✅ STEP 2: ALWAYS Create Nurse Task (REMOVED THE CONDITION!)
    try {
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

      console.log(`✅ Nurse task created for patient: ${patient_id} (Priority: ${taskPriority})`);
    } catch (taskError) {
      console.error('❌ Error creating nurse task:', taskError);
      // Don't rollback - medical record is still valid
    }

    // ✅ STEP 3: Create Lab Order (ONLY if checkbox is ticked)
    let labOrderCreated = false;
    if (requires_lab_tests === true && lab_tests && lab_tests.length > 0) {
      try {
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
        console.log(`✅ Lab Order created: Order ID ${orderId} with ${lab_tests.length} tests`);
      } catch (labError) {
        console.error('❌ Error creating lab order:', labError);
        // Don't rollback - medical record and nurse task still valid
      }
    }

    await client.query('COMMIT');
    
    res.json({
      success: true,
      record_id: recordId,
      nurse_task_created: true,  // ✅ ALWAYS TRUE NOW
      lab_order_created: labOrderCreated,
      message: labOrderCreated
        ? 'Medical report created! Lab tests ordered and nurse notified.'
        : 'Medical report created successfully! Nurse has been notified.'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating medical report:', err);
    res.status(500).json({ error: 'Failed to create medical report', details: err.message });
  } finally {
    client.release();
  }
});

// ===== GET PATIENT REPORTS =====
router.get('/patients/:patientId/reports', requireRole('doctor'), async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const result = await pool.query(
      `SELECT 
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
       ORDER BY mr.visit_date DESC, mr.record_id DESC`,
      [patientId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching patient reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// =========================
// NURSE ROUTES (append below your existing doctor routes)
// =========================

/*
  Conventions:
  - Status values: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  - Priority values include ROUTINE, LOW, MEDIUM, HIGH, URGENT
  - New single-call completion endpoint for fast UX:
      POST /nurse/tasks/:taskId/complete  { nursing_notes: "..." }
  - Claim/update endpoint:
      PATCH /nurse/tasks/:taskId  { status: 'IN_PROGRESS'|'COMPLETED'|'CANCELLED', notes? }
*/

const NURSE_STATUS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// ----- Nurse dashboard stats
router.get('/nurse/stats', requireRole('nurse'), async (req, res) => {
  try {
    const nurseId = req.session.user.id;

    const [
      wardsResult,
      admittedResult,
      availableBedsResult,
      criticalResult,
      pendingTasksResult,
      inProgressTasksResult,
      completedTodayResult
    ] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT ward_id) AS c FROM Ward_Nurse WHERE nurse_id = $1`, [nurseId]),
      pool.query(`
        SELECT COUNT(DISTINCT ipd.patient_id) AS c
        FROM IPD_Admission ipd
        JOIN Bed b ON ipd.bed_id = b.bed_id
        JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
        WHERE wn.nurse_id = $1 AND ipd.discharge_date IS NULL
      `, [nurseId]),
      pool.query(`
        SELECT COUNT(*) AS c
        FROM Bed b
        JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
        WHERE wn.nurse_id = $1 AND b.status = 'available'
      `, [nurseId]),
      pool.query(`
        SELECT COUNT(DISTINCT p.patient_id) AS c
        FROM Patient p
        JOIN IPD_Admission ipd ON p.patient_id = ipd.patient_id
        JOIN Bed b ON ipd.bed_id = b.bed_id
        JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
        WHERE wn.nurse_id = $1 AND ipd.discharge_date IS NULL AND p.is_serious_case = TRUE
      `, [nurseId]),
      pool.query(`SELECT COUNT(*) AS c FROM Nurse_Task WHERE status = 'PENDING'`),
      pool.query(`SELECT COUNT(*) AS c FROM Nurse_Task WHERE status = 'IN_PROGRESS'`),
      pool.query(`
        SELECT COUNT(*) AS c FROM Nurse_Task
        WHERE status = 'COMPLETED' AND DATE(completed_at) = CURRENT_DATE
      `),
    ]);

    res.json({
      assignedWards: parseInt(wardsResult.rows[0].c || 0, 10),
      admittedPatients: parseInt(admittedResult.rows[0].c || 0, 10),
      availableBeds: parseInt(availableBedsResult.rows[0].c || 0, 10),
      criticalPatients: parseInt(criticalResult.rows[0].c || 0, 10),
      pendingTasks: parseInt(pendingTasksResult.rows[0].c || 0, 10),
      inProgressTasks: parseInt(inProgressTasksResult.rows[0].c || 0, 10),
      completedToday: parseInt(completedTodayResult.rows[0].c || 0, 10),
    });
  } catch (err) {
    console.error('❌ Nurse stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- Nurse task list
router.get('/nurse/tasks', requireRole('nurse'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && NURSE_STATUS.includes(status) ? status : null;

    const sql = `
      SELECT
        t.task_id, t.record_id, t.patient_id, t.doctor_id, t.assigned_nurse_id,
        t.task_type, t.priority, t.status, t.notes, t.created_at, t.completed_at,
        p.name AS patient_name, p.age, p.gender, p.blood_type, p.is_serious_case,
        d.name AS doctor_name, d.specialization,
        mr.diagnosis, mr.prescription, mr.follow_up_date
      FROM Nurse_Task t
      JOIN Patient p ON t.patient_id = p.patient_id
      JOIN Doctor d ON t.doctor_id = d.doctor_id
      JOIN Medical_Record mr ON t.record_id = mr.record_id
      ${filter ? `WHERE t.status = $1` : ``}
      ORDER BY 
        CASE t.priority
          WHEN 'URGENT' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
          WHEN 'ROUTINE' THEN 5
          ELSE 6
        END, t.created_at DESC
      LIMIT 200
    `;

    const result = await (filter ? pool.query(sql, [filter]) : pool.query(sql));
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Nurse tasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- Nurse report view (full)
router.get('/nurse/reports/:recordId', requireRole('nurse'), async (req, res) => {
  try {
    const { recordId } = req.params;
    const sql = `
      SELECT mr.*, d.name AS doctor_name, d.specialization,
             p.name AS patient_name, p.age, p.gender
      FROM Medical_Record mr
      JOIN Doctor d ON mr.doctor_id = d.doctor_id
      JOIN Patient p ON mr.patient_id = p.patient_id
      WHERE mr.record_id = $1
    `;
    const r = await pool.query(sql, [recordId]);
    if (r.rowCount === 0) return res.status(404).json({ message: 'Report not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('❌ Nurse report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- Legacy: add nursing notes (kept for compatibility)
router.post('/nurse/reports/:recordId/notes', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { recordId } = req.params;
    const { nursing_notes } = req.body;
    const nurseId = req.session.user.id;

    if (!nursing_notes || !nursing_notes.trim()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Notes required' });
    }

    const cur = await client.query('SELECT notes FROM Medical_Record WHERE record_id = $1', [recordId]);
    if (cur.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Record not found' });
    }

    const json = cur.rows[0].notes
      ? (typeof cur.rows[0].notes === 'string' ? JSON.parse(cur.rows[0].notes) : cur.rows[0].notes)
      : {};
    const list = Array.isArray(json.nursing_notes) ? json.nursing_notes : [];
    list.push({ nurse_id: nurseId, ts: new Date().toISOString(), text: nursing_notes.trim() });
    json.nursing_notes = list;

    await client.query('UPDATE Medical_Record SET notes = $1 WHERE record_id = $2', [JSON.stringify(json), recordId]);

    await client.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Add nursing notes error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// ----- Claim / update task status (claim sets assigned_nurse_id)
router.patch('/nurse/tasks/:taskId', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const nurseId = req.session.user.id;
    const { taskId } = req.params;
    const { status, notes } = req.body;

    const valid = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!valid.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Lock row to avoid double-claim
    const t = await client.query('SELECT * FROM Nurse_Task WHERE task_id = $1 FOR UPDATE', [taskId]);
    if (t.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found' });
    }

    let q = `UPDATE Nurse_Task SET status = $1`;
    const params = [status];
    let i = 2;

    if (status === 'IN_PROGRESS') {
      q += `, assigned_nurse_id = $${i++}`;
      params.push(nurseId);
    }
    if (status === 'COMPLETED') {
      q += `, completed_at = CURRENT_TIMESTAMP`;
    }
    if (notes && notes.trim()) {
      q += `, notes = CONCAT(COALESCE(notes, ''), CASE WHEN COALESCE(notes,'')='' THEN '' ELSE ' | ' END, $${i++})`;
      params.push(notes.trim());
    }

    q += ` WHERE task_id = $${i} RETURNING *`;
    params.push(parseInt(taskId, 10));

    const upd = await client.query(q, params);
    await client.query('COMMIT');
    res.json(upd.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Nurse task update error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// ----- Fast, atomic completion: add notes + mark COMPLETED in one call
router.post('/nurse/tasks/:taskId/complete', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { taskId } = req.params;
    const { nursing_notes } = req.body;
    const nurseId = req.session.user.id;

    if (!nursing_notes || !nursing_notes.trim()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Nursing notes are required.' });
    }

    // Lock task, fetch record
    const t = await client.query(`SELECT record_id FROM Nurse_Task WHERE task_id = $1 FOR UPDATE`, [taskId]);
    if (t.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found.' });
    }
    const recordId = t.rows[0].record_id;

    // Merge notes JSON
    const r = await client.query('SELECT notes FROM Medical_Record WHERE record_id = $1', [recordId]);
    if (r.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Medical record not found.' });
    }
    const json = r.rows[0].notes
      ? (typeof r.rows[0].notes === 'string' ? JSON.parse(r.rows[0].notes) : r.rows[0].notes)
      : {};
    json.nursing_notes = Array.isArray(json.nursing_notes) ? json.nursing_notes : [];
    json.nursing_notes.push({ nurse_id: nurseId, ts: new Date().toISOString(), text: nursing_notes.trim() });

    await client.query('UPDATE Medical_Record SET notes = $1 WHERE record_id = $2', [JSON.stringify(json), recordId]);

    // Mark completed
    const upd = await client.query(
      `UPDATE Nurse_Task SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE task_id = $1 RETURNING *`,
      [taskId]
    );

    await client.query('COMMIT');
    res.json(upd.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Nurse fast-complete error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});
// ===== GET AVAILABLE MEDICINES FROM INVENTORY =====
router.get('/medicines/available', requireRole('doctor'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         item_id,
         item_name,
         item_category,
         quantity_in_stock,
         unit_of_measure,
         reorder_level
       FROM Medical_Inventory
       WHERE item_category = 'Medicine' 
         AND quantity_in_stock > 0
       ORDER BY item_name`
    );
    console.log(`📦 Retrieved ${result.rows.length} available medicines`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching medicines:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
 // ===== PRESCRIBE MEDICINES (Auto-deduct inventory) =====
router.post('/prescribe-medicines', requireRole('doctor'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { record_id, medicines } = req.body;
    const doctorId = req.session.user.id;
    
    console.log(`💊 Prescribing ${medicines.length} medicines for record ${record_id}`);
    
    for (const med of medicines) {
      // ✅ STEP 1: Check stock and get current quantity
      const stockCheck = await client.query(
        'SELECT quantity_in_stock, item_name FROM Medical_Inventory WHERE item_id = $1',
        [med.item_id]
      );
      
      if (stockCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          message: `Medicine not found: ${med.medicine_name}` 
        });
      }
      
      const currentStock = stockCheck.rows[0].quantity_in_stock;
      const itemName = stockCheck.rows[0].item_name;
      
      if (currentStock < med.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Insufficient stock for ${itemName}. Available: ${currentStock}, Required: ${med.quantity}` 
        });
      }
      
      // ✅ STEP 2: Insert prescription
      await client.query(
        `INSERT INTO Prescription_Item 
         (record_id, item_id, medicine_name, dosage, frequency, duration, quantity_prescribed, instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          record_id,
          med.item_id,
          med.medicine_name,
          med.dosage,
          med.frequency,
          med.duration,
          med.quantity,
          med.instructions
        ]
      );
      
      // ✅ STEP 3: Deduct from inventory
      await client.query(
        `UPDATE Medical_Inventory 
         SET quantity_in_stock = quantity_in_stock - $1
         WHERE item_id = $2`,
        [med.quantity, med.item_id]
      );
      
      const newStock = currentStock - med.quantity;
      
      // ✅ STEP 4: Log transaction with quantity_before and quantity_after
      await client.query(
        `INSERT INTO Inventory_Transaction 
         (item_id, transaction_type, quantity_changed, quantity_before, quantity_after, reason, performed_by)
         VALUES ($1, 'usage', $2, $3, $4, $5, $6)`,
        [
          med.item_id,
          -med.quantity,
          currentStock,                                      // ✅ quantity_before
          newStock,                                          // ✅ quantity_after
          `Prescribed to patient (Record ID: ${record_id})`,
          req.session.user.name || req.session.user.id
        ]
      );
      
      console.log(`  ✅ Prescribed: ${med.medicine_name} × ${med.quantity} (Stock: ${currentStock} → ${newStock})`);
    }
    
    await client.query('COMMIT');
    console.log(`✅ ${medicines.length} medicines prescribed successfully`);
    
    res.json({ 
      success: true, 
      message: `${medicines.length} medicine(s) prescribed successfully` 
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error prescribing medicines:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});
 // ===== GET PRESCRIBED MEDICINES FOR A REPORT =====
  router.get('/records/:recordId/medicines', requireRole('doctor'), async (req, res) => {
    try {
      const { recordId } = req.params;
      const result = await pool.query(
        `SELECT 
          prescription_id,
          medicine_name,
          dosage,
          frequency,
          duration,
          quantity_prescribed,
          instructions
        FROM Prescription_Item
        WHERE record_id = $1
        ORDER BY prescription_id`,
        [recordId]
      );
      console.log(`💊 Retrieved ${result.rows.length} prescribed medicines for record ${recordId}`);
      res.json(result.rows);
    } catch (err) {
      console.error('❌ Error fetching prescribed medicines:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;
