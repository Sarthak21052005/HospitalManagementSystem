// Helper functions for staff management

export function filterStaffData(data, searchQuery) {
  if (!searchQuery.trim()) return data;
  
  return data.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.specialization && item.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );
}

export function getStaffId(item, activeTab) {
  return activeTab === 'doctors' ? item.doctor_id : item.nurse_id;
}

export function getTabColor(isActive, activeTab) {
  if (!isActive) return { border: '#E2E8F0', bg: 'white', text: '#1E293B' };
  
  if (activeTab === 'doctors') {
    return { border: '#10B981', bg: '#ECFDF5', text: '#10B981' };
  }
  return { border: '#8B5CF6', bg: '#F3E8FF', text: '#8B5CF6' };
}
