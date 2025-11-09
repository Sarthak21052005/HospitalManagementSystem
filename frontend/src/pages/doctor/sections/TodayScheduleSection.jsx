import { formatTime, tableRowStyle, avatarGradient } from '../utils/doctorHelpers';

function TodayScheduleSection({ todaySchedule, handleCreateReport }) {
  return (
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
  );
}

export default TodayScheduleSection;
