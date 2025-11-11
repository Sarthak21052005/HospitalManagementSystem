// controllers/billing.controller.js
const billingService = require('../services/billing.service');

// ===== GET BILLING DASHBOARD STATS =====
exports.getBillingStats = async (req, res) => {
  try {
    const stats = await billingService.getBillingStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching billing stats:', error);
    res.status(500).json({ error: 'Failed to fetch billing stats', message: error.message });
  }
};

// ===== GET PATIENT ADMISSION INFO FOR BILLING =====
exports.getPatientAdmissionForBilling = async (req, res) => {
  try {
    const { patientId } = req.params;
    const admissionData = await billingService.getPatientAdmissionForBilling(patientId);
    
    if (!admissionData) {
      return res.status(404).json({ error: 'No active admission found for this patient' });
    }
    
    res.json(admissionData);
  } catch (error) {
    console.error('❌ Error fetching patient admission:', error);
    res.status(500).json({ error: 'Failed to fetch patient admission data', message: error.message });
  }
};

// ===== CALCULATE BILL (PREVIEW) =====
exports.calculateBill = async (req, res) => {
  try {
    const { admissionId, dischargeDate } = req.body;
    
    if (!admissionId) {
      return res.status(400).json({ error: 'Admission ID is required' });
    }
    
    const calculation = await billingService.calculateBill(admissionId, dischargeDate);
    res.json(calculation);
  } catch (error) {
    console.error('❌ Error calculating bill:', error);
    res.status(500).json({ error: 'Failed to calculate bill', message: error.message });
  }
};

// ===== GENERATE FINAL BILL =====
exports.generateBill = async (req, res) => {
  try {
    const { admissionId, dischargeDate, discount = 0, paymentMethod } = req.body;
    
    if (!admissionId) {
      return res.status(400).json({ error: 'Admission ID is required' });
    }
    
    const bill = await billingService.generateBill(admissionId, dischargeDate, discount, paymentMethod, req.session.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      bill
    });
  } catch (error) {
    console.error('❌ Error generating bill:', error);
    res.status(500).json({ error: 'Failed to generate bill', message: error.message });
  }
};

// ===== GET ALL BILLS =====
exports.getAllBills = async (req, res) => {
  try {
    const { status, from, to, patientName } = req.query;
    const filters = { status, from, to, patientName };
    
    const bills = await billingService.getAllBills(filters);
    res.json(bills);
  } catch (error) {
    console.error('❌ Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills', message: error.message });
  }
};

// ===== GET BILL DETAILS =====
exports.getBillDetails = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await billingService.getBillDetails(billId);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    console.error('❌ Error fetching bill details:', error);
    res.status(500).json({ error: 'Failed to fetch bill details', message: error.message });
  }
};

// ===== UPDATE BILL =====
exports.updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const updates = req.body;
    
    const updatedBill = await billingService.updateBill(billId, updates);
    res.json({
      success: true,
      message: 'Bill updated successfully',
      bill: updatedBill
    });
  } catch (error) {
    console.error('❌ Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill', message: error.message });
  }
};

// ===== DELETE BILL =====
exports.deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;
    await billingService.deleteBill(billId);
    
    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill', message: error.message });
  }
};

// ===== PROCESS PAYMENT =====
exports.processPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { amount, paymentMethod, referenceNumber } = req.body;
    
    if (!amount || !paymentMethod) {
      return res.status(400).json({ error: 'Amount and payment method are required' });
    }
    
    const payment = await billingService.processPayment(billId, amount, paymentMethod, referenceNumber, req.session.user.id);
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment', message: error.message });
  }
};

// ===== UPDATE PAYMENT STATUS =====
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'paid', 'partial'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    await billingService.updatePaymentStatus(billId, status);
    
    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status', message: error.message });
  }
};

// ===== GET INVOICE =====
exports.getInvoice = async (req, res) => {
  try {
    const { billId } = req.params;
    const invoice = await billingService.getInvoice(billId);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice', message: error.message });
  }
};

// ===== GET PATIENT BILLING HISTORY =====
exports.getPatientBillingHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await billingService.getPatientBillingHistory(patientId);
    res.json(history);
  } catch (error) {
    console.error('❌ Error fetching billing history:', error);
    res.status(500).json({ error: 'Failed to fetch billing history', message: error.message });
  }
};

// ===== GET ACTIVE ADMISSIONS =====
exports.getActiveAdmissions = async (req, res) => {
  try {
    const admissions = await billingService.getActiveAdmissions();
    res.json(admissions);
  } catch (error) {
    console.error('❌ Error fetching active admissions:', error);
    res.status(500).json({ error: 'Failed to fetch active admissions', message: error.message });
  }
};
