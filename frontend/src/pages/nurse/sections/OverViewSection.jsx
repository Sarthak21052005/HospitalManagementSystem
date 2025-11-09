import { formatDate, getPatientStatusBadge } from '../utils/nurseHelpers';

function OverviewSection({ 
  stats, 
  admittedPatients, 
  pendingTasks,
  handleCardClick,
  setShowVitalsForm,
  setSelectedPatient 
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
        
        <div 
          className="stat-card" 
          style={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            color: 'white',
            cursor: 'pointer',
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
              {admittedPatients.slice(0, 5).map(patient => {
                const statusBadge = getPatientStatusBadge(patient.is_serious_case);
                return (
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
                    <td>{formatDate(patient.admission_date)}</td>
                    <td>
                      <span className="badge" style={{ 
                        background: statusBadge.background, 
                        color: statusBadge.color 
                      }}>
                        {statusBadge.text}
                      </span>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OverviewSection;
