const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const pool = require('../config/database');

// ===== DASHBOARD STATS =====
router.get('/stats', requireRole('nurse'), async (req, res) => {
  try {
    const nurseId = req.session.user.id;
    
    // Get assigned wards count
    const wardsResult = await pool.query(
      `SELECT COUNT(DISTINCT ward_id) as count FROM Ward_Nurse WHERE nurse_id = $1`,
      [nurseId]
    );
    
    // Get total admitted patients in nurse's wards
    const patientsResult = await pool.query(
      `SELECT COUNT(DISTINCT ipd.patient_id) as count
       FROM IPD_Admission ipd
       JOIN Bed b ON ipd.bed_id = b.bed_id
       JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
       WHERE wn.nurse_id = $1 AND ipd.discharge_date IS NULL`,
      [nurseId]
    );
    
    // Get available beds in nurse's wards
    const availableBedsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM Bed b
       JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
       WHERE wn.nurse_id = $1 AND b.status = 'available'`,
      [nurseId]
    );
    
    // Get critical patients count
    const criticalResult = await pool.query(
      `SELECT COUNT(DISTINCT p.patient_id) as count
       FROM Patient p
       JOIN IPD_Admission ipd ON p.patient_id = ipd.patient_id
       JOIN Bed b ON ipd.bed_id = b.bed_id
       JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
       WHERE wn.nurse_id = $1
         AND p.is_serious_case = true
         AND ipd.discharge_date IS NULL`,
      [nurseId]
    );
    
    res.json({
      totalWards: parseInt(wardsResult.rows[0].count),
      admittedPatients: parseInt(patientsResult.rows[0].count),
      availableBeds: parseInt(availableBedsResult.rows[0].count),
      criticalPatients: parseInt(criticalResult.rows[0].count)
    });
    
  } catch (err) {
    console.error('❌ Error fetching nurse stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== WARD & BED MANAGEMENT =====
router.get('/wards', requireRole('nurse'), async (req, res) => {
  try {
    const nurseId = req.session.user.id;
    const result = await pool.query(
      `SELECT 
         w.ward_id,
         w.name,
         w.category,
         w.bed_capacity,
         COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available_beds,
         COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied_beds,
         COUNT(CASE WHEN b.status = 'maintenance' THEN 1 END) as maintenance_beds
       FROM Ward w
       JOIN Ward_Nurse wn ON w.ward_id = wn.ward_id
       LEFT JOIN Bed b ON w.ward_id = b.ward_id
       WHERE wn.nurse_id = $1
       GROUP BY w.ward_id
       ORDER BY w.name`,
      [nurseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching wards:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/wards/:wardId/beds', requireRole('nurse'), async (req, res) => {
  try {
    const { wardId } = req.params;
    const nurseId = req.session.user.id;
    
    // Verify nurse has access to this ward
    const accessCheck = await pool.query(
      'SELECT * FROM Ward_Nurse WHERE nurse_id = $1 AND ward_id = $2',
      [nurseId, wardId]
    );
    
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied to this ward' });
    }
    
    const result = await pool.query(
      `SELECT 
         b.*,
         ipd.admission_id,
         p.name as patient_name,
         p.age,
         p.gender,
         p.is_serious_case,
         ipd.admission_date
       FROM Bed b
       LEFT JOIN IPD_Admission ipd ON b.bed_id = ipd.bed_id AND ipd.discharge_date IS NULL
       LEFT JOIN Patient p ON ipd.patient_id = p.patient_id
       WHERE b.ward_id = $1
       ORDER BY b.bed_number`,
      [wardId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching beds:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== PATIENT ADMISSION =====
router.get('/patients/available', requireRole('nurse'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*
       FROM Patient p
       WHERE NOT EXISTS (
         SELECT 1 FROM IPD_Admission ipd
         WHERE ipd.patient_id = p.patient_id
         AND ipd.discharge_date IS NULL
       )
       ORDER BY p.date_registered DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching available patients:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admissions', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const nurseId = req.session.user.id;
    const {
      patient_id,
      ward_id,
      bed_id,
      doctor_id,
      admission_reason,
      expected_discharge_date
    } = req.body;
    
    if (!patient_id || !bed_id || !doctor_id || !admission_reason) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const bedCheck = await client.query(
      'SELECT status FROM Bed WHERE bed_id = $1',
      [bed_id]
    );
    
    if (bedCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Bed not found' });
    }
    
    if (bedCheck.rows[0].status !== 'available') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Bed is not available' });
    }
    
    const admissionResult = await client.query(
      `INSERT INTO IPD_Admission 
       (patient_id, bed_id, doctor_id, admission_date, admission_time,
        admission_reason, expected_discharge_date)
       VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIME, $4, $5)
       RETURNING admission_id`,
      [patient_id, bed_id, doctor_id, admission_reason, expected_discharge_date]
    );
    
    await client.query(
      'UPDATE Bed SET status = $1, current_patient_id = $2 WHERE bed_id = $3',
      ['occupied', patient_id, bed_id]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Patient ${patient_id} admitted to bed ${bed_id} by nurse ${nurseId}`);
    res.status(201).json({
      success: true,
      admission_id: admissionResult.rows[0].admission_id,
      message: 'Patient admitted successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating admission:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/patients/admitted', requireRole('nurse'), async (req, res) => {
  try {
    const nurseId = req.session.user.id;
    const result = await pool.query(
      `SELECT 
         p.patient_id,
         p.name,
         p.age,
         p.gender,
         p.blood_type,
         p.contact,
         p.is_serious_case,
         ipd.admission_id,
         ipd.admission_date,
         ipd.admission_reason,
         w.name as ward_name,
         w.ward_id,
         b.bed_number,
         d.name as doctor_name
       FROM Patient p
       JOIN IPD_Admission ipd ON p.patient_id = ipd.patient_id
       JOIN Bed b ON ipd.bed_id = b.bed_id
       JOIN Ward w ON b.ward_id = w.ward_id
       JOIN Ward_Nurse wn ON w.ward_id = wn.ward_id
       JOIN Doctor d ON ipd.doctor_id = d.doctor_id
       WHERE wn.nurse_id = $1 AND ipd.discharge_date IS NULL
       ORDER BY p.is_serious_case DESC, ipd.admission_date DESC`,
      [nurseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching admitted patients:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admissions/:admissionId/discharge', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { admissionId } = req.params;
    const { discharge_summary } = req.body;
    
    const admission = await client.query(
      'SELECT bed_id, patient_id FROM IPD_Admission WHERE admission_id = $1',
      [admissionId]
    );
    
    if (admission.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Admission not found' });
    }
    
    const { bed_id, patient_id } = admission.rows[0];
    
    await client.query(
      `UPDATE IPD_Admission 
       SET discharge_date = CURRENT_DATE,
           discharge_time = CURRENT_TIME,
           discharge_summary = $1,
           status = 'discharged'
       WHERE admission_id = $2`,
      [discharge_summary, admissionId]
    );
    
    await client.query(
      'UPDATE Bed SET status = $1, current_patient_id = NULL WHERE bed_id = $2',
      ['available', bed_id]
    );
    
    await client.query('COMMIT');
    console.log(`✅ Patient discharged from admission ${admissionId}`);
    res.json({ success: true, message: 'Patient discharged successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error discharging patient:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});
router.post('/vital-signs', requireRole('nurse'), async (req, res) => {
  try {
    const nurseId = req.session.user.id;
    const { patient_id, record_id, temperature, blood_pressure, pulse_rate, respiratory_rate, oxygen_saturation, notes } = req.body; // ✅ FIXED!

    if (!patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Insert vital signs
    const result = await pool.query(
      `INSERT INTO Vital_Signs (
        patient_id, 
        nurse_id, 
        record_id,
        temperature, 
        blood_pressure, 
        pulse_rate, 
        respiratory_rate, 
        oxygen_saturation, 
        notes,
        recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        patient_id,
        nurseId,
        record_id || null,
        temperature || null,
        blood_pressure || null,
        pulse_rate || null,
        respiratory_rate || null,
        oxygen_saturation || null,
        notes || null
      ]
    );

    console.log(`🩺 Vital signs recorded for patient ${patient_id} by nurse ${nurseId}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error recording vital signs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patients/:patientId/vital-signs', requireRole('nurse'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT record_id, visit_date, notes, diagnosis
       FROM Medical_Record
       WHERE patient_id = $1
       ORDER BY visit_date DESC, record_id DESC
       LIMIT 20`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching vital signs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== DOCTORS LIST =====
router.get('/doctors', requireRole('nurse'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT doctor_id, name, specialization FROM Doctor ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== NURSE TASKS =====
router.get('/tasks', requireRole('nurse'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        nt.*,
        p.name as patient_name,
        p.age,
        p.gender,
        p.blood_type,
        p.is_serious_case,
        d.name as doctor_name,
        d.specialization,
        mr.diagnosis,
        mr.prescription,
        mr.visit_date,
        mr.record_id
      FROM Nurse_Task nt
      JOIN Patient p ON nt.patient_id = p.patient_id
      JOIN Doctor d ON nt.doctor_id = d.doctor_id
      JOIN Medical_Record mr ON nt.record_id = mr.record_id
      WHERE nt.record_id IS NOT NULL
    `;
    
    const params = [];
    if (status) {
      query += ` AND nt.status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY 
      CASE nt.status
        WHEN 'PENDING' THEN 1
        WHEN 'IN_PROGRESS' THEN 2
        WHEN 'COMPLETED' THEN 3
      END,
      nt.created_at DESC`;
    
    const result = await pool.query(query, params);
    console.log(`📋 Retrieved ${result.rows.length} tasks`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching nurse tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== GET MEDICAL REPORT DETAILS =====
router.get('/reports/:recordId', requireRole('nurse'), async (req, res) => {
  try {
    const { recordId } = req.params;
    const result = await pool.query(
      `SELECT 
         mr.*,
         p.name as patient_name,
         p.age,
         p.gender,
         p.blood_type,
         p.contact,
         p.is_serious_case,
         d.name as doctor_name,
         d.specialization,
         d.contact as doctor_contact
       FROM Medical_Record mr
       JOIN Patient p ON mr.patient_id = p.patient_id
       JOIN Doctor d ON mr.doctor_id = d.doctor_id
       WHERE mr.record_id = $1`,
      [recordId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    console.log(`📋 Nurse viewing medical report: ${recordId}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching medical report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== CLAIM TASK (Specific endpoint - MUST BE BEFORE GENERIC PATCH) =====
router.patch('/tasks/:taskId/claim', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { taskId } = req.params;
    const nurseId = req.session.user.id;
    
    console.log(`🔄 Nurse ${nurseId} claiming task ${taskId}`);
    
    const task = await client.query(
      'SELECT * FROM Nurse_Task WHERE task_id = $1 FOR UPDATE',
      [taskId]
    );
    
    if (task.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.rows[0].status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Task already ${task.rows[0].status.toLowerCase()}` 
      });
    }
    
    const result = await client.query(`
      UPDATE Nurse_Task
      SET status = 'IN_PROGRESS',
          assigned_nurse_id = $1
      WHERE task_id = $2
      RETURNING *
    `, [nurseId, taskId]);
    
    await client.query('COMMIT');
    console.log(`✅ Task ${taskId} claimed by nurse ${nurseId}`);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error claiming task:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
});

// ===== UPDATE TASK STATUS (Generic - complete/cancel) =====
router.patch('/tasks/:taskId', requireRole('nurse'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const nurseId = req.session.user.id;
    const { taskId } = req.params;
    const { status, notes } = req.body;
    
    let query = 'UPDATE Nurse_Task SET status = $1';
    const params = [status];
    let paramIndex = 2;
    
    if (status === 'COMPLETED') {
      query += ', completed_at = CURRENT_TIMESTAMP';
    }
    
    if (notes) {
      query += `, notes = $${paramIndex}`;
      params.push(notes);
      paramIndex++;
    }
    
    query += ` WHERE task_id = $${paramIndex} RETURNING *`;
    params.push(parseInt(taskId));
    
    const result = await client.query(query, params);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await client.query('COMMIT');
    console.log(`✅ Task ${taskId} updated to ${status}`);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating task:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});


// ===== ADD NURSING NOTES =====
router.post('/reports/:recordId/notes', requireRole('nurse'), async (req, res) => {
  try {
    const nurseId = req.session.user.id;
    const { recordId } = req.params;
    const { nursing_notes } = req.body;
    
    const currentRecord = await pool.query(
      'SELECT notes FROM Medical_Record WHERE record_id = $1',
      [recordId]
    );
    
    if (currentRecord.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    const existingNotes = JSON.parse(currentRecord.rows[0].notes || '{}');
    existingNotes.nursing_notes = existingNotes.nursing_notes || [];
    existingNotes.nursing_notes.push({
      nurse_id: nurseId,
      timestamp: new Date().toISOString(),
      notes: nursing_notes
    });
    
    await pool.query(
      'UPDATE Medical_Record SET notes = $1 WHERE record_id = $2',
      [JSON.stringify(existingNotes), recordId]
    );
    
    console.log(`✅ Nursing notes added to record ${recordId}`);
    res.json({ success: true, message: 'Nursing notes added successfully' });
  } catch (err) {
    console.error('❌ Error adding nursing notes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
 // ===== GET PRESCRIBED MEDICINES FOR A REPORT =====
router.get('/reports/:recordId/medicines', requireRole('nurse'), async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const result = await pool.query(
      `SELECT 
         pi.prescription_id,
         pi.medicine_name,
         pi.dosage,
         pi.frequency,
         pi.duration,
         pi.quantity_prescribed,
         pi.instructions,
         pi.prescribed_at
       FROM Prescription_Item pi
       WHERE pi.record_id = $1
       ORDER BY pi.prescription_id`,
      [recordId]
    );
    
    console.log(`💊 Retrieved ${result.rows.length} prescribed medicines for record ${recordId}`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching prescribed medicines:', err);
    res.status(500).json({ message: 'Server error' });  // ✅ FIXED: Parenthesis corrected
  }
});

module.exports = router;
