import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { useState } from 'react';


function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);


  async function handleLogout() {
    try {
      await api.logout();
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      navigate('/');
    }
  }


  // Check if a path is active
  const isActive = (path) => location.pathname === path;


  // Get role-specific color
  const getRoleColor = () => {
    switch (user.role) {
      case 'admin': return '#667eea';
      case 'doctor': return '#f093fb';
      case 'nurse': return '#4facfe';
      default: return '#667eea';
    }
  };


  // Get role display info
  const getRoleInfo = () => {
    switch (user.role) {
      case 'admin': return { icon: '👨‍💼', label: 'Administrator' };
      case 'doctor': return { icon: '👨‍⚕️', label: 'Medical Doctor' };
      case 'nurse': return { icon: '👩‍⚕️', label: 'Registered Nurse' };
      default: return { icon: '👤', label: 'User' };
    }
  };


  const roleInfo = getRoleInfo();


  return (
    <>
      <style>{`
        .navbar {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 3px solid ${getRoleColor()};
        }


        .nav-link {
          position: relative;
          transition: all 0.3s ease;
          border-radius: 8px;
          padding: 10px 16px;
        }


        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }


        .nav-link.active {
          background: linear-gradient(135deg, ${getRoleColor()} 0%, ${getRoleColor()}dd 100%);
          color: white;
          font-weight: 600;
        }


        .nav-link.active:hover {
          background: linear-gradient(135deg, ${getRoleColor()}dd 0%, ${getRoleColor()} 100%);
        }


        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          min-width: 250px;
          padding: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }


        .user-menu-dropdown.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }


        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-size: 14px;
        }


        .user-menu-item:hover {
          background: #f8fafc;
        }


        .user-menu-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }


        .logout-btn {
          color: #dc2626;
        }


        .logout-btn:hover {
          background: #fef2f2;
        }


        .user-avatar-clickable {
          cursor: pointer;
          transition: all 0.3s ease;
        }


        .user-avatar-clickable:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }


        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
        }


        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }


        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>


      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '28px', height: '28px' }}>
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
            <span style={{ fontWeight: '700', fontSize: '20px', background: `linear-gradient(135deg, ${getRoleColor()} 0%, ${getRoleColor()}cc 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🏥 HealthCare Pro
            </span>
          </div>
          
          <div className="nav-links">
            {/* ADMIN NAVIGATION */}
            {user.role === 'admin' && (
              <>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  📊 Dashboard
                </button>
                <button 
                  onClick={() => navigate('/staff')} 
                  className={`nav-link ${isActive('/staff') ? 'active' : ''}`}
                >
                  👥 Staff
                </button>
                <button 
                  onClick={() => navigate('/inventory')} 
                  className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}
                >
                  📦 Inventory
                </button>
                <button 
                  onClick={() => navigate('/ward-assignments')} 
                  className={`nav-link ${isActive('/ward-assignments') ? 'active' : ''}`}
                >
                  🏨 Ward Assignments
                </button>
                <button 
                  onClick={() => navigate('/bed-management')} 
                  className={`nav-link ${isActive('/bed-management') ? 'active' : ''}`}
                >
                  🛏️ Bed Management
                </button>
                {/* ✅ NEW - BILLING LINK */}
                <button 
                  onClick={() => navigate('/billing')} 
                  className={`nav-link ${isActive('/billing') ? 'active' : ''}`}
                >
                  💰 Billing
                </button>
              </>
            )}
            
            {/* DOCTOR NAVIGATION */}
            {user.role === 'doctor' && (
              <button 
                onClick={() => navigate('/doctor/dashboard')} 
                className={`nav-link ${isActive('/doctor/dashboard') ? 'active' : ''}`}
              >
                📊 My Dashboard
              </button>
            )}
            
            {/* NURSE NAVIGATION */}
            {user.role === 'nurse' && (
              <>
                <button 
                  onClick={() => navigate('/nurse/dashboard')} 
                  className={`nav-link ${isActive('/nurse/dashboard') ? 'active' : ''}`}
                >
                  📊 Dashboard
                </button>
                <button 
                  onClick={() => navigate('/nurse/wards')} 
                  className={`nav-link ${isActive('/nurse/wards') ? 'active' : ''}`}
                >
                  🏥 My Wards
                </button>
                <button 
                  onClick={() => navigate('/nurse/patients')} 
                  className={`nav-link ${isActive('/nurse/patients') ? 'active' : ''}`}
                >
                  👤 Patients
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="nav-right">
          <div style={{ position: 'relative' }}>
            <div 
              className="user-info" 
              style={{ cursor: 'pointer' }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div 
                className="user-avatar user-avatar-clickable"
                style={{
                  background: `linear-gradient(135deg, ${getRoleColor()} 0%, ${getRoleColor()}dd 100%)`
                }}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="user-name" style={{ fontWeight: '600' }}>{user.name}</div>
                <div className="user-role" style={{ fontSize: '13px', color: '#64748b' }}>
                  {roleInfo.icon} {roleInfo.label}
                </div>
              </div>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ 
                  transition: 'transform 0.3s ease',
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>


            {/* User Dropdown Menu */}
            <div className={`user-menu-dropdown ${showUserMenu ? 'show' : ''}`}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {user.email || 'No email provided'}
                </div>
              </div>


              <div style={{ padding: '8px 0' }}>
                <button className="user-menu-item">
                  <span style={{ fontSize: '18px' }}>⚙️</span>
                  <span>Settings</span>
                </button>
                
                <button className="user-menu-item">
                  <span style={{ fontSize: '18px' }}>👤</span>
                  <span>Profile</span>
                </button>


                {user.role === 'doctor' && (
                  <button className="user-menu-item">
                    <span style={{ fontSize: '18px' }}>📅</span>
                    <span>My Schedule</span>
                  </button>
                )}


                <button className="user-menu-item">
                  <span style={{ fontSize: '18px' }}>🔔</span>
                  <span>Notifications</span>
                  <span style={{
                    marginLeft: 'auto',
                    background: '#dc2626',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    3
                  </span>
                </button>


                <div className="user-menu-divider"></div>


                <button className="user-menu-item">
                  <span style={{ fontSize: '18px' }}>❓</span>
                  <span>Help & Support</span>
                </button>


                <div className="user-menu-divider"></div>


                <button className="user-menu-item logout-btn" onClick={handleLogout}>
                  <span style={{ fontSize: '18px' }}>🚪</span>
                  <span style={{ fontWeight: '600' }}>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* Overlay to close menu when clicking outside */}
      {showUserMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}


export default Navbar;
