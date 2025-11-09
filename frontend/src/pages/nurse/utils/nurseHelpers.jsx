// Helper functions for nurse dashboard

export function getBedStatusColor(status) {
  switch(status) {
    case 'available': return '#10b981';
    case 'occupied': return '#ef4444';
    case 'maintenance': return '#f59e0b';
    case 'reserved': return '#8b5cf6';
    default: return '#6b7280';
  }
}

export function getBedStatusIcon(status) {
  switch(status) {
    case 'available': return '🟢';
    case 'occupied': return '🔴';
    case 'maintenance': return '🟡';
    case 'reserved': return '🟣';
    default: return '⚪';
  }
}

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
}

export function calculateOccupancy(occupied, capacity) {
  if (!capacity) return 0;
  return Math.round((occupied / capacity) * 100);
}

export function getPatientStatusBadge(isSeriousCase) {
  if (isSeriousCase) {
    return {
      background: '#fef2f2',
      color: '#dc2626',
      text: 'Critical'
    };
  }
  return {
    background: '#f0fdf4',
    color: '#16a34a',
    text: 'Stable'
  };
}
