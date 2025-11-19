const ipdBilling = require('./billing/ipdBilling.service');
const opdBilling = require('./billing/opdBilling.service');
const calculations = require('./billing/calculations.service');
const payments = require('./billing/payments.service');
const queries = require('./billing/queries.service');
const billUtils = require('./billing/billUtils');
const updateBill = require('./billing/updateBill.service');   // ← ADD THIS

module.exports = {
  // IPD Billing
  getAdmissionForBilling: ipdBilling.getAdmissionForBilling,
  calculateIPDBill: ipdBilling.calculateIPDBill,
  generateIPDBill: ipdBilling.generateIPDBill,

  // OPD Billing
  calculateOPDBill: opdBilling.calculateOPDBill,
  generateOPDBill: opdBilling.generateOPDBill,

  // Shared calculations
  ...calculations,

  // Payments
  processPayment: payments.processPayment,
  updatePaymentStatus: payments.updatePaymentStatus,

  // Queries
  getBillingStats: queries.getBillingStats,
  getAllBills: queries.getAllBills,
  getPendingBills: queries.getPendingBills,
  getBillDetails: queries.getBillDetails,
  getPatientBillingHistory: queries.getPatientBillingHistory,
  getActiveAdmissions: queries.getActiveAdmissions,

  // Update/Delete Bill
  updateBill: updateBill.updateBill,     // ← ADD THIS
  deleteBill: updateBill.deleteBill,     // ← ADD THIS

  // Utils
  billHasColumn: billUtils.billHasColumn
};
