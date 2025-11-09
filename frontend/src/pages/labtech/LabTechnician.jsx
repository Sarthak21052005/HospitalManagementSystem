import Navbar from '../../components/shared/Navbar';
import { useLabTechDashboard } from './hooks/useLabTechDashBoard';
import StatsSection from './sections/StatsSection';
import PendingOrdersSection from './sections/PendingOrdersSection';
import InProgressSection from './sections/InProgressSection';
import CompletedOrdersSection from './sections/CompletedOrdersSection'; // ✅ NEW
import ResultModal from './components/ResultModel';

function LabTechnicianDashboard({ user, setUser }) {
  const {
    stats,
    pendingOrders,
    inProgressOrders,
    completedOrders, // ✅ NEW
    loading,
    selectedOrder,
    showResultModal,
    activeView, // ✅ NEW
    claimOrder,
    viewOrderDetails,
    closeModal,
    handleModalSuccess,
    handleStatClick // ✅ NEW
  } = useLabTechDashboard();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ textAlign: 'center', padding: '60px', flex: 1 }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '6px solid #f3f4f6',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading lab orders...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
            🧪 Lab Technician Dashboard
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            Welcome, {user.name}
          </p>
        </div>

        {/* Stats Cards */}
        <StatsSection 
          stats={stats} 
          activeView={activeView}
          onStatClick={handleStatClick}
        />

        {/* Conditional Rendering Based on Active View */}
        {(activeView === 'all' || activeView === 'pending') && (
          <PendingOrdersSection
            pendingOrders={pendingOrders}
            claimOrder={claimOrder}
            viewOrderDetails={viewOrderDetails}
          />
        )}

        {(activeView === 'all' || activeView === 'in_progress') && (
          <InProgressSection
            inProgressOrders={inProgressOrders}
            viewOrderDetails={viewOrderDetails}
          />
        )}

        {(activeView === 'all' || activeView === 'completed') && (
          <CompletedOrdersSection
            completedOrders={completedOrders}
            viewOrderDetails={viewOrderDetails}
          />
        )}

        {/* Show "View All" button if filtered */}
        {activeView !== 'all' && (
          <button
            onClick={() => handleStatClick('all')}
            style={{
              padding: '12px 24px',
              background: '#f1f5f9',
              color: '#64748b',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginTop: '24px'
            }}
          >
            ← View All Orders
          </button>
        )}
      </div>

      {/* Result Entry Modal */}
      {showResultModal && selectedOrder && (
        <ResultModal 
          order={selectedOrder}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

export default LabTechnicianDashboard;
