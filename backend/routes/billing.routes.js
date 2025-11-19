// routes/billing.routes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { requireRole } = require('../middleware/auth');

/* ================================
   BILLING DASHBOARD & STATS
================================ */
router.get('/stats', requireRole('admin'), billingController.getBillingStats);

/* ================================
   ACTIVE ADMISSIONS (IPD)
================================ */
router.get('/active-admissions', requireRole('admin'), billingController.getActiveAdmissions);

/* ================================
   PATIENT BILLING INFO
================================ */
router.get('/patient/:patientId/history', requireRole('admin'), billingController.getPatientBillingHistory);

/* ================================
   IPD BILLING ROUTES
================================ */

// 1. Get admission info for IPD billing
router.get(
  '/patient/:patientId/admission',
  requireRole('admin'),
  billingController.getAdmissionForBilling
);

// 2. IPD Bill preview
router.post(
  '/ipd/calculate',
  requireRole('admin'),
  billingController.calculateIPDBill
);

// 3. Generate final IPD Bill
router.post(
  '/ipd/generate',
  requireRole('admin'),
  billingController.generateIPDBill
);

/* ================================
   OPD BILLING ROUTES
================================ */

// 1. OPD bill preview
router.post(
  '/opd/calculate',
  requireRole('admin'),
  billingController.calculateOPDBill
);

// 2. Generate final OPD bill
router.post(
  '/opd/generate',
  requireRole('admin'),
  billingController.generateOPDBill
);

/* ================================
   BILL LISTING & DETAILS
================================ */

// Get all bills
router.get('/bills', requireRole('admin'), billingController.getAllBills);

// Get pending bills
router.get('/pending', requireRole('admin'), billingController.getPendingBills);

// Get bill details (must be AFTER all specific routes)
router.get('/:billId', requireRole('admin'), billingController.getBillDetails);

/* ================================
   BILL UPDATE / DELETE
================================ */
router.patch('/:billId', requireRole('admin'), billingController.updateBill);
router.delete('/:billId', requireRole('admin'), billingController.deleteBill);

/* ================================
   PAYMENT PROCESSING
================================ */
router.post('/:billId/payment', requireRole('admin'), billingController.processPayment);
router.patch('/:billId/status', requireRole('admin'), billingController.updatePaymentStatus);

/* ================================
   INVOICE
================================ */
router.get('/:billId/invoice', requireRole('admin'), billingController.getInvoice);

module.exports = router;
