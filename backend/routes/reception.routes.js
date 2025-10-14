const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');

// Get all patients (Reception view - NO AUTH REQUIRED)
router.get('/patients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT patient_id, name, age, gender, contact, 
             date_registered, time_registered, is_serious_case
      FROM Patient 
      ORDER BY patient_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new patient (Reception - NO AUTH REQUIRED)
router.post('/register', [
  body('name').notEmpty().trim(),
  body('age').isInt({ min: 0 }),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('contact').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('emergency_contact').optional({ nullable: true }).trim(),
  body('blood_type').optional({ nullable: true }),
  body('is_serious_case').optional().isBoolean(),
  body('serious_case_notes').optional({ nullable: true }).trim()
], validate, async (req, res) => {
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
        name, age, gender, contact, address, 
        emergency_contact || null, 
        blood_type || null,
        is_serious_case || false,
        serious_case_notes || null
      ]
    );
    
    console.log(`✅ Patient registered by Reception: ${name} (ID: ${result.rows[0].patient_id})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Patient registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient by ID (Reception - NO AUTH)
router.get('/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM Patient WHERE patient_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
