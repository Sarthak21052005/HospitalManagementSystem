import { navItems } from '../utils/DashBoardConfig';

function AdminNavbar({ 
  user, 
  activeNav, 
  setActiveNav, 
  showUserMenu, 
  setShowUserMenu, 
  navigate, 
  handleLogout 
}) {
  return (
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
  );
}

export default AdminNavbar;
