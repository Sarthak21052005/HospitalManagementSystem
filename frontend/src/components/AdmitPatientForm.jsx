import { useState, useEffect } from 'react';
import { api } from '../api';

function AdmitPatientForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [wards, setWards] = useState([]);
  const [wardBeds, setWardBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    ward_id: '',
    bed_id: '',
    doctor_id: '',
    admission_reason: '',
    expected_discharge_date: ''
  });

  useEffect(() => {
    loadFormData();
  }, []);

  async function loadFormData() {
    try {
      const [patientsData, wardsData, doctorsData] = await Promise.all([
        api.getAvailablePatients(),
        api.getNurseWards(),
        api.getDoctorsList()
      ]);
      
      setAvailablePatients(patientsData);
      setWards(wardsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Failed to load form data:', err);
      alert('Failed to load form data');
    }
  }

  async function handleWardChange(wardId) {
    setFormData({ ...formData, ward_id: wardId, bed_id: '' });
    
    if (!wardId) {
      setWardBeds([]);
      return;
    }
    
    try {
      const beds = await api.getWardBeds(wardId);
      const availableBeds = beds.filter(bed => bed.status === 'available');
      setWardBeds(availableBeds);
    } catch (err) {
      console.error('Failed to load ward beds:', err);
      alert('Failed to load beds');
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.patient_id || !formData.bed_id || !formData.doctor_id || !formData.admission_reason) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await api.createAdmission(formData);
      alert('✅ Patient admitted successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error admitting patient:', err);
      alert('Failed to admit patient: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '32px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>🛏️ Admit New Patient</h2>
          <button onClick={onClose} className="btn btn-outline">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Patient Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Select Patient *
            </label>
            <select
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            >
              <option value="">-- Choose Patient --</option>
              {availablePatients.map(patient => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.name} • {patient.age}y • {patient.gender} • Blood: {patient.blood_type}
                  {patient.is_serious_case && ' ⚠️ Critical'}
                </option>
              ))}
            </select>
            {availablePatients.length === 0 && (
              <p style={{ color: '#f59e0b', fontSize: '14px', marginTop: '8px' }}>
                ⚠️ No patients available for admission
              </p>
            )}
          </div>

          {/* Ward Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Select Ward *
            </label>
            <select
              name="ward_id"
              value={formData.ward_id}
              onChange={(e) => handleWardChange(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            >
              <option value="">-- Choose Ward --</option>
              {wards.map(ward => (
                <option key={ward.ward_id} value={ward.ward_id}>
                  {ward.name} ({ward.category}) - {ward.available_beds} beds available
                </option>
              ))}
            </select>
          </div>

          {/* Bed Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Select Bed *
            </label>
            <select
              name="bed_id"
              value={formData.bed_id}
              onChange={handleChange}
              required
              disabled={!formData.ward_id || wardBeds.length === 0}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            >
              <option value="">-- Choose Bed --</option>
              {wardBeds.map(bed => (
                <option key={bed.bed_id} value={bed.bed_id}>
                  Bed {bed.bed_number} - Available 🟢
                </option>
              ))}
            </select>
            {formData.ward_id && wardBeds.length === 0 && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                ❌ No available beds in this ward
              </p>
            )}
          </div>

          {/* Doctor Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Assign Doctor *
            </label>
            <select
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Admission Reason */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Admission Reason *
            </label>
            <textarea
              name="admission_reason"
              value={formData.admission_reason}
              onChange={handleChange}
              placeholder="e.g., Post-operative care, Severe infection, Observation"
              required
              rows={3}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit' }}
            />
          </div>

          {/* Expected Discharge Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Expected Discharge Date
            </label>
            <input
              type="date"
              name="expected_discharge_date"
              value={formData.expected_discharge_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || availablePatients.length === 0}
            >
              {loading ? 'Admitting...' : '✅ Admit Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdmitPatientForm;
