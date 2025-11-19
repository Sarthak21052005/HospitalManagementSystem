// routes/billing.routes.js

const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { requireRole } = require('../middleware/auth');

// ===== BILLING DASHBOARD & STATS =====
router.get('/stats', requireRole('admin'), billingController.getBillingStats);

// ===== ACTIVE ADMISSIONS (MUST BE BEFORE /:billId) =====
// ⚠️ MOVED THIS UP - Specific routes BEFORE dynamic routes
router.get('/active-admissions', requireRole('admin'), billingController.getActiveAdmissions);

// ===== PATIENT BILLING INFO =====
// Get patient's admission details for billing
router.get('/patient/:patientId/admission', requireRole('admin'), billingController.getPatientAdmissionForBilling);

// Get patient's billing history
router.get('/patient/:patientId/history', requireRole('admin'), billingController.getPatientBillingHistory);

// ===== BILL CALCULATION =====
// Calculate bill preview (before generating)
router.post('/calculate', requireRole('admin'), billingController.calculateBill);

// ===== BILL MANAGEMENT =====
// Generate new bill
router.post('/generate', requireRole('admin'), billingController.generateBill);

// Get all bills with filters
router.get('/bills', requireRole('admin'), billingController.getAllBills);

// ⚠️ IMPORTANT: This MUST come AFTER all specific routes like /active-admissions
// Get specific bill details
router.get('/:billId', requireRole('admin'), billingController.getBillDetails);

// Update bill
router.patch('/:billId', requireRole('admin'), billingController.updateBill);

// Delete bill (soft delete)
router.delete('/:billId', requireRole('admin'), billingController.deleteBill);

// ===== PAYMENT PROCESSING =====
// Process payment
router.post('/:billId/payment', requireRole('admin'), billingController.processPayment);

// Update payment status
router.patch('/:billId/status', requireRole('admin'), billingController.updatePaymentStatus);

// ===== INVOICE =====
// Get invoice for printing
router.get('/:billId/invoice', requireRole('admin'), billingController.getInvoice);

// ✅ NEW: Get pending bills (partial + pending)
router.get('/pending', billingController.getPendingBills);

module.exports = router;
