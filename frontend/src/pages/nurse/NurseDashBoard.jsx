import Navbar from '../../components/shared/Navbar';
import AdmitPatientForm from '../../components/forms/AdmitPatientForm';
import RecordVitalsForm from '../../components/forms/RecordVitalsForm';
import { useNurseDashboard } from './hooks/useNurseDashBoard';
import OverviewSection from './sections/OverViewSection';
import WardsSection from './sections/WardsSection';
import BedManagementSection from './sections/BedManagementSection';
import PatientsSection from './sections/PatientsSection';
import TasksSection from './sections/TasksSection';

function NurseDashboard({ user, setUser }) {
  const {
    stats,
    wards,
    admittedPatients,
    pendingTasks,
    loading,
    activeView,
    wardBeds,
    showAdmitForm,
    showVitalsForm,
    selectedPatient,
    setActiveView,
    setShowAdmitForm,
    setShowVitalsForm,
    setSelectedPatient,
    loadDashboardData,
    loadWardBeds,
    handleCardClick
  } = useNurseDashboard();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  const getPageTitle = () => {
    switch (activeView) {
      case 'wards': return 'Manage Your Assigned Wards';
      case 'patients': return 'View Admitted Patients';
      case 'bedManagement': return 'Ward Bed Management';
      case 'tasks': return 'Doctor Reports & Tasks';
      case 'overview': return 'Patient care and ward management';
      default: return 'Patient care and ward management';
    }
  };

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      
      <div className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>👩‍⚕️ Welcome, Nurse {user.name}</h1>
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
            admittedPatients={admittedPatients}
            pendingTasks={pendingTasks}
            handleCardClick={handleCardClick}
            setShowVitalsForm={setShowVitalsForm}
            setSelectedPatient={setSelectedPatient}
          />
        )}

        {activeView === 'tasks' && (
          <TasksSection 
            user={user} 
            onTaskUpdate={loadDashboardData}
          />
        )}

        {activeView === 'wards' && (
          <WardsSection
            wards={wards}
            loadWardBeds={loadWardBeds}
          />
        )}

        {activeView === 'bedManagement' && (
          <BedManagementSection
            wardBeds={wardBeds}
          />
        )}

        {activeView === 'patients' && (
          <PatientsSection
            admittedPatients={admittedPatients}
            setShowAdmitForm={setShowAdmitForm}
            setShowVitalsForm={setShowVitalsForm}
            setSelectedPatient={setSelectedPatient}
          />
        )}
      </div>

      {/* Admit Patient Modal */}
      {showAdmitForm && (
        <AdmitPatientForm
          onClose={() => setShowAdmitForm(false)}
          onSuccess={() => {
            loadDashboardData();
            setShowAdmitForm(false);
          }}
        />
      )}

      {/* Record Vitals Modal */}
      {showVitalsForm && selectedPatient && (
        <RecordVitalsForm
          patient={selectedPatient}
          onClose={() => {
            setShowVitalsForm(false);
            setSelectedPatient(null);
          }}
          onSuccess={() => {
            setShowVitalsForm(false);
            setSelectedPatient(null);
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

export default NurseDashboard;
