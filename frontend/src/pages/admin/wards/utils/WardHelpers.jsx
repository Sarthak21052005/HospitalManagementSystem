// Helper functions for ward assignment management

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
}

export function calculateTotalBeds(wards) {
  return wards.reduce((sum, w) => sum + (w.bed_capacity || 0), 0);
}

export function filterAssignments(assignments, status) {
  return assignments.filter(a => a.status === status);
}
