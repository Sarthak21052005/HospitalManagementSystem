// services/billing/updateBill.service.js
const pool = require('../../config/database');

/* ================================
   UPDATE BILL
================================ */
exports.updateBill = async (billId, updates) => {
  const client = await pool.connect();

  try {
    // Only allow specific fields to be updated
    const allowedFields = ['discount', 'payment_method', 'payment_status'];

    const setParts = [];
    const params = [];
    let i = 1;

    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field)) {
        setParts.push(`${field} = $${i}`);
        params.push(value);
        i++;
      }
    }

    if (setParts.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    params.push(billId);

    const sql = `
      UPDATE Bill 
      SET ${setParts.join(', ')},
          updated_at = NOW()
      WHERE bill_id = $${i}
      RETURNING *
    `;

    const result = await client.query(sql, params);

    if (result.rows.length === 0) {
      throw new Error("Bill not found.");
    }

    return result.rows[0];

  } finally {
    client.release();
  }
};

/* ================================
   DELETE BILL
   - Prevent deletion if payment exists
   - Remove bill items first
================================ */
exports.deleteBill = async (billId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if payments exist
    const paymentCheck = await client.query(
      `SELECT COUNT(*) AS count FROM Payment_Transaction WHERE bill_id = $1`,
      [billId]
    );

    if (parseInt(paymentCheck.rows[0].count) > 0) {
      throw new Error("Cannot delete bill that has payment history.");
    }

    // Delete items
    await client.query(`DELETE FROM Bill_Item WHERE bill_id = $1`, [billId]);

    // Delete bill
    const result = await client.query(
      `DELETE FROM Bill WHERE bill_id = $1 RETURNING *`,
      [billId]
    );

    if (result.rows.length === 0) {
      throw new Error("Bill not found or already deleted.");
    }

    await client.query("COMMIT");
    return true;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
