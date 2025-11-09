import { formatDate, tableRowStyle, avatarGradient } from '../utils/doctorHelpers';

function PendingPatientsSection({ allAppointments, handleCreateReport }) {
  return (
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
                {appointment.status === 'completed' ? (
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
                    onClick={() => handleCreateReport(appointment)}
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

export default PendingPatientsSection;
