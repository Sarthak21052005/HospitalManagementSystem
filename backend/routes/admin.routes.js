const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const pool = require('../config/database');

// ===== DOCTORS =====

// Get all doctors
router.get('/doctors', requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT doctor_id, email, name, specialization, contact, working_hours FROM Doctor ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new doctor
router.post('/doctors', requireRole('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('specialization').notEmpty().trim(),
  body('contact').notEmpty().trim(),
  body('working_hours').optional()
], validate, async (req, res) => {
  try {
    const { email, password, name, specialization, contact, working_hours } = req.body;
    
    const existing = await pool.query('SELECT email FROM Doctor WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const result = await pool.query(
      `INSERT INTO Doctor (email, password, name, specialization, contact, working_hours) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING doctor_id, email, name, specialization, contact, working_hours`,
      [email, password, name, specialization, contact, working_hours || '9AM-5PM']
    );
    
    console.log(`✅ Doctor added: ${name} (${email})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor
router.put('/doctors/:id', requireRole('admin'), [
  body('name').optional().trim(),
  body('specialization').optional().trim(),
  body('contact').optional().trim(),
  body('working_hours').optional()
], validate, async (req, res) => {
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
    
    console.log(`✅ Doctor updated: ${result.rows[0].name}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete doctor
router.delete('/doctors/:id', requireRole('admin'), async (req, res) => {
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
    console.error('Error deleting doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== NURSES =====

// Get all nurses
router.get('/nurses', requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT nurse_id, email, name, contact FROM Nurse ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new nurse
router.post('/nurses', requireRole('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('contact').notEmpty().trim()
], validate, async (req, res) => {
  try {
    const { email, password, name, contact } = req.body;
    
    const existing = await pool.query('SELECT email FROM Nurse WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const result = await pool.query(
      `INSERT INTO Nurse (email, password, name, contact) 
       VALUES ($1, $2, $3, $4) RETURNING nurse_id, email, name, contact`,
      [email, password, name, contact]
    );
    
    console.log(`✅ Nurse added: ${name} (${email})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding nurse:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update nurse
router.put('/nurses/:id', requireRole('admin'), [
  body('name').optional().trim(),
  body('contact').optional().trim()
], validate, async (req, res) => {
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
    
    console.log(`✅ Nurse updated: ${result.rows[0].name}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating nurse:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete nurse
router.delete('/nurses/:id', requireRole('admin'), async (req, res) => {
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
    console.error('Error deleting nurse:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
