import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import MedicalReportForm from '../components/MedicalReportForm';

function DoctorDashboard({ user, setUser }) {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedThisMonth: 0
  });
  
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, scheduleData, patientsData, appointmentsData] = await Promise.all([
        api.getDoctorStats(),
        api.getTodaySchedule(),
        api.getAllPatients(),
        api.getDoctorAppointments()
      ]);
      
      setStats(statsData);
      setTodaySchedule(scheduleData);
      setAllPatients(patientsData);
      setAllAppointments(appointmentsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCardClick(cardType) {
    setActiveView(cardType);
  }

  function handleCreateReport(patient) {
    setSelectedPatient(patient);
    setShowReportForm(true);
  }

  function getFilteredPatients() {
    let filtered = allPatients;

    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.contact && p.contact.includes(searchQuery))
      );
    }

    return filtered;
  }

  function getFilteredAppointments() {
    let filtered = allAppointments;

    if (filterType !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterType);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(apt => 
        (apt.patientname && apt.patientname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (apt.reason && apt.reason.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }

  function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  }

  function formatTime(time) {
    if (!time) return 'N/A';
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    return time;
  }

  // Style object to prevent hover effect
  const tableRowStyle = {
    backgroundColor: 'transparent',
    transition: 'none'
  };

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
            <h1>👨‍⚕️ Welcome, Dr. {user.name}</h1>
            <p style={{ color: '#64748b', marginTop: '8px' }}>
              {activeView === 'overview' && 'Your medical practice dashboard'}
              {activeView === 'schedule' && "Today's Registered Patients"}
              {activeView === 'patients' && 'All Registered Patients'}
              {activeView === 'appointments' && 'Pending Patients'}
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

        {/* Stats Cards */}
        <div className="stats-grid">
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              cursor: 'pointer',
              transform: activeView === 'patients' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => handleCardClick('patients')}
          >
            <div className="stat-icon" style={{ fontSize: '36px' }}>👥</div>
            <div className="stat-content">
              <h3>{stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>
          
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: 'white',
              cursor: 'pointer',
              transform: activeView === 'schedule' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => handleCardClick('schedule')}
          >
            <div className="stat-icon" style={{ fontSize: '36px' }}>📅</div>
            <div className="stat-content">
              <h3>{stats.todayAppointments}</h3>
              <p>Today's Patients</p>
            </div>
          </div>
          
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              color: 'white',
              cursor: 'pointer',
              transform: activeView === 'appointments' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
            onClick={() => handleCardClick('appointments')}
          >
            <div className="stat-icon" style={{ fontSize: '36px' }}>⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingAppointments}</h3>
              <p>Pending Patients</p>
            </div>
          </div>
          
          <div 
            className="stat-card" 
            style={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
              color: 'white'
            }}
          >
            <div className="stat-icon" style={{ fontSize: '36px' }}>✅</div>
            <div className="stat-content">
              <h3>{stats.completedThisMonth}</h3>
              <p>Reports This Month</p>
            </div>
          </div>
        </div>

        {/* OVERVIEW */}
        {activeView === 'overview' && (
          <div>
            <div className="card" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Today's Patients ({todaySchedule.length})</h2>
                <button 
                  className="btn btn-outline"
                  onClick={() => setActiveView('schedule')}
                >
                  View All →
                </button>
              </div>
              
              {todaySchedule.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                  No patients registered today.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reg. Time</th>
                      <th>Patient</th>
                      <th>Age/Gender</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySchedule.slice(0, 5).map((apt, idx) => (
                      <tr key={apt.patientid || idx} style={tableRowStyle}>
                        <td><strong>{formatTime(apt.timeslot)}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}>
                              {apt.patientname?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div><strong>{apt.patientname || 'Unknown'}</strong></div>
                              {apt.isseriouscase && (
                                <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ Critical</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{apt.age}y • {apt.gender}</td>
                        <td>📞 {apt.contact}</td>
                        <td>{apt.reason || 'N/A'}</td>
                        <td>
                          <span className="badge" style={{
                            background: apt.status === 'completed' ? '#dcfce7' : '#dbeafe',
                            color: apt.status === 'completed' ? '#166534' : '#1e40af'
                          }}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleCreateReport({
                              patientid: apt.patientid,
                              name: apt.patientname,
                              age: apt.age,
                              gender: apt.gender,
                              contact: apt.contact
                            })}
                          >
                            📝 Create Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👥 Recent Patients ({allPatients.length})</h2>
                <button 
                  className="btn btn-outline"
                  onClick={() => setActiveView('patients')}
                >
                  View All Patients →
                </button>
              </div>
              
              {allPatients.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                  No patients registered yet.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Age/Gender</th>
                      <th>Blood Type</th>
                      <th>Contact</th>
                      <th>Emergency</th>
                      <th>Reports</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPatients.slice(0, 5).map(patient => (
                      <tr key={patient.patientid} style={tableRowStyle}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '18px'
                            }}>
                              {patient.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {patient.name} {patient.isseriouscase && <span style={{ color: '#dc2626' }}>⚠️</span>}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                ID: #{patient.patientid}
                              </div>
                            </div>
                          </div>
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
                            {patient.bloodtype || 'N/A'}
                          </span>
                        </td>
                        <td>📞 {patient.contact}</td>
                        <td>{patient.emergencycontact || 'N/A'}</td>
                        <td>{patient.totalreports || 0}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleCreateReport(patient)}
                          >
                            📝 Create Report
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

        {/* TODAY'S SCHEDULE VIEW */}
        {activeView === 'schedule' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>📅 Today's Registered Patients ({todaySchedule.length})</h2>
            
            {todaySchedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No Patients Today</h3>
                <p style={{ color: '#94a3b8' }}>No new patient registrations for today.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reg. Time</th>
                    <th>Patient</th>
                    <th>Age/Gender</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((apt, idx) => (
                    <tr key={apt.patientid || idx} style={tableRowStyle}>
                      <td><strong>{formatTime(apt.timeslot)}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                          }}>
                            {apt.patientname?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div><strong>{apt.patientname || 'Unknown'}</strong></div>
                            {apt.isseriouscase && (
                              <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ Critical</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{apt.age}y • {apt.gender}</td>
                      <td>📞 {apt.contact}</td>
                      <td>{apt.reason || 'N/A'}</td>
                      <td>
                        <span className="badge" style={{
                          background: apt.status === 'completed' ? '#dcfce7' : '#dbeafe',
                          color: apt.status === 'completed' ? '#166534' : '#1e40af'
                        }}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleCreateReport({
                            patientid: apt.patientid,
                            name: apt.patientname,
                            age: apt.age,
                            gender: apt.gender,
                            contact: apt.contact
                          })}
                        >
                          📝 Create Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ALL PATIENTS VIEW */}
        {activeView === 'patients' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2>👥 All Registered Patients ({allPatients.length})</h2>
              <input
                type="text"
                placeholder="🔍 Search patients by name or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '300px',
                  outline: 'none'
                }}
              />
            </div>
            
            {getFilteredPatients().length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                No patients found.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age/Gender</th>
                    <th>Blood Type</th>
                    <th>Contact</th>
                    <th>Emergency</th>
                    <th>Reports</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPatients().map(patient => (
                    <tr key={patient.patientid} style={tableRowStyle}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '18px'
                          }}>
                            {patient.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              {patient.name} {patient.isseriouscase && <span style={{ color: '#dc2626' }}>⚠️</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              ID: #{patient.patientid}
                            </div>
                          </div>
                        </div>
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
                          {patient.bloodtype || 'N/A'}
                        </span>
                      </td>
                      <td>📞 {patient.contact}</td>
                      <td>{patient.emergencycontact || 'N/A'}</td>
                      <td>{patient.totalreports || 0}</td>
                      <td>{formatDate(patient.dateregistered)}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleCreateReport(patient)}
                        >
                          📝 Create Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PENDING PATIENTS VIEW */}
        {activeView === 'appointments' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2>📅 Pending Patients ({allAppointments.length})</h2>
              <p style={{ color: '#64748b', marginTop: '8px' }}>
                Patients registered before today without medical reports
              </p>
            </div>
            
            {allAppointments.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                No pending patients. All caught up! 🎉
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reg. Date</th>
                    <th>Patient</th>
                    <th>Age/Gender</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allAppointments.map((apt, idx) => (
                    <tr key={apt.patientid || idx} style={tableRowStyle}>
                      <td>{formatDate(apt.appointmentdate)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                          }}>
                            {apt.patientname?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <strong>{apt.patientname || 'Unknown'}</strong>
                            {apt.isseriouscase && (
                              <span style={{ color: '#dc2626', fontSize: '12px', marginLeft: '8px' }}>⚠️ Critical</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{apt.age}y • {apt.gender}</td>
                      <td>📞 {apt.contact}</td>
                      <td>{apt.reason || 'N/A'}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleCreateReport({
                            patientid: apt.patientid,
                            name: apt.patientname,
                            age: apt.age,
                            gender: apt.gender,
                            contact: apt.contact
                          })}
                        >
                          📝 Create Report
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

      {/* Medical Report Form Modal */}
      {showReportForm && selectedPatient && (
        <MedicalReportForm
          patient={selectedPatient}
          onClose={() => {
            setShowReportForm(false);
            setSelectedPatient(null);
          }}
          onSuccess={() => {
            setShowReportForm(false);
            setSelectedPatient(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;