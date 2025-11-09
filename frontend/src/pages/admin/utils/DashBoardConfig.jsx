// Dashboard configuration

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'staff', label: 'Staff', icon: '👥', path: '/staff' },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
  { id: 'wards', label: 'Ward Assignments', icon: '🏥', path: '/ward-assignments' },
  { id: 'beds', label: 'Bed Management', icon: '🛏️', path: '/bed-management' },
];

export const getStatCards = (stats) => [
  { 
    title: 'Total Patients', 
    value: stats.patients, 
    icon: '👥', 
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    change: '+12%',
    trend: 'up'
  },
  { 
    title: 'Total Doctors', 
    value: stats.doctors, 
    icon: '👨‍⚕️', 
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    change: '+5%',
    trend: 'up'
  },
  { 
    title: 'Total Nurses', 
    value: stats.nurses, 
    icon: '👩‍⚕️', 
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    change: '+8%',
    trend: 'up'
  },
];

export const getQuickActions = (navigate) => [
  { label: 'Register Patient', icon: '➕', color: '#3B82F6', action: () => navigate('/reception') },
  { label: 'Add Staff', icon: '👤', color: '#10B981', action: () => navigate('/staff') },
  { label: 'Manage Inventory', icon: '📦', color: '#F59E0B', action: () => navigate('/inventory') },
  { label: 'Ward Assignments', icon: '🏥', color: '#EC4899', action: () => navigate('/ward-assignments') },
  { label: 'Bed Management', icon: '🛏️', color: '#6366F1', action: () => navigate('/bed-management') },
];
