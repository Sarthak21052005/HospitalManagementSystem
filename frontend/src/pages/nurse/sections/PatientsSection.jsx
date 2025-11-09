import { formatDate } from '../utils/nurseHelpers';

function PatientsSection({ admittedPatients, setShowAdmitForm, setShowVitalsForm, setSelectedPatient }) {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
          👥 Admitted Patients ({admittedPatients.length})
        </h2>
        <button
          onClick={() => setShowAdmitForm(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          + Admit New Patient
        </button>
      </div>

      {admittedPatients.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '60px', 
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏥</div>
          <p style={{ margin: 0, color: '#94a3b8' }}>No patients admitted in your wards.</p>
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Age/Gender</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Blood Type</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Ward</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Bed</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Doctor</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Admitted</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admittedPatients.map((patient, idx) => (
                <tr 
                  key={patient.admission_id || idx}
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    // ✅ REMOVED: No hover effect
                    transition: 'none' // Disable transitions
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        {patient.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {patient.name}
                          {patient.is_serious_case && (
                            <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    {patient.age}y • {patient.gender}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {patient.blood_type || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{patient.ward_name}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>Bed {patient.bed_number}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{patient.doctor_name}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{formatDate(patient.admission_date)}</td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowVitalsForm(true);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                    >
                      📊 Record Vitals
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientsSection;
  