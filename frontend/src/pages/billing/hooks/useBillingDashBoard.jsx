// src/pages/billing/hooks/useBillingDashboard.jsx

import { useState, useEffect } from 'react';
import { api } from '../../../api';

export function useBillingDashboard() {
  const [stats, setStats] = useState({
    pendingBills: 0,
    pendingAmount: 0,
    paidToday: 0,
    monthlyRevenue: 0,
    overdueBills: 0
  });
  
  const [activeAdmissions, setActiveAdmissions] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, admissions, pending, history
  
  // Modals
  const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);
  const [showBillDetailsModal, setShowBillDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, admissionsData, pendingData, recentData] = await Promise.all([
        api.getBillingStats(),
        api.getActiveAdmissions(),
        api.getAllBills({ status: 'pending' }),
        api.getAllBills({})
      ]);
      
      setStats(statsData);
      setActiveAdmissions(admissionsData);
      setPendingBills(pendingData);
      setRecentBills(recentData.slice(0, 10)); // Last 10 bills
    } catch (error) {
      console.error('❌ Failed to load billing dashboard:', error);
      alert('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }

  // Generate bill for admission
  function openGenerateBillModal(admission) {
    setSelectedAdmission(admission);
    setShowGenerateBillModal(true);
  }

  // View bill details
  async function openBillDetailsModal(billId) {
    try {
      const billDetails = await api.getBillDetails(billId);
      setSelectedBill(billDetails);
      setShowBillDetailsModal(true);
    } catch (error) {
      console.error('Failed to load bill details:', error);
      alert('Failed to load bill details');
    }
  }

  // Open payment modal
  function openPaymentModal(bill) {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  }

  // Open invoice modal
  async function openInvoiceModal(billId) {
    try {
      const invoice = await api.getInvoice(billId);
      setSelectedBill(invoice);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Failed to load invoice:', error);
      alert('Failed to load invoice');
    }
  }

  // Generate bill
  async function handleGenerateBill(admissionId, dischargeDate, discount, paymentMethod) {
    try {
      await api.generateBill(admissionId, dischargeDate, discount, paymentMethod);
      alert('✅ Bill generated successfully!');
      setShowGenerateBillModal(false);
      setSelectedAdmission(null);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to generate bill:', error);
      alert('Failed to generate bill: ' + error.message);
    }
  }

  // Process payment
  async function handleProcessPayment(billId, amount, paymentMethod, referenceNumber) {
    try {
      await api.processPayment(billId, amount, paymentMethod, referenceNumber);
      alert('✅ Payment processed successfully!');
      setShowPaymentModal(false);
      setSelectedBill(null);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Failed to process payment: ' + error.message);
    }
  }

  // Handle stat card click
  function handleStatClick(view) {
    setActiveView(view);
  }

  return {
    stats,
    activeAdmissions,
    pendingBills,
    recentBills,
    loading,
    activeView,
    showGenerateBillModal,
    showBillDetailsModal,
    showPaymentModal,
    showInvoiceModal,
    selectedAdmission,
    selectedBill,
    setActiveView,
    setShowGenerateBillModal,
    setShowBillDetailsModal,
    setShowPaymentModal,
    setShowInvoiceModal,
    openGenerateBillModal,
    openBillDetailsModal,
    openPaymentModal,
    openInvoiceModal,
    handleGenerateBill,
    handleProcessPayment,
    handleStatClick,
    loadDashboardData
  };
}
