// Helper functions for lab technician dashboard

export function getUrgencyColor(urgency) {
  switch(urgency) {
    case 'STAT': return '#dc2626';
    case 'URGENT': return '#f59e0b';
    case 'ROUTINE': return '#10b981';
    default: return '#64748b';
  }
}

export function formatOrderDate(date) {
  return new Date(date).toLocaleString();
}

export function validateResults(tests, results) {
  return tests.every(test => results[test.test_id]?.resultValue?.trim());
}
