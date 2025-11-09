// Helper functions for bed management

export function getStatusColor(status) {
  switch (status) {
    case 'available': return { bg: '#dcfce7', color: '#16a34a' };
    case 'occupied': return { bg: '#fee2e2', color: '#dc2626' };
    case 'maintenance': return { bg: '#fef3c7', color: '#d97706' };
    case 'reserved': return { bg: '#dbeafe', color: '#2563eb' };
    default: return { bg: '#f3f4f6', color: '#6b7280' };
  }
}

export function calculateUtilization(currentBeds, capacity) {
  if (capacity === 0) return 0;
  return Math.round((currentBeds / capacity) * 100);
}

export function getUtilizationColor(utilization) {
  if (utilization >= 90) return { bg: '#fee2e2', color: '#dc2626' };
  return { bg: '#dcfce7', color: '#16a34a' };
}

export function getUtilizationGradient(utilization) {
  if (utilization >= 90) return 'linear-gradient(90deg, #ef4444, #dc2626)';
  return 'linear-gradient(90deg, #10b981, #059669)';
}

export function filterBeds(beds, filterWard, filterStatus) {
  return beds.filter(bed => {
    if (filterWard && bed.ward_id !== parseInt(filterWard)) return false;
    if (filterStatus && bed.status !== filterStatus) return false;
    return true;
  });
}
