const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const pool = require('../config/database');

// ===== GET PENDING LAB ORDERS =====
// ✅ FIXED: Changed 'lab' to 'lab_technician'
router.get('/orders/pending', requireRole('lab_technician'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        lo.order_id,
        lo.patient_id,
        lo.doctor_id,
        lo.urgency,
        lo.status,
        lo.clinical_notes,
        lo.ordered_at,
        p.name as patient_name,
        p.age,
        p.gender,
        p.blood_type,
        d.name as doctor_name,
        d.specialization,
        COUNT(lot.test_id) as test_count
      FROM Lab_Order lo
      JOIN Patient p ON lo.patient_id = p.patient_id
      JOIN Doctor d ON lo.doctor_id = d.doctor_id
      LEFT JOIN Lab_Order_Test lot ON lo.order_id = lot.order_id
      WHERE lo.status IN ('PENDING', 'IN_PROGRESS')
      GROUP BY lo.order_id, lo.patient_id, lo.doctor_id, lo.urgency, lo.status,
               lo.clinical_notes, lo.ordered_at, p.name, p.age, p.gender, p.blood_type,
               d.name, d.specialization
      ORDER BY 
        CASE lo.urgency 
          WHEN 'URGENT' THEN 1 
          WHEN 'ROUTINE' THEN 2 
          ELSE 3 
        END,
        lo.ordered_at DESC
    `);

    console.log(`✅ Found ${result.rows.length} lab orders`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching lab orders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== GET SPECIFIC LAB ORDER DETAILS =====
router.get('/orders/:orderId', requireRole('lab_technician'), async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order basic info
    const orderResult = await pool.query(`
      SELECT 
        lo.*,
        p.name as patient_name,
        p.age,
        p.gender,
        p.blood_type,
        d.name as doctor_name,
        d.specialization
      FROM Lab_Order lo
      JOIN Patient p ON lo.patient_id = p.patient_id
      JOIN Doctor d ON lo.doctor_id = d.doctor_id
      WHERE lo.order_id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Lab order not found' });
    }

    // Get all tests for this order
    const testsResult = await pool.query(`
      SELECT 
        lot.test_id,
        lot.result_value,
        lot.remarks,
        ltc.test_name,
        ltc.test_category,
        ltc.normal_range,
        ltc.unit
      FROM Lab_Order_Test lot
      JOIN Lab_Test_Catalog ltc ON lot.test_id = ltc.test_id
      WHERE lot.order_id = $1
    `, [orderId]);

    const order = orderResult.rows[0];
    order.tests = testsResult.rows;

    res.json(order);
  } catch (err) {
    console.error('❌ Error fetching lab order details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== UPDATE LAB ORDER STATUS =====
router.patch('/orders/:orderId/status', requireRole('lab_technician'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await pool.query(`
      UPDATE Lab_Order 
      SET status = $1,
          completed_at = CASE WHEN $1 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE order_id = $2
      RETURNING *
    `, [status, orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab order not found' });
    }

    console.log(`✅ Lab order ${orderId} status updated to ${status}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating lab order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== SUBMIT LAB RESULTS =====
router.post('/orders/:orderId/results', requireRole('lab_technician'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { orderId } = req.params;
    const { results } = req.body; // Array of { test_id, result_value, remarks }

    if (!results || !Array.isArray(results)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Results must be an array' });
    }

    // Update each test result
    for (const result of results) {
      await client.query(`
        UPDATE Lab_Order_Test 
        SET result_value = $1,
            remarks = $2
        WHERE order_id = $3 AND test_id = $4
      `, [result.result_value, result.remarks || null, orderId, result.test_id]);
    }

    // Mark order as completed
    await client.query(`
      UPDATE Lab_Order 
      SET status = 'COMPLETED',
          completed_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
    `, [orderId]);

    await client.query('COMMIT');
    console.log(`✅ Lab results submitted for order ${orderId}`);
    res.json({ success: true, message: 'Lab results submitted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error submitting lab results:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// ===== GET LAB STATS =====
router.get('/stats', requireRole('lab_technician'), async (req, res) => {
  try {
    const [pending, inProgress, completedToday] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM Lab_Order WHERE status = 'PENDING'`),
      pool.query(`SELECT COUNT(*) as count FROM Lab_Order WHERE status = 'IN_PROGRESS'`),
      pool.query(`SELECT COUNT(*) as count FROM Lab_Order WHERE status = 'COMPLETED' AND DATE(completed_at) = CURRENT_DATE`)
    ]);

    res.json({
      pending: parseInt(pending.rows[0].count),
      inProgress: parseInt(inProgress.rows[0].count),
      completedToday: parseInt(completedToday.rows[0].count)
    });
  } catch (err) {
    console.error('❌ Error fetching lab stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
