import Navbar from '../../../components/shared/Navbar';
import { useWardAssignments } from './hooks/useWardAssignments';
import { filterAssignments } from './utils/WardHelpers';
import StatsSection from './sections/StatsSection';
import ActiveAssignmentsTable from './sections/ActiveAssignmentsTable';
import AssignmentHistoryTable from './sections/AssignmentHistoryTable';
import WardModals from './sections/WardsModals';

function WardAssignmentManagement({ user, setUser }) {
  const {
    assignments,
    nurses,
    wards,
    loading,
    error,
    success,
    showAssignModal,
    showReassignModal,
    selectedNurse,
    selectedWard,
    selectedAssignment,
    newWard,
    setError,
    setSuccess,
    setShowAssignModal,
    setShowReassignModal,
    setSelectedNurse,
    setSelectedWard,
    setNewWard,
    handleAssignWard,
    handleUnassignWard,
    handleReassignWard,
    openReassignModal
  } = useWardAssignments();

  const activeAssignments = filterAssignments(assignments, 'active');
  const inactiveAssignments = filterAssignments(assignments, 'inactive');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading ward assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              🏥 Ward Assignment Management
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Manage nurse-ward assignments and track bed availability
            </p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            + Assign Nurse to Ward
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>❌</span>
            <span style={{ color: '#dc2626', fontWeight: '600' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#dc2626'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div style={{
            padding: '16px 20px',
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#16a34a'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <StatsSection
          nurses={nurses}
          wards={wards}
          activeAssignments={activeAssignments}
        />

        {/* Active Assignments */}
        <ActiveAssignmentsTable
          activeAssignments={activeAssignments}
          openReassignModal={openReassignModal}
          handleUnassignWard={handleUnassignWard}
        />

        {/* Inactive Assignments History */}
        <AssignmentHistoryTable
          inactiveAssignments={inactiveAssignments}
        />
      </div>

      {/* Modals */}
      <WardModals
        showAssignModal={showAssignModal}
        showReassignModal={showReassignModal}
        setShowAssignModal={setShowAssignModal}
        setShowReassignModal={setShowReassignModal}
        selectedNurse={selectedNurse}
        setSelectedNurse={setSelectedNurse}
        selectedWard={selectedWard}
        setSelectedWard={setSelectedWard}
        selectedAssignment={selectedAssignment}
        newWard={newWard}
        setNewWard={setNewWard}
        nurses={nurses}
        wards={wards}
        handleAssignWard={handleAssignWard}
        handleReassignWard={handleReassignWard}
      />
    </div>
  );
}

export default WardAssignmentManagement;
