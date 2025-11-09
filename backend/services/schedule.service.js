const pool = require('../config/database');

class ScheduleService {
  // ===== DOCTOR SCHEDULING =====
  
  static async assignDoctorToWard(adminId, scheduleData) {
    const { doctor_id, ward_id, week_start, week_end, shift_type, is_on_call, notes } = scheduleData;
    
    // Validation
    const weekStart = new Date(week_start);
    const weekEnd = new Date(week_end);
    
    if (weekEnd <= weekStart) {
      throw new Error('INVALID_DATE_RANGE');
    }
    
    // Check for conflicts
    const conflict = await pool.query(`
      SELECT schedule_id FROM Doctor_Ward_Schedule
      WHERE doctor_id = $1
        AND status = 'active'
        AND (
          (week_start <= $2 AND week_end >= $2) OR
          (week_start <= $3 AND week_end >= $3) OR
          (week_start >= $2 AND week_end <= $3)
        )
    `, [doctor_id, week_start, week_end]);
    
    if (conflict.rows.length > 0) {
      throw new Error('SCHEDULE_CONFLICT');
    }
    
    const result = await pool.query(`
      INSERT INTO Doctor_Ward_Schedule 
      (doctor_id, ward_id, week_start, week_end, shift_type, is_on_call, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [doctor_id, ward_id, week_start, week_end, shift_type || 'DAY', is_on_call || false, notes, adminId]);
    
    console.log(`✅ Doctor ${doctor_id} assigned to Ward ${ward_id} for ${week_start} to ${week_end}`);
    return result.rows[0];
  }
  
  static async getDoctorSchedules(filters = {}) {
    let query = `
      SELECT
        dws.*,
        d.name as doctor_name,
        d.specialization,
        d.contact,
        w.name as ward_name,
        w.category,
        w.location
      FROM Doctor_Ward_Schedule dws
      JOIN Doctor d ON dws.doctor_id = d.doctor_id
      JOIN Ward w ON dws.ward_id = w.ward_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (filters.doctor_id) {
      query += ` AND dws.doctor_id = $${paramIndex}`;
      params.push(filters.doctor_id);
      paramIndex++;
    }
    
    if (filters.ward_id) {
      query += ` AND dws.ward_id = $${paramIndex}`;
      params.push(filters.ward_id);
      paramIndex++;
    }
    
    if (filters.week_start) {
      query += ` AND dws.week_start >= $${paramIndex}`;
      params.push(filters.week_start);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND dws.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    query += ` ORDER BY dws.week_start DESC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  static async getCurrentDoctorSchedule(doctorId) {
    const result = await pool.query(`
      SELECT
        dws.*,
        w.name as ward_name,
        w.category,
        w.location,
        w.bed_capacity,
        COUNT(b.bed_id) FILTER (WHERE b.status = 'occupied') as occupied_beds
      FROM Doctor_Ward_Schedule dws
      JOIN Ward w ON dws.ward_id = w.ward_id
      LEFT JOIN Bed b ON w.ward_id = b.ward_id
      WHERE dws.doctor_id = $1
        AND dws.status = 'active'
        AND CURRENT_DATE BETWEEN dws.week_start AND dws.week_end
      GROUP BY dws.schedule_id, w.ward_id, w.name, w.category, w.location, w.bed_capacity
      ORDER BY dws.week_start
    `, [doctorId]);
    
    console.log(`📋 Retrieved ${result.rows.length} active schedules for Doctor ${doctorId}`);
    return result.rows;
  }
  
  // ===== NURSE SCHEDULING =====
  
  static async assignNurseToWard(adminId, scheduleData) {
    const { nurse_id, ward_id, week_start, week_end, shift_type, notes } = scheduleData;
    
    // Validation
    const weekStart = new Date(week_start);
    const weekEnd = new Date(week_end);
    
    if (weekEnd <= weekStart) {
      throw new Error('INVALID_DATE_RANGE');
    }
    
    // Check for conflicts
    const conflict = await pool.query(`
      SELECT schedule_id FROM Nurse_Ward_Schedule
      WHERE nurse_id = $1
        AND status = 'active'
        AND (
          (week_start <= $2 AND week_end >= $2) OR
          (week_start <= $3 AND week_end >= $3) OR
          (week_start >= $2 AND week_end <= $3)
        )
    `, [nurse_id, week_start, week_end]);
    
    if (conflict.rows.length > 0) {
      throw new Error('SCHEDULE_CONFLICT');
    }
    
    const result = await pool.query(`
      INSERT INTO Nurse_Ward_Schedule 
      (nurse_id, ward_id, week_start, week_end, shift_type, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nurse_id, ward_id, week_start, week_end, shift_type || 'DAY', notes, adminId]);
    
    console.log(`✅ Nurse ${nurse_id} assigned to Ward ${ward_id} for ${week_start} to ${week_end}`);
    return result.rows[0];
  }
  
  static async getNurseSchedules(filters = {}) {
    let query = `
      SELECT
        nws.*,
        n.name as nurse_name,
        n.contact,
        w.name as ward_name,
        w.category,
        w.location
      FROM Nurse_Ward_Schedule nws
      JOIN Nurse n ON nws.nurse_id = n.nurse_id
      JOIN Ward w ON nws.ward_id = w.ward_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (filters.nurse_id) {
      query += ` AND nws.nurse_id = $${paramIndex}`;
      params.push(filters.nurse_id);
      paramIndex++;
    }
    
    if (filters.ward_id) {
      query += ` AND nws.ward_id = $${paramIndex}`;
      params.push(filters.ward_id);
      paramIndex++;
    }
    
    if (filters.week_start) {
      query += ` AND nws.week_start >= $${paramIndex}`;
      params.push(filters.week_start);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND nws.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    query += ` ORDER BY nws.week_start DESC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  static async getCurrentNurseSchedule(nurseId) {
    const result = await pool.query(`
      SELECT
        nws.*,
        w.name as ward_name,
        w.category,
        w.location,
        w.bed_capacity,
        COUNT(b.bed_id) FILTER (WHERE b.status = 'occupied') as occupied_beds
      FROM Nurse_Ward_Schedule nws
      JOIN Ward w ON nws.ward_id = w.ward_id
      LEFT JOIN Bed b ON w.ward_id = b.ward_id
      WHERE nws.nurse_id = $1
        AND nws.status = 'active'
        AND CURRENT_DATE BETWEEN nws.week_start AND nws.week_end
      GROUP BY nws.schedule_id, w.ward_id, w.name, w.category, w.location, w.bed_capacity
      ORDER BY nws.week_start
    `, [nurseId]);
    
    console.log(`📋 Retrieved ${result.rows.length} active schedules for Nurse ${nurseId}`);
    return result.rows;
  }
  
  // ===== SCHEDULE MANAGEMENT =====
  
  static async updateSchedule(scheduleId, type, updates) {
    const table = type === 'doctor' ? 'Doctor_Ward_Schedule' : 'Nurse_Ward_Schedule';
    
    const { shift_type, is_on_call, notes, status } = updates;
    
    let query = `UPDATE ${table} SET `;
    const params = [];
    const updateFields = [];
    let paramIndex = 1;
    
    if (shift_type) {
      updateFields.push(`shift_type = $${paramIndex}`);
      params.push(shift_type);
      paramIndex++;
    }
    
    if (is_on_call !== undefined && type === 'doctor') {
      updateFields.push(`is_on_call = $${paramIndex}`);
      params.push(is_on_call);
      paramIndex++;
    }
    
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }
    
    if (status) {
      updateFields.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (updateFields.length === 0) {
      throw new Error('NO_UPDATES_PROVIDED');
    }
    
    query += updateFields.join(', ');
    query += ` WHERE schedule_id = $${paramIndex} RETURNING *`;
    params.push(scheduleId);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('SCHEDULE_NOT_FOUND');
    }
    
    console.log(`✅ ${type} schedule ${scheduleId} updated`);
    return result.rows[0];
  }
  
  static async cancelSchedule(scheduleId, type) {
    const table = type === 'doctor' ? 'Doctor_Ward_Schedule' : 'Nurse_Ward_Schedule';
    
    const result = await pool.query(`
      UPDATE ${table}
      SET status = 'cancelled'
      WHERE schedule_id = $1
      RETURNING *
    `, [scheduleId]);
    
    if (result.rows.length === 0) {
      throw new Error('SCHEDULE_NOT_FOUND');
    }
    
    console.log(`❌ ${type} schedule ${scheduleId} cancelled`);
    return result.rows[0];
  }
  
  static async deleteSchedule(scheduleId, type) {
    const table = type === 'doctor' ? 'Doctor_Ward_Schedule' : 'Nurse_Ward_Schedule';
    
    const result = await pool.query(`
      DELETE FROM ${table}
      WHERE schedule_id = $1
      RETURNING *
    `, [scheduleId]);
    
    if (result.rows.length === 0) {
      throw new Error('SCHEDULE_NOT_FOUND');
    }
    
    console.log(`🗑️ ${type} schedule ${scheduleId} deleted`);
    return result.rows[0];
  }
  
  // ===== WARD SCHEDULE OVERVIEW =====
  
  static async getWardScheduleSummary(wardId, weekStart) {
    const [doctors, nurses] = await Promise.all([
      pool.query(`
        SELECT 
          d.doctor_id,
          d.name, 
          d.specialization,
          dws.shift_type, 
          dws.is_on_call,
          dws.schedule_id
        FROM Doctor_Ward_Schedule dws
        JOIN Doctor d ON dws.doctor_id = d.doctor_id
        WHERE dws.ward_id = $1
          AND dws.week_start = $2
          AND dws.status = 'active'
      `, [wardId, weekStart]),
      
      pool.query(`
        SELECT 
          n.nurse_id,
          n.name, 
          nws.shift_type,
          nws.schedule_id
        FROM Nurse_Ward_Schedule nws
        JOIN Nurse n ON nws.nurse_id = n.nurse_id
        WHERE nws.ward_id = $1
          AND nws.week_start = $2
          AND nws.status = 'active'
      `, [wardId, weekStart])
    ]);
    
    return {
      ward_id: wardId,
      week_start: weekStart,
      doctors: doctors.rows,
      nurses: nurses.rows,
      total_doctors: doctors.rows.length,
      total_nurses: nurses.rows.length
    };
  }
  
  // ===== UPCOMING SCHEDULES =====
  
  static async getUpcomingSchedules(type, limit = 10) {
    const table = type === 'doctor' ? 'Doctor_Ward_Schedule' : 'Nurse_Ward_Schedule';
    const joinTable = type === 'doctor' ? 'Doctor' : 'Nurse';
    const idColumn = type === 'doctor' ? 'doctor_id' : 'nurse_id';
    
    const result = await pool.query(`
      SELECT
        s.*,
        staff.name as staff_name,
        ${type === 'doctor' ? 'staff.specialization,' : ''}
        w.name as ward_name,
        w.category,
        w.location
      FROM ${table} s
      JOIN ${joinTable} staff ON s.${idColumn} = staff.${idColumn}
      JOIN Ward w ON s.ward_id = w.ward_id
      WHERE s.week_start >= CURRENT_DATE
        AND s.status = 'active'
      ORDER BY s.week_start ASC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }
}

module.exports = ScheduleService;
