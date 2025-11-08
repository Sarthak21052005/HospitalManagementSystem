const pool = require('../config/database');

class AdminService {
  // ===== DOCTORS MANAGEMENT =====
  static async getAllDoctors() {
    const result = await pool.query(
      'SELECT doctor_id, email, name, specialization, contact, working_hours FROM Doctor ORDER BY name'
    );
    return result.rows;
  }

  static async addDoctor(doctorData) {
    const { email, password, name, specialization, contact, working_hours } = doctorData;

    // Check if email exists
    const existing = await pool.query('SELECT email FROM Doctor WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }

    const result = await pool.query(
      `INSERT INTO Doctor (email, password, name, specialization, contact, working_hours)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING doctor_id, email, name, specialization, contact, working_hours`,
      [email, password, name, specialization, contact, working_hours || '9AM-5PM']
    );

    return result.rows[0];
  }

  static async updateDoctor(doctorId, updates) {
    const { name, specialization, contact, working_hours } = updates;

    const result = await pool.query(
      `UPDATE Doctor
       SET name = COALESCE($1, name),
           specialization = COALESCE($2, specialization),
           contact = COALESCE($3, contact),
           working_hours = COALESCE($4, working_hours)
       WHERE doctor_id = $5
       RETURNING doctor_id, email, name, specialization, contact, working_hours`,
      [name, specialization, contact, working_hours, doctorId]
    );

    if (result.rows.length === 0) throw new Error('DOCTOR_NOT_FOUND');
    return result.rows[0];
  }

  static async deleteDoctor(doctorId) {
    const result = await pool.query(
      'DELETE FROM Doctor WHERE doctor_id = $1 RETURNING name',
      [doctorId]
    );

    if (result.rows.length === 0) throw new Error('DOCTOR_NOT_FOUND');
    return result.rows[0];
  }

  // ===== NURSES MANAGEMENT =====
  static async getAllNurses() {
    const result = await pool.query(
      'SELECT nurse_id, email, name, contact FROM Nurse ORDER BY name'
    );
    return result.rows;
  }

  static async addNurse(nurseData) {
    const { email, password, name, contact } = nurseData;

    // Check if email exists
    const existing = await pool.query('SELECT email FROM Nurse WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }

    const result = await pool.query(
      `INSERT INTO Nurse (email, password, name, contact)
       VALUES ($1, $2, $3, $4) 
       RETURNING nurse_id, email, name, contact`,
      [email, password, name, contact]
    );

    return result.rows[0];
  }

  static async updateNurse(nurseId, updates) {
    const { name, contact } = updates;

    const result = await pool.query(
      `UPDATE Nurse
       SET name = COALESCE($1, name),
           contact = COALESCE($2, contact)
       WHERE nurse_id = $3
       RETURNING nurse_id, email, name, contact`,
      [name, contact, nurseId]
    );

    if (result.rows.length === 0) throw new Error('NURSE_NOT_FOUND');
    return result.rows[0];
  }

  static async deleteNurse(nurseId) {
    const result = await pool.query(
      'DELETE FROM Nurse WHERE nurse_id = $1 RETURNING name',
      [nurseId]
    );

    if (result.rows.length === 0) throw new Error('NURSE_NOT_FOUND');
    return result.rows[0];
  }

  // ===== WARD ASSIGNMENT MANAGEMENT =====
  static async getWardAssignments() {
    const result = await pool.query(`
      SELECT
        wn.ward_nurse_id,
        wn.ward_id,
        wn.nurse_id,
        wn.start_date,
        wn.end_date,
        w.name as ward_name,
        w.category as ward_category,
        w.location as ward_location,
        n.name as nurse_name,
        n.email as nurse_email,
        n.contact as nurse_contact,
        CASE WHEN wn.end_date IS NULL THEN 'active' ELSE 'inactive' END as status
      FROM Ward_Nurse wn
      JOIN Ward w ON wn.ward_id = w.ward_id
      JOIN Nurse n ON wn.nurse_id = n.nurse_id
      ORDER BY
        CASE WHEN wn.end_date IS NULL THEN 0 ELSE 1 END,
        wn.start_date DESC
    `);
    return result.rows;
  }

  static async getAvailableNurses() {
    const result = await pool.query(`
      SELECT
        n.nurse_id,
        n.name,
        n.email,
        n.contact,
        n.hired_date,
        COUNT(wn.ward_nurse_id) as current_assignments
      FROM Nurse n
      LEFT JOIN Ward_Nurse wn ON n.nurse_id = wn.nurse_id AND wn.end_date IS NULL
      GROUP BY n.nurse_id, n.name, n.email, n.contact, n.hired_date
      ORDER BY n.name
    `);
    return result.rows;
  }

  static async getWardsListWithStats() {
    const result = await pool.query(`
      SELECT
        w.ward_id,
        w.name,
        w.category,
        w.location,
        w.capacity,
        w.bed_capacity,
        COUNT(wn.ward_nurse_id) FILTER (WHERE wn.end_date IS NULL) as assigned_nurses
      FROM Ward w
      LEFT JOIN Ward_Nurse wn ON w.ward_id = wn.ward_id AND wn.end_date IS NULL
      GROUP BY w.ward_id, w.name, w.category, w.location, w.capacity, w.bed_capacity
      ORDER BY w.name
    `);
    return result.rows;
  }

  static async assignWard(nurse_id, ward_id) {
    // Check if nurse is already assigned to this ward
    const existingAssignment = await pool.query(`
      SELECT ward_nurse_id
      FROM Ward_Nurse
      WHERE nurse_id = $1 AND ward_id = $2 AND end_date IS NULL
    `, [nurse_id, ward_id]);

    if (existingAssignment.rows.length > 0) {
      throw new Error('ALREADY_ASSIGNED');
    }

    // Create new assignment
    const result = await pool.query(`
      INSERT INTO Ward_Nurse (nurse_id, ward_id, start_date)
      VALUES ($1, $2, CURRENT_DATE)
      RETURNING *
    `, [nurse_id, ward_id]);

    return result.rows[0];
  }

  static async unassignWard(ward_nurse_id) {
    const result = await pool.query(`
      UPDATE Ward_Nurse
      SET end_date = CURRENT_DATE
      WHERE ward_nurse_id = $1 AND end_date IS NULL
      RETURNING *
    `, [ward_nurse_id]);

    if (result.rows.length === 0) {
      throw new Error('ASSIGNMENT_NOT_FOUND');
    }

    return result.rows[0];
  }

  static async reassignWard(old_ward_nurse_id, new_ward_id) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get nurse_id from old assignment
      const oldAssignment = await client.query(`
        SELECT nurse_id FROM Ward_Nurse WHERE ward_nurse_id = $1
      `, [old_ward_nurse_id]);

      if (oldAssignment.rows.length === 0) {
        throw new Error('ASSIGNMENT_NOT_FOUND');
      }

      const nurse_id = oldAssignment.rows[0].nurse_id;

      // End old assignment
      await client.query(`
        UPDATE Ward_Nurse
        SET end_date = CURRENT_DATE
        WHERE ward_nurse_id = $1
      `, [old_ward_nurse_id]);

      // Create new assignment
      const newAssignment = await client.query(`
        INSERT INTO Ward_Nurse (nurse_id, ward_id, start_date)
        VALUES ($1, $2, CURRENT_DATE)
        RETURNING *
      `, [nurse_id, new_ward_id]);

      await client.query('COMMIT');
      return newAssignment.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===== BED MANAGEMENT =====
  static async getAllBeds() {
    const result = await pool.query(`
      SELECT
        b.bed_id,
        b.bed_number,
        b.status,
        b.ward_id,
        b.current_patient_id,
        w.name as ward_name,
        w.category as ward_category,
        w.location as ward_location,
        w.bed_capacity,
        p.name as patient_name,
        p.contact as patient_contact
      FROM Bed b
      JOIN Ward w ON b.ward_id = w.ward_id
      LEFT JOIN Patient p ON b.current_patient_id = p.patient_id
      ORDER BY w.name, b.bed_number
    `);
    return result.rows;
  }

  static async getBedsByWard(wardId) {
    const result = await pool.query(`
      SELECT
        b.bed_id,
        b.bed_number,
        b.status,
        b.current_patient_id,
        p.name as patient_name,
        p.contact as patient_contact
      FROM Bed b
      LEFT JOIN Patient p ON b.current_patient_id = p.patient_id
      WHERE b.ward_id = $1
      ORDER BY b.bed_number
    `, [wardId]);
    return result.rows;
  }

  static async getWardsWithBedStats() {
    const result = await pool.query(`
      SELECT
        w.ward_id,
        w.name,
        w.category,
        w.location,
        w.capacity,
        w.bed_capacity,
        COUNT(b.bed_id) as current_beds,
        COUNT(b.bed_id) FILTER (WHERE b.status = 'available') as available_beds,
        COUNT(b.bed_id) FILTER (WHERE b.status = 'occupied') as occupied_beds,
        COUNT(b.bed_id) FILTER (WHERE b.status = 'maintenance') as maintenance_beds,
        COUNT(b.bed_id) FILTER (WHERE b.status = 'reserved') as reserved_beds
      FROM Ward w
      LEFT JOIN Bed b ON w.ward_id = b.ward_id
      GROUP BY w.ward_id, w.name, w.category, w.location, w.capacity, w.bed_capacity
      ORDER BY w.name
    `);
    return result.rows;
  }

  static async addBed(bedData) {
    const { ward_id, bed_number } = bedData;

    // Check ward capacity
    const wardCheck = await pool.query(`
      SELECT
        w.bed_capacity,
        COUNT(b.bed_id) as current_beds
      FROM Ward w
      LEFT JOIN Bed b ON w.ward_id = b.ward_id
      WHERE w.ward_id = $1
      GROUP BY w.ward_id, w.bed_capacity
    `, [ward_id]);

    if (wardCheck.rows.length === 0) {
      throw new Error('WARD_NOT_FOUND');
    }

    const { bed_capacity, current_beds } = wardCheck.rows[0];
    if (current_beds >= bed_capacity) {
      throw new Error(`WARD_FULL:${current_beds}:${bed_capacity}`);
    }

    // Check if bed number exists
    const existingBed = await pool.query(`
      SELECT bed_id FROM Bed WHERE ward_id = $1 AND bed_number = $2
    `, [ward_id, bed_number]);

    if (existingBed.rows.length > 0) {
      throw new Error('BED_NUMBER_EXISTS');
    }

    // Add bed
    const result = await pool.query(`
      INSERT INTO Bed (ward_id, bed_number, status)
      VALUES ($1, $2, 'available')
      RETURNING *
    `, [ward_id, bed_number]);

    return result.rows[0];
  }

  static async updateBedStatus(bedId, status) {
    const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
    if (!validStatuses.includes(status)) {
      throw new Error('INVALID_STATUS');
    }

    const result = await pool.query(`
      UPDATE Bed
      SET status = $1
      WHERE bed_id = $2
      RETURNING *
    `, [status, bedId]);

    if (result.rows.length === 0) {
      throw new Error('BED_NOT_FOUND');
    }

    return result.rows[0];
  }

  static async deleteBed(bedId) {
    // Check if bed is occupied
    const bedCheck = await pool.query(`
      SELECT bed_id, status, current_patient_id FROM Bed WHERE bed_id = $1
    `, [bedId]);

    if (bedCheck.rows.length === 0) {
      throw new Error('BED_NOT_FOUND');
    }

    if (bedCheck.rows[0].status === 'occupied' || bedCheck.rows[0].current_patient_id) {
      throw new Error('BED_OCCUPIED');
    }

    // Delete bed
    await pool.query('DELETE FROM Bed WHERE bed_id = $1', [bedId]);
    return { success: true };
  }

  static async bulkAddBeds(bulkData) {
    const { ward_id, bed_prefix, num_beds } = bulkData;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check ward capacity
      const wardCheck = await client.query(`
        SELECT
          w.bed_capacity,
          COUNT(b.bed_id) as current_beds
        FROM Ward w
        LEFT JOIN Bed b ON w.ward_id = b.ward_id
        WHERE w.ward_id = $1
        GROUP BY w.ward_id, w.bed_capacity
      `, [ward_id]);

      if (wardCheck.rows.length === 0) {
        throw new Error('WARD_NOT_FOUND');
      }

      const { bed_capacity, current_beds } = wardCheck.rows[0];
      const available_slots = bed_capacity - current_beds;

      if (num_beds > available_slots) {
        throw new Error(`INSUFFICIENT_CAPACITY:${current_beds}:${bed_capacity}:${available_slots}`);
      }

      // Get current highest bed number for this prefix
      const existingBeds = await client.query(`
        SELECT bed_number FROM Bed
        WHERE ward_id = $1 AND bed_number LIKE $2
        ORDER BY bed_number DESC
      `, [ward_id, `${bed_prefix}%`]);

      let start_number = 1;
      if (existingBeds.rows.length > 0) {
        const lastBed = existingBeds.rows[0].bed_number;
        const lastNumber = parseInt(lastBed.replace(bed_prefix, ''));
        start_number = lastNumber + 1;
      }

      // Add beds
      const addedBeds = [];
      for (let i = 0; i < num_beds; i++) {
        const bed_number = `${bed_prefix}${String(start_number + i).padStart(3, '0')}`;
        const result = await client.query(`
          INSERT INTO Bed (ward_id, bed_number, status)
          VALUES ($1, $2, 'available')
          RETURNING *
        `, [ward_id, bed_number]);
        addedBeds.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return addedBeds;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = AdminService;
