const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const pool = require('../config/database');

// Get all inventory items with optional filters
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = 'SELECT * FROM Medical_Inventory WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND item_category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (item_name ILIKE $${paramIndex} OR batch_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY item_id DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory statistics
router.get('/stats', requireRole('admin'), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity_in_stock) as total_quantity,
        SUM(total_value) as total_value,
        COUNT(CASE WHEN status = 'low_stock' THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock_count,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_count,
        COUNT(CASE WHEN expiry_date < CURRENT_DATE + INTERVAL '30 days' AND expiry_date > CURRENT_DATE THEN 1 END) as expiring_soon_count
      FROM Medical_Inventory
    `);
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error fetching inventory stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock alerts
router.get('/alerts', requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM Medical_Inventory 
      WHERE status IN ('low_stock', 'out_of_stock', 'expired')
         OR (expiry_date < CURRENT_DATE + INTERVAL '30 days' AND expiry_date > CURRENT_DATE)
      ORDER BY 
        CASE 
          WHEN status = 'out_of_stock' THEN 1
          WHEN status = 'expired' THEN 2
          WHEN status = 'low_stock' THEN 3
          ELSE 4
        END,
        expiry_date ASC NULLS LAST
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single inventory item
router.get('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM Medical_Inventory WHERE item_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new inventory item
router.post('/', requireRole('admin'), [
  body('item_name').notEmpty().trim(),
  body('item_category').isIn(['Medicine', 'Injection', 'Surgical Equipment', 'Diagnostic Equipment', 'PPE', 'Consumables', 'Laboratory Supplies', 'Emergency Supplies', 'Other']),
  body('quantity_in_stock').isInt({ min: 0 }),
  body('reorder_level').isInt({ min: 0 }),
  body('unit_price').isDecimal({ min: 0 })
], validate, async (req, res) => {
  try {
    const {
      item_name, item_category, item_type, description, manufacturer,
      unit_of_measure, quantity_in_stock, reorder_level, unit_price,
      expiry_date, batch_number, storage_location
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO Medical_Inventory (
        item_name, item_category, item_type, description, manufacturer,
        unit_of_measure, quantity_in_stock, reorder_level, unit_price,
        expiry_date, batch_number, storage_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        item_name, item_category, item_type || null, description || null,
        manufacturer || null, unit_of_measure || 'Units', quantity_in_stock,
        reorder_level, unit_price, expiry_date || null, batch_number || null,
        storage_location || null
      ]
    );
    
    // Log the transaction
    await pool.query(
      `INSERT INTO Inventory_Transaction (
        item_id, transaction_type, quantity_changed, quantity_before, quantity_after, reason, performed_by
      ) VALUES ($1, 'restock', $2, 0, $2, 'Initial stock', $3)`,
      [result.rows[0].item_id, quantity_in_stock, req.session.user.name]
    );
    
    console.log(`✅ Inventory item added: ${item_name} (ID: ${result.rows[0].item_id})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory item
router.put('/:id', requireRole('admin'), [
  body('quantity_in_stock').optional().isInt({ min: 0 }),
  body('reorder_level').optional().isInt({ min: 0 }),
  body('unit_price').optional().isDecimal({ min: 0 })
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_name, item_type, description, manufacturer, unit_of_measure,
      quantity_in_stock, reorder_level, unit_price, expiry_date,
      batch_number, storage_location
    } = req.body;
    
    // Get current quantity for transaction log
    const current = await pool.query('SELECT quantity_in_stock FROM Medical_Inventory WHERE item_id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const oldQuantity = current.rows[0].quantity_in_stock;
    const newQuantity = quantity_in_stock !== undefined ? quantity_in_stock : oldQuantity;
    
    const result = await pool.query(
      `UPDATE Medical_Inventory SET
        item_name = COALESCE($1, item_name),
        item_type = COALESCE($2, item_type),
        description = COALESCE($3, description),
        manufacturer = COALESCE($4, manufacturer),
        unit_of_measure = COALESCE($5, unit_of_measure),
        quantity_in_stock = COALESCE($6, quantity_in_stock),
        reorder_level = COALESCE($7, reorder_level),
        unit_price = COALESCE($8, unit_price),
        expiry_date = COALESCE($9, expiry_date),
        batch_number = COALESCE($10, batch_number),
        storage_location = COALESCE($11, storage_location),
        updated_at = CURRENT_TIMESTAMP
      WHERE item_id = $12
      RETURNING *`,
      [
        item_name, item_type, description, manufacturer, unit_of_measure,
        newQuantity, reorder_level, unit_price, expiry_date, batch_number,
        storage_location, id
      ]
    );
    
    // Log quantity change if it occurred
    if (newQuantity !== oldQuantity) {
      const quantityChange = newQuantity - oldQuantity;
      const transactionType = quantityChange > 0 ? 'restock' : 'usage';
      
      await pool.query(
        `INSERT INTO Inventory_Transaction (
          item_id, transaction_type, quantity_changed, quantity_before, quantity_after, reason, performed_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, transactionType, quantityChange, oldQuantity, newQuantity, 'Manual adjustment', req.session.user.name]
      );
    }
    
    console.log(`✅ Inventory item updated: ${result.rows[0].item_name}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete inventory item
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM Medical_Inventory WHERE item_id = $1 RETURNING item_name',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log(`✅ Inventory item deleted: ${result.rows[0].item_name}`);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history for an item
router.get('/:id/transactions', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM Inventory_Transaction 
       WHERE item_id = $1 
       ORDER BY transaction_date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all recent transactions
router.get('/transactions/recent', requireRole('admin'), async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const result = await pool.query(
      `SELECT t.*, i.item_name, i.item_category 
       FROM Inventory_Transaction t
       JOIN Medical_Inventory i ON t.item_id = i.item_id
       ORDER BY t.transaction_date DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching recent transactions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock quantity (quick restock/usage)
router.post('/:id/adjust', requireRole('admin'), [
  body('quantity_change').isInt(),
  body('transaction_type').isIn(['restock', 'usage', 'expired', 'damaged', 'adjustment']),
  body('reason').optional().trim()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_change, transaction_type, reason } = req.body;
    
    // Get current quantity
    const current = await pool.query('SELECT quantity_in_stock, item_name FROM Medical_Inventory WHERE item_id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const oldQuantity = current.rows[0].quantity_in_stock;
    const newQuantity = oldQuantity + quantity_change;
    
    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    // Update quantity
    const result = await pool.query(
      `UPDATE Medical_Inventory 
       SET quantity_in_stock = $1, updated_at = CURRENT_TIMESTAMP
       WHERE item_id = $2
       RETURNING *`,
      [newQuantity, id]
    );
    
    // Log transaction
    await pool.query(
      `INSERT INTO Inventory_Transaction (
        item_id, transaction_type, quantity_changed, quantity_before, quantity_after, reason, performed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, transaction_type, quantity_change, oldQuantity, newQuantity, reason || `${transaction_type} operation`, req.session.user.name]
    );
    
    console.log(`✅ Stock adjusted: ${current.rows[0].item_name} (${oldQuantity} → ${newQuantity})`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adjusting stock:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
