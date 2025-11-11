import { useDashboard } from './hooks/useDashBoard';
import { getStatCards, getQuickActions } from './utils/DashBoardConfig';
import AdminNavbar from './components/AdminNavbar';
import StatsCard from './components/StatsCard';
import QuickActionCard from './components/QuickActionCard';
import SystemStatusBanner from './components/SystemStatusBanner';

function Dashboard({ user, setUser }) {
  const {
    stats,
    showUserMenu,
    setShowUserMenu,
    activeNav,
    setActiveNav,
    navigate,
    handleLogout
  } = useDashboard(setUser);

  const statCards = getStatCards(stats);
  const quickActions = getQuickActions(navigate);

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Enhanced Navigation Bar */}
      <AdminNavbar
        user={user}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        navigate={navigate}
        handleLogout={handleLogout}
      />

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
            <StatsCard key={idx} card={card} />
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
              <QuickActionCard key={idx} action={action} />
            ))}
          </div>
        </div>

        {/* System Status */}
        <SystemStatusBanner />
      </div>
    </div>
    
  );
}

export default Dashboard;
