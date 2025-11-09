// Helper functions for doctor dashboard

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
}

export function formatTime(time) {
  if (!time) return 'N/A';
  if (typeof time === 'string') {
    return time.substring(0, 5);
  }
  return time;
}

export function getFilteredPatients(allPatients, searchQuery) {
  let filtered = allPatients;

  if (searchQuery.trim()) {
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.contact && p.contact.includes(searchQuery))
    );
  }

  return filtered;
}

export function getFilteredAppointments(allAppointments, filterType, searchQuery) {
  let filtered = allAppointments;

  if (filterType !== 'all') {
    filtered = filtered.filter(apt => apt.status === filterType);
  }

  if (searchQuery.trim()) {
    filtered = filtered.filter(apt => 
      (apt.patientname && apt.patientname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (apt.reason && apt.reason.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  return filtered;
}

// Style object to prevent hover effect on table rows
export const tableRowStyle = {
  backgroundColor: 'transparent',
  transition: 'none'
};

// Avatar gradient for patient initials
export const avatarGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
