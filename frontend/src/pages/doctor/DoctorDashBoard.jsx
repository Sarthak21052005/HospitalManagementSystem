import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import MedicalReportForm from '../../components/forms/MedicalReportForm';
import { useDoctorDashboard } from './hooks/useDoctorDashBoard';
import OverviewSection from './sections/OverViewSection';
import TodayScheduleSection from './sections/TodayScheduleSection';
import AllPatientsSection from './sections/AllPatientsSection';
import PendingPatientsSection from './sections/PendingPatientSection';
import LabReportsSection from './sections/LabReportsSection';

function DoctorDashboard({ user, setUser }) {
  const navigate = useNavigate();
  
  const {
    stats,
    todaySchedule,
    allPatients,
    allAppointments,
    loading,
    activeView,
    searchQuery,
    showReportForm,
    selectedPatient,
    setActiveView,
    setSearchQuery,
    handleCardClick,
    handleCreateReport,
    handleCloseReportForm,
    handleReportSuccess
  } = useDoctorDashboard();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #f3f4f6',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading dashboard...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .data-table tbody tr {
              background-color: transparent !important;
            }
            .data-table tbody tr:hover {
              background-color: transparent !important;
            }
          `}</style>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (activeView) {
      case 'overview': return 'Your medical practice dashboard';
      case 'schedule': return "Today's Registered Patients";
      case 'patients': return 'All Registered Patients';
      case 'appointments': return 'Pending Patients';
      case 'lab_reports': return 'Completed Lab Reports';
      default: return 'Your medical practice dashboard';
    }
  };

  return (
    <div className="app-container">
      <style>{`
        .data-table tbody tr {
          background-color: transparent !important;
        }
        .data-table tbody tr:hover {
          background-color: transparent !important;
        }
      `}</style>
      
      <Navbar user={user} setUser={setUser} />
      
      <div className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>👨‍⚕️ Welcome, {user.name}</h1>
            <p style={{ color: '#64748b', marginTop: '8px' }}>
              {getPageTitle()}
            </p>
          </div>
          {activeView !== 'overview' && (
            <button 
              onClick={() => setActiveView('overview')} 
              className="btn btn-outline"
            >
              ← Back to Overview
            </button>
          )}
        </div>

        {/* Render active section */}
        {activeView === 'overview' && (
          <OverviewSection
            stats={stats}
            todaySchedule={todaySchedule}
            allPatients={allPatients}
            handleCardClick={handleCardClick}
            setActiveView={setActiveView}
            handleCreateReport={handleCreateReport}
          />
        )}

        {activeView === 'schedule' && (
          <TodayScheduleSection
            todaySchedule={todaySchedule}
            handleCreateReport={handleCreateReport}
          />
        )}

        {activeView === 'patients' && (
          <AllPatientsSection
            allPatients={allPatients}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleCreateReport={handleCreateReport}
          />
        )}

        {activeView === 'appointments' && (
          <PendingPatientsSection
            allAppointments={allAppointments}
            handleCreateReport={handleCreateReport}
          />
        )}

        {activeView === 'lab_reports' && (
          <LabReportsSection />
        )}
      </div>

      {/* Medical Report Form Modal */}
      {showReportForm && selectedPatient && (
        <MedicalReportForm
          patient={selectedPatient}
          onClose={handleCloseReportForm}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;
