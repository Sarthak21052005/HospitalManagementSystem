const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');

// Get current session
router.get('/session', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({ email: '', role: '', id: null, name: '', who: '' });
  }
  
  const user = req.session.user;
  res.json({
    email: user.email || '',
    role: user.role || '',
    id: user.id || null,
    name: user.name || '',
    who: user.role || ''
  });
});

// Login (Admin, Doctor, Nurse, Lab Technician)
router.post('/login', [
  body('email').notEmpty().trim(),
  body('password').notEmpty(),
  body('role').isIn(['admin', 'doctor', 'nurse', 'lab_technician']) // ✅ MUST ADD LAB_TECHNICIAN HERE
], validate, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(`🔐 Login attempt: ${email} as ${role}`);
    
    let result, idField, identifier;
    
    if (role === 'admin') {
      result = await pool.query('SELECT * FROM Admin WHERE admin_id = $1', [email]);
      idField = 'admin_id';
      identifier = email;
    } else if (role === 'doctor') {
      result = await pool.query('SELECT * FROM Doctor WHERE email = $1', [email]);
      idField = 'doctor_id';
      identifier = email;
    } else if (role === 'nurse') {
      result = await pool.query('SELECT * FROM Nurse WHERE email = $1', [email]);
      idField = 'nurse_id';
      identifier = email;
    } else if (role === 'lab_technician') { // ✅ MUST ADD THIS BLOCK
      result = await pool.query('SELECT * FROM Lab_Technician WHERE email = $1', [email]);
      idField = 'technician_id';
      identifier = email;
    }
    
    if (result.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    if (password !== user.password) {
      console.log(`❌ Password mismatch!`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    req.session.user = {
      email: identifier,
      role,
      id: user[idField],
      name: role === 'admin' ? user.admin_id : user.name
    };
    
    console.log(`✅ Login successful: ${identifier} (${role})`);
    res.json({
      success: true,
      email: identifier,
      role,
      id: user[idField],
      name: role === 'admin' ? user.admin_id : user.name
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  console.log('🚪 Logout request received');
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    console.log('✅ Session destroyed');
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
