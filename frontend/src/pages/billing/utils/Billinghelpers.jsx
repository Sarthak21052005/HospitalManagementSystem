// src/pages/billing/utils/billingHelpers.jsx

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Format date
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Get payment status badge
export function getPaymentStatusBadge(status) {
  const badges = {
    paid: { text: 'Paid', color: '#16a34a', bg: '#dcfce7' },
    pending: { text: 'Pending', color: '#ea580c', bg: '#fed7aa' },
    partial: { text: 'Partial', color: '#ca8a04', bg: '#fef3c7' }
  };
  return badges[status] || badges.pending;
}

// Get payment method icon
export function getPaymentMethodIcon(method) {
  const icons = {
    cash: '💵',
    card: '💳',
    upi: '📱',
    insurance: '🏥',
    cheque: '📝'
  };
  return icons[method?.toLowerCase()] || '💰';
}

// Calculate days between dates
export function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format bill number
export function formatBillNumber(billId) {
  return `BILL-${String(billId).padStart(6, '0')}`;
}

// Get urgency color for overdue bills
export function getOverdueStatus(billDate) {
  const days = calculateDays(billDate, new Date());
  if (days > 30) return { text: 'Critical', color: '#dc2626' };
  if (days > 14) return { text: 'Urgent', color: '#ea580c' };
  if (days > 7) return { text: 'Overdue', color: '#ca8a04' };
  return { text: 'Recent', color: '#16a34a' };
}
