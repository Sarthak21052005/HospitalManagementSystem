const billingService = require('../services/billing.service');

/* ================================
   BILLING STATS
================================ */
exports.getBillingStats = async (req, res) => {
  try {
    const stats = await billingService.getBillingStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching billing stats:', error);
    res.status(500).json({ error: 'Failed to fetch billing stats', message: error.message });
  }
};

/* ================================
   IPD BILLING: GET ADMISSION INFO
================================ */
exports.getAdmissionForBilling = async (req, res) => {
  try {
    const { patientId } = req.params;
    const admission = await billingService.getAdmissionForBilling(patientId);

    if (!admission) {
      return res.status(404).json({ error: 'No active admission for this patient' });
    }

    res.json(admission);
  } catch (error) {
    console.error('❌ Error fetching admission info:', error);
    res.status(500).json({ error: 'Failed to fetch admission info', message: error.message });
  }
};

/* ================================
   IPD BILL PREVIEW
================================ */
exports.calculateIPDBill = async (req, res) => {
  try {
    const { admissionId, dischargeDate } = req.body;

    if (!admissionId) {
      return res.status(400).json({ error: 'Admission ID is required' });
    }

    const calculation = await billingService.calculateIPDBill(admissionId, dischargeDate);
    res.json(calculation);

  } catch (error) {
    console.error('❌ Error calculating IPD bill:', error);
    res.status(500).json({ error: 'Failed to calculate bill', message: error.message });
  }
};

/* ================================
   IPD BILL FINAL GENERATION
================================ */
exports.generateIPDBill = async (req, res) => {
  try {
    const { admissionId, dischargeDate, discount = 0, paymentMethod } = req.body;

    if (!admissionId) {
      return res.status(400).json({ error: 'Admission ID is required' });
    }

    const bill = await billingService.generateIPDBill(
      admissionId,
      dischargeDate,
      discount,
      paymentMethod,
      req.session?.user?.id
    );

    res.status(201).json({ success: true, message: 'IPD Bill generated', bill });

  } catch (error) {
    console.error('❌ Error generating IPD bill:', error);
    res.status(500).json({ error: 'Failed to generate bill', message: error.message });
  }
};

/* ================================
   OPD BILL PREVIEW
================================ */
exports.calculateOPDBill = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const calculation = await billingService.calculateOPDBill(patientId);
    res.json(calculation);

  } catch (error) {
    console.error('❌ Error calculating OPD bill:', error);
    res.status(500).json({ error: 'Failed to calculate OPD bill', message: error.message });
  }
};

/* ================================
   OPD BILL FINAL GENERATION
================================ */
exports.generateOPDBill = async (req, res) => {
  try {
    const { patientId, discount = 0, paymentMethod } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const bill = await billingService.generateOPDBill(
      patientId,
      discount,
      paymentMethod,
      req.session?.user?.id
    );

    res.status(201).json({ success: true, message: 'OPD Bill generated', bill });

  } catch (error) {
    console.error('❌ Error generating OPD bill:', error);
    res.status(500).json({ error: 'Failed to generate OPD bill', message: error.message });
  }
};

/* ================================
   BILL QUERIES (COMMON)
================================ */
exports.getAllBills = async (req, res) => {
  try {
    const filters = req.query;
    const bills = await billingService.getAllBills(filters);
    res.json(bills);
  } catch (error) {
    console.error('❌ Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills', message: error.message });
  }
};
exports.updateBill = async (req, res) => {
  try {
    const updatedBill = await billingService.updateBill(req.params.billId, req.body);
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

exports.getBillDetails = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await billingService.getBillDetails(billId);

    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    res.json(bill);
  } catch (error) {
    console.error('❌ Error fetching bill details:', error);
    res.status(500).json({ error: 'Failed to fetch bill details', message: error.message });
  }
};

exports.getPendingBills = async (req, res) => {
  try {
    const bills = await billingService.getPendingBills();
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('❌ Error fetching pending bills:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending bills', error: error.message });
  }
};
/* ================================
   DELETE BILL
================================ */
exports.deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;

    await billingService.deleteBill(billId);

    res.json({
      success: true,
      message: "Bill deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting bill:", error);
    res.status(500).json({
      error: "Failed to delete bill",
      message: error.message
    });
  }
};

/* ================================
   PAYMENTS
================================ */
exports.processPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { amount, paymentMethod, referenceNumber } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ error: 'Amount and payment method are required' });
    }

    const payment = await billingService.processPayment(
      billId,
      amount,
      paymentMethod,
      referenceNumber,
      req.session?.user?.id
    );

    res.json({ success: true, message: 'Payment processed', payment });

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment', message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;

    await billingService.updatePaymentStatus(billId, status);

    res.json({ success: true, message: 'Payment status updated' });

  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status', message: error.message });
  }
};

/* ================================
   INVOICE
================================ */
exports.getInvoice = async (req, res) => {
  try {
    const { billId } = req.params;
    const invoice = await billingService.getInvoice(billId);

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    res.json(invoice);
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice', message: error.message });
  }
};

/* ================================
   HISTORY + ACTIVE ADMISSIONS
================================ */
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

exports.getActiveAdmissions = async (req, res) => {
  try {
    const admissions = await billingService.getActiveAdmissions();
    res.json(admissions);
  } catch (error) {
    console.error('❌ Error fetching active admissions:', error);
    res.status(500).json({ error: 'Failed to fetch active admissions', message: error.message });
  }
};
