import { useState, useEffect } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';

import AdmitPatientForm from '../components/AdmitPatientForm';
import RecordVitalsForm from '../components/RecordVitalsForm';
import NurseTaskDashboard from '../components/NurseTaskDashboard'; // ✅ NEW IMPORT

function NurseDashboard({ user, setUser }) {
  const [stats, setStats] = useState({
    totalWards: 0,
    admittedPatients: 0,
    availableBeds: 0,
    criticalPatients: 0
  });
  const [wards, setWards] = useState([]);
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]); // ✅ NEW: Track nurse tasks
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, wards, patients, bedManagement, tasks ✅
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardBeds, setWardBeds] = useState([]);
  
  // Modal states
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, wardsData, patientsData, tasksData] = await Promise.all([
        api.getNurseStats(),
        api.getNurseWards(),
        api.getAdmittedPatients(),
        api.getNurseTasks('PENDING') // ✅ NEW: Load pending tasks
      ]);
      
      setStats(statsData);
      setWards(wardsData);
      setAdmittedPatients(patientsData);
      setPendingTasks(tasksData); // ✅ NEW
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadWardBeds(wardId) {
    try {
      const beds = await api.getWardBeds(wardId);
      setWardBeds(beds);
      setSelectedWard(wardId);
      setActiveView('bedManagement');
    } catch (err) {
      console.error('Failed to load ward beds:', err);
      alert('Failed to load beds');
    }
  }

  function handleCardClick(cardType) {
    switch(cardType) {
      case 'wards':
        setActiveView('wards');
        break;
      case 'patients':
        setActiveView('patients');
        break;
      case 'critical':
        setActiveView('patients');
        break;
      case 'tasks': // ✅ NEW
        setActiveView('tasks');
        break;
      default:
        setActiveView('overview');
    }
  }

  function getBedStatusColor(status) {
    switch(status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'maintenance': return '#f59e0b';
      case 'reserved': return '#8b5cf6';
      default: return '#6b7280';
    }
  }

  function getBedStatusIcon(status) {
    switch(status) {
      case 'available': return '🟢';
      case 'occupied': return '🔴';
      case 'maintenance': return '🟡';
      case 'reserved': return '🟣';
      default: return '⚪';
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      
      <div className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>👩‍⚕️ Welcome, Nurse {user.name}</h1>
            <p style={{ color: '#64748b', marginTop: '8px' }}>
              {activeView === 'wards' && 'Manage Your Assigned Wards'}
              {activeView === 'patients' && 'View Admitted Patients'}
              {activeView === 'bedManagement' && 'Ward Bed Management'}
              {activeView === 'tasks' && 'Doctor Reports & Tasks'} {/* ✅ NEW */}
              {activeView === 'overview' && 'Patient care and ward management'}
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

        {/* Stats Cards - ✅ ADDED NEW TASKS CARD */}
        <div className="stats-grid">
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              cursor: 'pointer',
              transform: activeView === 'wards' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => handleCardClick('wards')}
          >
            <div className="stat-icon" style={{ fontSize: '32px' }}>🏥</div>
            <div className="stat-content">
              <h3>{stats.totalWards}</h3>
              <p>Assigned Wards</p>
            </div>
          </div>
          
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white',
              cursor: 'pointer',
              transform: activeView === 'patients' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => handleCardClick('patients')}
          >
            <div className="stat-icon" style={{ fontSize: '32px' }}>👥</div>
            <div className="stat-content">
              <h3>{stats.admittedPatients}</h3>
              <p>Admitted Patients</p>
            </div>
          </div>
          
          {/* ✅ NEW: Medical Reports Task Card */}
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
              color: 'white',
              cursor: 'pointer',
              transform: activeView === 'tasks' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease',
              position: 'relative'
            }}
            onClick={() => handleCardClick('tasks')}
          >
            {pendingTasks.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {pendingTasks.length}
              </div>
            )}
            <div className="stat-icon" style={{ fontSize: '32px' }}>📋</div>
            <div className="stat-content">
              <h3>{pendingTasks.length}</h3>
              <p>Doctor Reports</p>
            </div>
          </div>
          
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => handleCardClick('critical')}
          >
            <div className="stat-icon" style={{ fontSize: '32px' }}>⚠️</div>
            <div className="stat-content">
              <h3>{stats.criticalPatients}</h3>
              <p>Critical Patients</p>
            </div>
          </div>
        </div>

        {/* OVERVIEW - Quick Actions */}
        {activeView === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
              {/* ✅ NEW: Medical Reports Quick Action */}
              <div className="card" style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: pendingTasks.length > 0 ? '#fef3c7' : 'white',
                border: pendingTasks.length > 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                position: 'relative'
              }}>
                {pendingTasks.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    animation: 'pulse 2s infinite'
                  }}>
                    {pendingTasks.length}
                  </div>
                )}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h3>Doctor Reports</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>
                  {pendingTasks.length > 0 
                    ? `${pendingTasks.length} new report${pendingTasks.length > 1 ? 's' : ''} to review`
                    : 'No pending reports'}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('tasks')}
                  style={{
                    background: pendingTasks.length > 0 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  {pendingTasks.length > 0 ? '⚠️ View Reports' : 'View Reports'}
                </button>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛏️</div>
                <h3>Admit New Patient</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Assign patient to available bed</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAdmitForm(true)}
                >
                  + Admit Patient
                </button>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
                <h3>Record Vital Signs</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Track patient vitals</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('patients')}
                >
                  Select Patient
                </button>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
                <h3>View Wards</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Manage ward beds</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => setActiveView('wards')}
                >
                  View Wards
                </button>
              </div>
            </div>

            {/* Recent Admissions */}
            <div className="card" style={{ marginTop: '24px' }}>
              <h2 style={{ marginBottom: '20px' }}>📋 Recent Admissions</h2>
              {admittedPatients.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                  No patients admitted yet.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Age/Gender</th>
                      <th>Ward</th>
                      <th>Bed</th>
                      <th>Admitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admittedPatients.slice(0, 5).map(patient => (
                      <tr key={patient.patient_id}>
                        <td>
                          {patient.name}
                          {patient.is_serious_case && (
                            <span style={{ marginLeft: '8px', color: '#dc2626' }}>⚠️</span>
                          )}
                        </td>
                        <td>{patient.age}y • {patient.gender}</td>
                        <td>{patient.ward_name}</td>
                        <td><strong>Bed {patient.bed_number}</strong></td>
                        <td>{new Date(patient.admission_date).toLocaleDateString()}</td>
                        <td>
                          {patient.is_serious_case ? (
                            <span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}>Critical</span>
                          ) : (
                            <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>Stable</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowVitalsForm(true);
                            }}
                          >
                            📊 Record Vitals
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ✅ NEW: TASKS VIEW - Medical Reports from Doctors */}
        {activeView === 'tasks' && (
          <NurseTaskDashboard 
            user={user} 
            onTaskUpdate={loadDashboardData} // Refresh data when task is updated
          />
        )}

        {/* WARDS VIEW */}
        {activeView === 'wards' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>🏥 My Assigned Wards</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {wards.map(ward => (
                <div 
                  key={ward.ward_id}
                  className="card"
                  style={{ 
                    cursor: 'pointer', 
                    border: '2px solid #e2e8f0',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => loadWardBeds(ward.ward_id)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3>{ward.name}</h3>
                    <span style={{ 
                      background: '#f1f5f9', 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#475569'
                    }}>
                      {ward.category}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Total Capacity:</span>
                      <strong>{ward.bed_capacity} beds</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Available:</span>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>🟢 {ward.available_beds}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Occupied:</span>
                      <span style={{ color: '#ef4444', fontWeight: '600' }}>🔴 {ward.occupied_beds}</span>
                    </div>
                  </div>

                  <div style={{ 
                    background: '#f1f5f9', 
                    padding: '8px', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    Occupancy: {Math.round((ward.occupied_beds / ward.bed_capacity) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BED MANAGEMENT VIEW */}
        {activeView === 'bedManagement' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>🛏️ Bed Management</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {wardBeds.map(bed => (
                <div 
                  key={bed.bed_id}
                  style={{ 
                    border: `3px solid ${getBedStatusColor(bed.status)}`,
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    background: bed.status === 'occupied' ? '#fef2f2' : '#f9fafb'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {getBedStatusIcon(bed.status)}
                  </div>
                  <h3>Bed {bed.bed_number}</h3>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: getBedStatusColor(bed.status),
                    color: 'white',
                    marginTop: '8px',
                    textTransform: 'capitalize'
                  }}>
                    {bed.status}
                  </span>
                  
                  {bed.patient_name && (
                    <div style={{ marginTop: '12px', padding: '8px', background: 'white', borderRadius: '6px' }}>
                      <strong>{bed.patient_name}</strong>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>
                        {bed.age}y • {bed.gender}
                      </p>
                      {bed.is_serious_case && (
                        <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ Critical</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PATIENTS VIEW */}
        {activeView === 'patients' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>👥 Admitted Patients ({admittedPatients.length})</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAdmitForm(true)}
              >
                + Admit New Patient
              </button>
            </div>

            {admittedPatients.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                No patients admitted in your wards.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age/Gender</th>
                    <th>Blood Type</th>
                    <th>Ward</th>
                    <th>Bed</th>
                    <th>Doctor</th>
                    <th>Admitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admittedPatients.map(patient => (
                    <tr key={patient.patient_id}>
                      <td>
                        {patient.name}
                        {patient.is_serious_case && (
                          <span style={{ marginLeft: '8px', color: '#dc2626' }}>⚠️</span>
                        )}
                      </td>
                      <td>{patient.age}y • {patient.gender}</td>
                      <td>
                        <span style={{ 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {patient.blood_type || 'N/A'}
                        </span>
                      </td>
                      <td>{patient.ward_name}</td>
                      <td><strong>Bed {patient.bed_number}</strong></td>
                      <td>{patient.doctor_name}</td>
                      <td>{new Date(patient.admission_date).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowVitalsForm(true);
                          }}
                        >
                          📊 Record Vitals
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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

      {/* ✅ ADD PULSE ANIMATION CSS */}
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
