const pool = require('../config/database');

/**
 * Get current session information
 */
exports.getSession = (req, res) => {
  if (!req.session || !req.session.user) {
    return res.json({ 
      email: '', 
      role: '', 
      id: null, 
      name: '', 
      who: '' 
    });
  }
  
  const user = req.session.user;
  res.json({ 
    email: user.email || '', 
    role: user.role || '', 
    id: user.id || null, 
    name: user.name || '',
    who: user.role || ''
  });
};

/**
 * Handle user login (Admin, Doctor, Nurse, Lab Technician)
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log(`🔐 Login attempt: ${email} as ${role}`);
    
    let result, idField, identifier;
    
    // Query based on role
    if (role === 'admin') {
      result = await pool.query(
        'SELECT * FROM Admin WHERE admin_id = $1', 
        [email]
      );
      idField = 'admin_id';
      identifier = email;
    } else if (role === 'doctor') {
      result = await pool.query(
        'SELECT * FROM Doctor WHERE email = $1', 
        [email]
      );
      idField = 'doctor_id';
      identifier = email;
    } else if (role === 'nurse') {
      result = await pool.query(
        'SELECT * FROM Nurse WHERE email = $1', 
        [email]
      );
      idField = 'nurse_id';
      identifier = email;
    } else if (role === 'lab_technician') { // ✅ ADDED THIS
      result = await pool.query(
        'SELECT * FROM Lab_Technician WHERE email = $1', 
        [email]
      );
      idField = 'technician_id';
      identifier = email;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }
    
    // Check if user exists
    if (result.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const user = result.rows[0];
    
    // Verify password (plain text comparison - use bcrypt in production)
    if (password !== user.password) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active (for non-admin roles)
    if (role !== 'admin' && user.is_active === false) {
      console.log(`❌ Inactive account: ${email}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Account is inactive' 
      });
    }
    
    // Create session
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
};

/**
 * Handle user logout
 */
exports.logout = (req, res) => {
  const username = req.session?.user?.name || 'User';
  
  console.log(`🚪 Logout request from: ${username}`);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    console.log(`✅ Session destroyed for: ${username}`);
    res.json({ message: 'Logged out successfully' });
  });
};
