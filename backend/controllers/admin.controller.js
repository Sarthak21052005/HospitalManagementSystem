const pool = require('../config/database');

// ===== DOCTOR CONTROLLERS =====

/**
 * Get all doctors
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT doctor_id, email, name, specialization, contact, working_hours FROM Doctor ORDER BY name'
    );
    
    console.log(`👨‍⚕️ Retrieved ${result.rows.length} doctors`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add new doctor
 */
exports.addDoctor = async (req, res) => {
  try {
    const { email, password, name, specialization, contact, working_hours } = req.body;
    
    // Check for duplicate email
    const existing = await pool.query(
      'SELECT email FROM Doctor WHERE email = $1', 
      [email]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Insert new doctor
    const result = await pool.query(
      `INSERT INTO Doctor (email, password, name, specialization, contact, working_hours) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING doctor_id, email, name, specialization, contact, working_hours`,
      [email, password, name, specialization, contact, working_hours || '9AM-5PM']
    );
    
    const doctor = result.rows[0];
    console.log(`✅ Doctor added: ${name} (${email})`);
    
    res.status(201).json(doctor);
  } catch (err) {
    console.error('❌ Error adding doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update doctor
 */
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, contact, working_hours } = req.body;
    
    const result = await pool.query(
      `UPDATE Doctor 
       SET name = COALESCE($1, name),
           specialization = COALESCE($2, specialization),
           contact = COALESCE($3, contact),
           working_hours = COALESCE($4, working_hours)
       WHERE doctor_id = $5
       RETURNING doctor_id, email, name, specialization, contact, working_hours`,
      [name, specialization, contact, working_hours, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const doctor = result.rows[0];
    console.log(`✅ Doctor updated: ${doctor.name}`);
    
    res.json(doctor);
  } catch (err) {
    console.error('❌ Error updating doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete doctor
 */
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM Doctor WHERE doctor_id = $1 RETURNING name',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    console.log(`✅ Doctor deleted: ${result.rows[0].name}`);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ===== NURSE CONTROLLERS =====

/**
 * Get all nurses
 */
exports.getAllNurses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT nurse_id, email, name, contact FROM Nurse ORDER BY name'
    );
    
    console.log(`👩‍⚕️ Retrieved ${result.rows.length} nurses`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching nurses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add new nurse
 */
exports.addNurse = async (req, res) => {
  try {
    const { email, password, name, contact } = req.body;
    
    // Check for duplicate email
    const existing = await pool.query(
      'SELECT email FROM Nurse WHERE email = $1', 
      [email]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Insert new nurse
    const result = await pool.query(
      `INSERT INTO Nurse (email, password, name, contact) 
       VALUES ($1, $2, $3, $4) 
       RETURNING nurse_id, email, name, contact`,
      [email, password, name, contact]
    );
    
    const nurse = result.rows[0];
    console.log(`✅ Nurse added: ${name} (${email})`);
    
    res.status(201).json(nurse);
  } catch (err) {
    console.error('❌ Error adding nurse:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update nurse
 */
exports.updateNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;
    
    const result = await pool.query(
      `UPDATE Nurse 
       SET name = COALESCE($1, name),
           contact = COALESCE($2, contact)
       WHERE nurse_id = $3
       RETURNING nurse_id, email, name, contact`,
      [name, contact, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nurse not found' });
    }
    
    const nurse = result.rows[0];
    console.log(`✅ Nurse updated: ${nurse.name}`);
    
    res.json(nurse);
  } catch (err) {
    console.error('❌ Error updating nurse:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete nurse
 */
exports.deleteNurse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM Nurse WHERE nurse_id = $1 RETURNING name',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nurse not found' });
    }
    
    console.log(`✅ Nurse deleted: ${result.rows[0].name}`);
    res.json({ message: 'Nurse deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting nurse:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
