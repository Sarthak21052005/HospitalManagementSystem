import { useState, useEffect } from 'react';
import { api } from '../../../api';

export function useLabTechDashboard() {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completedToday: 0 });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [activeView, setActiveView] = useState('all'); // ✅ NEW: 'all', 'pending', 'in_progress', 'completed'

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await api.getPendingLabOrders();
      
      const pending = data.filter(o => o.status === 'PENDING');
      const inProgress = data.filter(o => o.status === 'IN_PROGRESS');
      const completed = data.filter(o => {
        if (o.status !== 'COMPLETED') return false;
        // ✅ Check if completed today
        const completedDate = new Date(o.completed_date || o.updated_at);
        const today = new Date();
        return completedDate.toDateString() === today.toDateString();
      });
      
      setPendingOrders(pending);
      setInProgressOrders(inProgress);
      setCompletedOrders(completed); // ✅ NEW
      
      setStats({
        pending: pending.length,
        inProgress: inProgress.length,
        completedToday: completed.length // ✅ FIXED
      });
    } catch (err) {
      console.error('Failed to load orders:', err);
      alert('Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  }

  async function claimOrder(orderId) {
    try {
      await api.updateLabOrderStatus(orderId, 'IN_PROGRESS');
      alert('✅ Order claimed successfully!');
      loadOrders();
    } catch (err) {
      console.error('Failed to claim order:', err);
      alert('Failed to claim order');
    }
  }

  async function viewOrderDetails(orderId) {
    try {
      const orderData = await api.getLabOrderDetails(orderId);
      console.log('📦 Received order data:', orderData);
      setSelectedOrder(orderData);
      setShowResultModal(true);
    } catch (err) {
      console.error('Failed to load order details:', err);
      alert('Failed to load order details');
    }
  }

  function closeModal() {
    setShowResultModal(false);
    setSelectedOrder(null);
  }

  function handleModalSuccess() {
    setShowResultModal(false);
    setSelectedOrder(null);
    loadOrders();
  }

  // ✅ NEW: Handle stat card clicks
  function handleStatClick(view) {
    setActiveView(view);
  }

  return {
    stats,
    pendingOrders,
    inProgressOrders,
    completedOrders, // ✅ NEW
    loading,
    selectedOrder,
    showResultModal,
    activeView, // ✅ NEW
    claimOrder,
    viewOrderDetails,
    closeModal,
    handleModalSuccess,
    handleStatClick // ✅ NEW
  };
}
