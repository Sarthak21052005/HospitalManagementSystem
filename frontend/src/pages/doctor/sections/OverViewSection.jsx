import { formatTime, formatDate, tableRowStyle, avatarGradient } from '../utils/doctorHelpers';

function OverviewSection({ 
  stats, 
  todaySchedule, 
  allPatients, 
  handleCardClick, 
  setActiveView,
  handleCreateReport 
}) {
  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div 
          className="stat-card" 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            cursor: 'pointer',
            transform: 'scale(1)',
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
            transform: 'scale(1)',
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
            transform: 'scale(1)',
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
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
            color: 'white',
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'transform 0.3s ease'
          }}
          onClick={() => handleCardClick('lab_reports')}
        >
          <div className="stat-icon" style={{ fontSize: '36px' }}>🧪</div>
          <div className="stat-content">
            <h3>Lab Reports</h3>
            <p>View Completed Tests</p>
          </div>
        </div>
      </div>

      {/* Today's Patients Preview */}
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
                        background: avatarGradient,
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
                    {apt.status === 'completed' ? (
                      <span style={{
                        padding: '8px 16px',
                        background: '#dcfce7',
                        color: '#16a34a',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: '2px solid #bbf7d0',
                        display: 'inline-block'
                      }}>
                        ✅ Report Completed
                      </span>
                    ) : (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Patients Preview */}
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
                        background: avatarGradient,
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
                    {patient.status === 'completed' ? (
                      <span style={{
                        padding: '8px 16px',
                        background: '#dcfce7',
                        color: '#16a34a',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: '2px solid #bbf7d0',
                        display: 'inline-block'
                      }}>
                        ✅ Report Completed
                      </span>
                    ) : (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleCreateReport(patient)}
                      >
                        📝 Create Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OverviewSection;
