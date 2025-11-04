import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, nurses: 0 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const patients = await api.getReceptionPatients();
      const doctors = await api.getDoctors();
      const nurses = await api.getNurses();
      setStats({ patients: patients.length, doctors: doctors.length, nurses: nurses.length });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function handleLogout() {
    console.log('🚪 Logout attempt from Dashboard...');
    try {
      await api.logout();
      console.log('✅ Logout API successful');
    } catch (err) {
      console.error('❌ Logout API failed:', err);
    } finally {
      setUser(null);
      navigate('/');
    }
  }
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'staff', label: 'Staff', icon: '👥', path: '/staff' },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
  { id: 'wards', label: 'Ward Assignments', icon: '🏥', path: '/ward-assignments' },
  { id: 'beds', label: 'Bed Management', icon: '🛏️', path: '/bed-management' },  // ✅ NEW
];

  
  const statCards = [
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

 const quickActions = [
  { label: 'Register Patient', icon: '➕', color: '#3B82F6', action: () => navigate('/reception') },
  { label: 'Add Staff', icon: '👤', color: '#10B981', action: () => navigate('/staff') },
  { label: 'Manage Inventory', icon: '📦', color: '#F59E0B', action: () => navigate('/inventory') },
  { label: 'Ward Assignments', icon: '🏥', color: '#EC4899', action: () => navigate('/ward-assignments') },
  { label: 'Bed Management', icon: '🛏️', color: '#6366F1', action: () => navigate('/bed-management') },  // ✅ NEW
];


  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Enhanced Navigation Bar */}
      <nav style={{
        background: 'white',
        padding: '16px 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🏥
            </div>
            <span style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              HealthCare Pro
            </span>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                style={{
                  padding: '10px 20px',
                  background: activeNav === item.id ? '#EFF6FF' : 'transparent',
                  color: activeNav === item.id ? '#3B82F6' : '#64748B',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeNav !== item.id) {
                    e.target.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeNav !== item.id) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.target.style.background = '#F8FAFC'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>▼</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '60px',
                right: 0,
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                minWidth: '200px',
                overflow: 'hidden',
                zIndex: 200
              }}>
                <button
                  onClick={() => alert('Profile coming soon!')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#475569',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => alert('Settings coming soon!')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#475569',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  ⚙️ Settings
                </button>
                <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#EF4444',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1E293B', 
            margin: '0 0 8px 0' 
          }}>
            Welcome back, {user.name}! 👋
          </h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '16px' }}>
            Here's what's happening with your hospital today.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          {statCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                padding: '28px',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: card.gradient,
                opacity: 0.1,
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
                filter: 'blur(30px)'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: card.gradient,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: `0 8px 16px ${card.color}30`
                  }}>
                    {card.icon}
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    background: card.trend === 'up' ? '#DCFCE7' : '#FEE2E2',
                    color: card.trend === 'up' ? '#16A34A' : '#DC2626',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{card.trend === 'up' ? '↗' : '↘'}</span>
                    <span>{card.change}</span>
                  </div>
                </div>

                <div style={{ fontSize: '36px', fontWeight: '700', color: card.color, marginBottom: '4px' }}>
                  {card.value}
                </div>
                <div style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>
                  {card.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          padding: '28px',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          marginBottom: '32px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1E293B', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚡</span>
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                style={{
                  padding: '24px',
                  background: `${action.color}10`,
                  border: `2px solid ${action.color}30`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = `${action.color}20`;
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.borderColor = action.color;
                  e.target.style.boxShadow = `0 8px 20px ${action.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = `${action.color}10`;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.borderColor = `${action.color}30`;
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '36px' }}>{action.icon}</div>
                <div style={{ color: action.color, fontWeight: '700', fontSize: '16px' }}>
                  {action.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '32px' }}>✨</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                System Operational
              </h3>
            </div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
              All hospital management modules are running smoothly. Ready to manage staff, patients, and ward assignments.
            </p>
          </div>
          
          <div style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            position: 'relative',
            zIndex: 1
          }}>
            🟢 All Systems Online
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
