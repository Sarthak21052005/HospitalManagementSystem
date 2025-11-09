import { formatDate, getFilteredPatients, tableRowStyle, avatarGradient } from '../utils/doctorHelpers';

function AllPatientsSection({ allPatients, searchQuery, setSearchQuery, handleCreateReport }) {
  const filteredPatients = getFilteredPatients(allPatients, searchQuery);

  return (
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
      
      {filteredPatients.length === 0 ? (
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
            {filteredPatients.map(patient => (
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
                <td>{formatDate(patient.dateregistered)}</td>
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
  );
}

export default AllPatientsSection;
