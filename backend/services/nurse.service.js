const pool = require('../config/database');

class NurseService {
  // ===== DASHBOARD STATS =====
  static async getStats(nurseId) {
    const [wards, patients, beds, critical] = await Promise.all([
      pool.query(`
        SELECT COUNT(DISTINCT ward_id) as count
        FROM Ward_Nurse
        WHERE nurse_id = $1 AND end_date IS NULL
      `, [nurseId]),
      
      pool.query(`
        SELECT COUNT(DISTINCT ipd.patient_id) as count
        FROM IPD_Admission ipd
        JOIN Bed b ON ipd.bed_id = b.bed_id
        JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
        WHERE wn.nurse_id = $1 AND wn.end_date IS NULL AND ipd.discharge_date IS NULL
      `, [nurseId]),
      
      pool.query(`
        SELECT COUNT(*) as count
        FROM Bed b
        JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
        WHERE wn.nurse_id = $1 AND wn.end_date IS NULL AND b.status = 'available'
      `, [nurseId]),
      
      pool.query(`
        SELECT COUNT(DISTINCT p.patient_id) as count
        FROM Patient p
        JOIN IPD_Admission ipd ON p.patient_id = ipd.patient_id
        JOIN Bed b ON ipd.bed_id = b.bed_id
        JOIN Ward_Nurse wn ON b.ward_id = wn.ward_id
        WHERE wn.nurse_id = $1 AND wn.end_date IS NULL 
          AND p.is_serious_case = true AND ipd.discharge_date IS NULL
      `, [nurseId])
    ]);

    return {
      totalWards: parseInt(wards.rows[0].count),
      admittedPatients: parseInt(patients.rows[0].count),
      availableBeds: parseInt(beds.rows[0].count),
      criticalPatients: parseInt(critical.rows[0].count)
    };
  }

  // ===== WARD & BED MANAGEMENT =====
  static async getWards(nurseId) {
    const result = await pool.query(`
      SELECT
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
      WHERE wn.nurse_id = $1 AND wn.end_date IS NULL
      GROUP BY w.ward_id
      ORDER BY w.name
    `, [nurseId]);
    
    return result.rows;
  }

  static async getWardBeds(wardId, nurseId) {
    // Verify access
    const access = await pool.query(`
      SELECT * FROM Ward_Nurse
      WHERE nurse_id = $1 AND ward_id = $2 AND end_date IS NULL
    `, [nurseId, wardId]);
    
    if (access.rows.length === 0) {
      throw new Error('ACCESS_DENIED');
    }

    const result = await pool.query(`
      SELECT
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
      ORDER BY b.bed_number
    `, [wardId]);
    
    return result.rows;
  }

  // ===== PATIENT MANAGEMENT =====
  static async getEligiblePatients() {
    const result = await pool.query(`
      SELECT
        p.patient_id,
        p.name,
        p.age,
        p.gender,
        p.blood_type,
        p.contact,
        p.address,
        p.is_serious_case,
        latest_mr.record_id,
        latest_mr.diagnosis,
        latest_mr.visit_date,
        latest_mr.doctor_name,
        latest_mr.specialization,
        CASE
          WHEN ipd.admission_id IS NOT NULL AND ipd.discharge_date IS NULL
          THEN TRUE
          ELSE FALSE
        END as currently_admitted,
        ipd.bed_id as current_bed_id,
        b.bed_number as current_bed_number,
        w.name as current_ward_name
      FROM Patient p
      INNER JOIN (
        SELECT DISTINCT ON (mr.patient_id)
          mr.patient_id,
          mr.record_id,
          mr.diagnosis,
          mr.visit_date,
          d.name as doctor_name,
          d.specialization
        FROM Medical_Record mr
        INNER JOIN Doctor d ON mr.doctor_id = d.doctor_id
        ORDER BY mr.patient_id, mr.visit_date DESC
      ) latest_mr ON p.patient_id = latest_mr.patient_id
      LEFT JOIN IPD_Admission ipd ON p.patient_id = ipd.patient_id AND ipd.discharge_date IS NULL
      LEFT JOIN Bed b ON ipd.bed_id = b.bed_id
      LEFT JOIN Ward w ON b.ward_id = w.ward_id
      ORDER BY CASE WHEN p.is_serious_case THEN 0 ELSE 1 END, latest_mr.visit_date DESC
    `);
    
    return result.rows;
  }

  static async getAdmittedPatients(nurseId) {
    const result = await pool.query(`
      SELECT
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
      WHERE wn.nurse_id = $1 AND wn.end_date IS NULL AND ipd.discharge_date IS NULL
      ORDER BY p.is_serious_case DESC, ipd.admission_date DESC
    `, [nurseId]);
    
    return result.rows;
  }

  // ===== ADMISSION MANAGEMENT =====
  static async admitPatient(nurseId, admissionData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { patient_id, ward_id, bed_id, doctor_id, admission_reason, expected_discharge_date } = admissionData;

      // Validation
      if (!patient_id || !bed_id || !doctor_id || !admission_reason) {
        throw new Error('MISSING_FIELDS');
      }

      // Verify patient has medical record
      const medicalRecord = await client.query(
        'SELECT record_id FROM Medical_Record WHERE patient_id = $1 ORDER BY visit_date DESC LIMIT 1',
        [patient_id]
      );
      
      if (medicalRecord.rows.length === 0) {
        throw new Error('NO_MEDICAL_RECORD');
      }

      // Verify nurse ward access
      const wardAccess = await client.query(
        'SELECT * FROM Ward_Nurse WHERE nurse_id = $1 AND ward_id = $2 AND end_date IS NULL',
        [nurseId, ward_id]
      );
      
      if (wardAccess.rows.length === 0) {
        throw new Error('ACCESS_DENIED');
      }

      // Check if patient already admitted (bed reassignment)
      const existingAdmission = await client.query(
        'SELECT admission_id, bed_id FROM IPD_Admission WHERE patient_id = $1 AND discharge_date IS NULL',
        [patient_id]
      );

      if (existingAdmission.rows.length > 0) {
        // BED REASSIGNMENT
        const old_admission_id = existingAdmission.rows[0].admission_id;
        const old_bed_id = existingAdmission.rows[0].bed_id;

        console.log(`🔄 Reassigning patient ${patient_id} from bed ${old_bed_id} to bed ${bed_id}`);

        // Check new bed availability
        const newBed = await client.query('SELECT status FROM Bed WHERE bed_id = $1', [bed_id]);
        if (newBed.rows.length === 0) throw new Error('BED_NOT_FOUND');
        if (newBed.rows[0].status !== 'available') throw new Error('BED_NOT_AVAILABLE');

        // Release old bed
        await client.query(
          'UPDATE Bed SET status = $1, current_patient_id = NULL WHERE bed_id = $2',
          ['available', old_bed_id]
        );

        // Occupy new bed
        await client.query(
          'UPDATE Bed SET status = $1, current_patient_id = $2 WHERE bed_id = $3',
          ['occupied', patient_id, bed_id]
        );

        // Update admission
        await client.query(
          'UPDATE IPD_Admission SET bed_id = $1 WHERE admission_id = $2',
          [bed_id, old_admission_id]
        );

        await client.query('COMMIT');
        console.log(`✅ Patient ${patient_id} reassigned to bed ${bed_id}`);
        return { admission_id: old_admission_id, reassignment: true };
        
      } else {
        // NEW ADMISSION
        const bedCheck = await client.query('SELECT status FROM Bed WHERE bed_id = $1', [bed_id]);
        if (bedCheck.rows.length === 0) throw new Error('BED_NOT_FOUND');
        if (bedCheck.rows[0].status !== 'available') throw new Error('BED_NOT_AVAILABLE');

        // Create admission
        const admission = await client.query(`
          INSERT INTO IPD_Admission 
          (patient_id, bed_id, doctor_id, admission_date, admission_time, admission_reason, expected_discharge_date)
          VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIME, $4, $5)
          RETURNING admission_id
        `, [patient_id, bed_id, doctor_id, admission_reason, expected_discharge_date]);

        // Update bed
        await client.query(
          'UPDATE Bed SET status = $1, current_patient_id = $2 WHERE bed_id = $3',
          ['occupied', patient_id, bed_id]
        );

        await client.query('COMMIT');
        console.log(`✅ Patient ${patient_id} admitted to bed ${bed_id} by nurse ${nurseId}`);
        return { admission_id: admission.rows[0].admission_id, reassignment: false };
      }
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async dischargePatient(admissionId, discharge_summary) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const admission = await client.query(
        'SELECT bed_id, patient_id FROM IPD_Admission WHERE admission_id = $1',
        [admissionId]
      );
      
      if (admission.rows.length === 0) throw new Error('ADMISSION_NOT_FOUND');

      const { bed_id, patient_id } = admission.rows[0];

      await client.query(`
        UPDATE IPD_Admission
        SET discharge_date = CURRENT_DATE, discharge_time = CURRENT_TIME,
            discharge_summary = $1, status = 'discharged'
        WHERE admission_id = $2
      `, [discharge_summary, admissionId]);

      await client.query(
        'UPDATE Bed SET status = $1, current_patient_id = NULL WHERE bed_id = $2',
        ['available', bed_id]
      );

      await client.query('COMMIT');
      console.log(`✅ Patient ${patient_id} discharged from admission ${admissionId}`);
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== VITAL SIGNS =====
  static async recordVitalSigns(nurseId, vitalData) {
    const { patient_id, record_id, temperature, blood_pressure, pulse_rate, respiratory_rate, oxygen_saturation, notes } = vitalData;

    if (!patient_id) {
      throw new Error('PATIENT_ID_REQUIRED');
    }

    const result = await pool.query(`
      INSERT INTO Vital_Signs (
        patient_id, nurse_id, record_id, temperature, blood_pressure,
        pulse_rate, respiratory_rate, oxygen_saturation, notes, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      patient_id,
      nurseId,
      record_id || null,
      temperature || null,
      blood_pressure || null,
      pulse_rate || null,
      respiratory_rate || null,
      oxygen_saturation || null,
      notes || null
    ]);
    
    return result.rows[0];
  }

  static async getPatientVitalSigns(patientId) {
    const result = await pool.query(`
      SELECT record_id, visit_date, notes, diagnosis
      FROM Medical_Record
      WHERE patient_id = $1
      ORDER BY visit_date DESC, record_id DESC
      LIMIT 20
    `, [patientId]);
    
    return result.rows;
  }

  // ===== TASKS =====
  static async getTasks(filters = {}) {
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
    if (filters.status) {
      query += ' AND nt.status = $1';
      params.push(filters.status);
    }

    query += ` ORDER BY
      CASE nt.status
        WHEN 'PENDING' THEN 1
        WHEN 'IN_PROGRESS' THEN 2
        WHEN 'COMPLETED' THEN 3
      END,
      nt.created_at DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async claimTask(taskId, nurseId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const task = await client.query(
        'SELECT * FROM Nurse_Task WHERE task_id = $1 FOR UPDATE',
        [taskId]
      );
      
      if (task.rows.length === 0) throw new Error('TASK_NOT_FOUND');
      if (task.rows[0].status !== 'PENDING') throw new Error('TASK_ALREADY_CLAIMED');

      const result = await client.query(`
        UPDATE Nurse_Task
        SET status = 'IN_PROGRESS', assigned_nurse_id = $1
        WHERE task_id = $2
        RETURNING *
      `, [nurseId, taskId]);

      await client.query('COMMIT');
      console.log(`✅ Task ${taskId} claimed by nurse ${nurseId}`);
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateTask(taskId, updates) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { status, notes } = updates;
      
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
      if (result.rows.length === 0) throw new Error('TASK_NOT_FOUND');
      
      await client.query('COMMIT');
      console.log(`✅ Task ${taskId} updated to ${status}`);
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== MEDICAL RECORDS =====
  static async getMedicalReport(recordId) {
    const result = await pool.query(`
      SELECT
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
      WHERE mr.record_id = $1
    `, [recordId]);
    
    if (result.rows.length === 0) throw new Error('RECORD_NOT_FOUND');
    return result.rows[0];
  }

  static async addNursingNotes(recordId, nurseId, nursing_notes) {
    const current = await pool.query(
      'SELECT notes FROM Medical_Record WHERE record_id = $1',
      [recordId]
    );
    
    if (current.rows.length === 0) throw new Error('RECORD_NOT_FOUND');

    const existingNotes = JSON.parse(current.rows[0].notes || '{}');
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
    return { success: true };
  }

  static async getPrescribedMedicines(recordId) {
    const result = await pool.query(`
      SELECT
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
      ORDER BY pi.prescription_id
    `, [recordId]);
    
    return result.rows;
  }

  // ===== DOCTORS LIST =====
  static async getDoctors() {
    const result = await pool.query(
      'SELECT doctor_id, name, specialization FROM Doctor ORDER BY name'
    );
    return result.rows;
  }
}

module.exports = NurseService;
