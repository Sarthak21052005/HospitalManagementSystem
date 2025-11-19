// backend/services/billing/billUtils.js
const pool = require('../../config/database');

async function billHasColumn(client, columnName) {
  const q = `
    SELECT COUNT(*)::int AS cnt
    FROM information_schema.columns
    WHERE table_name = 'bill' AND column_name = $1
  `;
  const res = await client.query(q, [columnName]);
  return res.rows[0].cnt > 0;
}

function normalizePaymentMethodForTransaction(pm) {
  const up = (pm || 'CASH').toUpperCase();
  if (up.includes('CARD')) return 'Card';
  if (up.includes('UPI')) return 'UPI';
  if (up.includes('BANK')) return 'Bank Transfer';
  if (up.includes('INSURANCE')) return 'Insurance';
  return 'Cash';
}

module.exports = {
  billHasColumn,
  normalizePaymentMethodForTransaction
};
