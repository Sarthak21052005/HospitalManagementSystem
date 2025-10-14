const pool = require('../config/database');

/**
 * Get all patients (Reception view)
 */
exports.getAllPatients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT patient_id, name, age, gender, contact, 
             date_registered, time_registered, is_serious_case
      FROM Patient 
      ORDER BY patient_id DESC
    `);
    
    console.log(`📋 Retrieved ${result.rows.length} patients`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching patients:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Register new patient
 */
exports.registerPatient = async (req, res) => {
  try {
    const { 
      name, age, gender, contact, address, 
      emergency_contact, blood_type, 
      is_serious_case, serious_case_notes 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO Patient (
        name, age, gender, contact, address, emergency_contact, blood_type, 
        is_serious_case, serious_case_notes, date_registered, time_registered
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, CURRENT_TIME) 
      RETURNING *`,
      [
        name, 
        age, 
        gender, 
        contact, 
        address, 
        emergency_contact || null, 
        blood_type || null,
        is_serious_case || false,
        serious_case_notes || null
      ]
    );
    
    const patient = result.rows[0];
    console.log(`✅ Patient registered: ${name} (ID: ${patient.patient_id})`);
    
    res.status(201).json(patient);
  } catch (err) {
    console.error('❌ Patient registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get patient by ID
 */
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM Patient WHERE patient_id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    console.log(`📄 Retrieved patient: ${result.rows[0].name} (ID: ${id})`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching patient:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
