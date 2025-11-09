import { formatDate } from '../utils/nurseHelpers';

function PatientsSection({ 
  admittedPatients, 
  setShowAdmitForm, 
  setShowVitalsForm, 
  setSelectedPatient 
}) {
  return (
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
        <p style={{ color:'green', textAlign: 'center', padding: '40px' }}>
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
                <td>{formatDate(patient.admission_date)}</td>
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
  );
}

export default PatientsSection;
