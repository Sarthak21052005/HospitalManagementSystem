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

// ===== WARD ASSIGNMENT MANAGEMENT =====

// Get all ward assignments (active and historical)
router.get('/ward-assignments', requireRole('admin'), async (req, res) => {
  try {
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
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching ward assignments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available nurses with current assignment count
router.get('/available-nurses', requireRole('admin'), async (req, res) => {
  try {
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
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching available nurses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all wards with assignment counts
router.get('/wards-list', requireRole('admin'), async (req, res) => {
  try {
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
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching wards:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign nurse to ward
router.post('/assign-ward', requireRole('admin'), async (req, res) => {
  try {
    const { nurse_id, ward_id } = req.body;
    
    if (!nurse_id || !ward_id) {
      return res.status(400).json({ message: 'Nurse ID and Ward ID are required' });
    }
    
    // Check if nurse is already assigned to this ward
    const existingAssignment = await pool.query(`
      SELECT ward_nurse_id 
      FROM Ward_Nurse 
      WHERE nurse_id = $1 AND ward_id = $2 AND end_date IS NULL
    `, [nurse_id, ward_id]);
    
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({ message: 'Nurse is already assigned to this ward' });
    }
    
    // Create new assignment
    const result = await pool.query(`
      INSERT INTO Ward_Nurse (nurse_id, ward_id, start_date)
      VALUES ($1, $2, CURRENT_DATE)
      RETURNING *
    `, [nurse_id, ward_id]);
    
    console.log(`✅ Nurse ${nurse_id} assigned to Ward ${ward_id}`);
    res.json({ 
      success: true, 
      message: 'Ward assigned successfully',
      assignment: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Error assigning ward:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unassign nurse from ward
router.post('/unassign-ward', requireRole('admin'), async (req, res) => {
  try {
    const { ward_nurse_id } = req.body;
    
    if (!ward_nurse_id) {
      return res.status(400).json({ message: 'Assignment ID is required' });
    }
    
    const result = await pool.query(`
      UPDATE Ward_Nurse
      SET end_date = CURRENT_DATE
      WHERE ward_nurse_id = $1 AND end_date IS NULL
      RETURNING *
    `, [ward_nurse_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found or already ended' });
    }
    
    console.log(`✅ Ward assignment ${ward_nurse_id} ended`);
    res.json({ 
      success: true, 
      message: 'Ward unassigned successfully',
      assignment: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Error unassigning ward:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reassign nurse to different ward
router.post('/reassign-ward', requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { old_ward_nurse_id, new_ward_id } = req.body;
    
    if (!old_ward_nurse_id || !new_ward_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Old assignment ID and new ward ID are required' });
    }
    
    const oldAssignment = await client.query(`
      SELECT nurse_id FROM Ward_Nurse WHERE ward_nurse_id = $1
    `, [old_ward_nurse_id]);
    
    if (oldAssignment.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Old assignment not found' });
    }
    
    const nurse_id = oldAssignment.rows[0].nurse_id;
    
    await client.query(`
      UPDATE Ward_Nurse
      SET end_date = CURRENT_DATE
      WHERE ward_nurse_id = $1
    `, [old_ward_nurse_id]);
    
    const newAssignment = await client.query(`
      INSERT INTO Ward_Nurse (nurse_id, ward_id, start_date)
      VALUES ($1, $2, CURRENT_DATE)
      RETURNING *
    `, [nurse_id, new_ward_id]);
    
    await client.query('COMMIT');
    
    console.log(`✅ Nurse ${nurse_id} reassigned to Ward ${new_ward_id}`);
    res.json({ 
      success: true, 
      message: 'Ward reassigned successfully',
      assignment: newAssignment.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error reassigning ward:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});
// ===== BED MANAGEMENT =====

// Get all beds with ward information
router.get('/beds', requireRole('admin'), async (req, res) => {
  try {
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
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching beds:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get beds by ward
router.get('/beds/ward/:wardId', requireRole('admin'), async (req, res) => {
  try {
    const { wardId } = req.params;
    
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
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching ward beds:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ward statistics (current beds vs capacity)
router.get('/wards-with-bed-stats', requireRole('admin'), async (req, res) => {
  try {
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
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching ward bed statistics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add bed to ward
router.post('/beds', requireRole('admin'), async (req, res) => {
  try {
    const { ward_id, bed_number } = req.body;
    
    if (!ward_id || !bed_number) {
      return res.status(400).json({ message: 'Ward ID and bed number are required' });
    }
    
    // Check if ward exists and has capacity
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
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    const { bed_capacity, current_beds } = wardCheck.rows[0];
    
    if (current_beds >= bed_capacity) {
      return res.status(400).json({ 
        message: `Ward is at full capacity. Current beds: ${current_beds}, Capacity: ${bed_capacity}` 
      });
    }
    
    // Check if bed number already exists in this ward
    const existingBed = await pool.query(`
      SELECT bed_id FROM Bed WHERE ward_id = $1 AND bed_number = $2
    `, [ward_id, bed_number]);
    
    if (existingBed.rows.length > 0) {
      return res.status(400).json({ message: 'Bed number already exists in this ward' });
    }
    
    // Add the bed
    const result = await pool.query(`
      INSERT INTO Bed (ward_id, bed_number, status)
      VALUES ($1, $2, 'available')
      RETURNING *
    `, [ward_id, bed_number]);
    
    console.log(`✅ Bed ${bed_number} added to Ward ${ward_id}`);
    res.json({ 
      success: true, 
      message: 'Bed added successfully',
      bed: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Error adding bed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bed status
router.put('/beds/:bedId', requireRole('admin'), async (req, res) => {
  try {
    const { bedId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const result = await pool.query(`
      UPDATE Bed
      SET status = $1
      WHERE bed_id = $2
      RETURNING *
    `, [status, bedId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    
    console.log(`✅ Bed ${bedId} status updated to ${status}`);
    res.json({ 
      success: true, 
      message: 'Bed status updated successfully',
      bed: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Error updating bed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete bed (only if not occupied)
router.delete('/beds/:bedId', requireRole('admin'), async (req, res) => {
  try {
    const { bedId } = req.params;
    
    // Check if bed is occupied
    const bedCheck = await pool.query(`
      SELECT bed_id, status, current_patient_id FROM Bed WHERE bed_id = $1
    `, [bedId]);
    
    if (bedCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Bed not found' });
    }
    
    if (bedCheck.rows[0].status === 'occupied' || bedCheck.rows[0].current_patient_id) {
      return res.status(400).json({ 
        message: 'Cannot delete bed that is currently occupied. Please discharge the patient first.' 
      });
    }
    
    // Delete the bed
    await pool.query('DELETE FROM Bed WHERE bed_id = $1', [bedId]);
    
    console.log(`✅ Bed ${bedId} deleted`);
    res.json({ 
      success: true, 
      message: 'Bed deleted successfully'
    });
  } catch (err) {
    console.error('❌ Error deleting bed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk add beds to ward
router.post('/beds/bulk-add', requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { ward_id, bed_prefix, num_beds } = req.body;
    
    if (!ward_id || !bed_prefix || !num_beds || num_beds < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Ward ID, bed prefix, and number of beds are required' });
    }
    
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
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    const { bed_capacity, current_beds } = wardCheck.rows[0];
    const available_slots = bed_capacity - current_beds;
    
    if (num_beds > available_slots) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Cannot add ${num_beds} beds. Only ${available_slots} slots available (Current: ${current_beds}, Capacity: ${bed_capacity})` 
      });
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
    
    console.log(`✅ Added ${num_beds} beds to Ward ${ward_id}`);
    res.json({ 
      success: true, 
      message: `Successfully added ${num_beds} beds`,
      beds: addedBeds
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error bulk adding beds:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
