import { useState, useEffect } from 'react';
import { api } from '../api';

function AdmitPatientForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [eligiblePatients, setEligiblePatients] = useState([]);
  const [wards, setWards] = useState([]);
  const [wardBeds, setWardBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    ward_id: '',
    bed_id: '',
    doctor_id: '',
    admission_reason: '',
    expected_discharge_date: ''
  });
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadFormData();
  }, []);

  async function loadFormData() {
    try {
      setInitialLoad(true);
      const [patientsData, wardsData, doctorsData] = await Promise.all([
        api.getEligiblePatients(),
        api.getNurseWards(),
        api.getDoctorsList()
      ]);
      
      console.log('✅ Eligible patients:', patientsData);
      setEligiblePatients(patientsData);
      setWards(wardsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Failed to load form data:', err);
      alert('Failed to load form data: ' + err.message);
    } finally {
      setInitialLoad(false);
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
      alert('Failed to load beds: ' + err.message);
    }
  }

  function handlePatientChange(patientId) {
    const patient = eligiblePatients.find(p => p.patient_id === parseInt(patientId));
    setSelectedPatient(patient);
    setFormData({
      ...formData,
      patient_id: patientId,
      doctor_id: '' // Don't auto-select doctor anymore
    });
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
      const response = await api.createAdmission(formData);
      
      if (response.reassignment) {
        alert('✅ Bed reassigned successfully!');
      } else {
        alert('✅ Patient admitted successfully!');
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error admitting patient:', err);
      alert('Failed to admit patient: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const canProceedToStep2 = formData.patient_id;
  const canProceedToStep3 = canProceedToStep2 && formData.ward_id && formData.bed_id;

  if (initialLoad) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '700px',
        maxWidth: '95%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.3s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
          
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
              🏥 Patient Admission
            </h2>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '15px' }}>
              {selectedPatient?.currently_admitted 
                ? '⚠️ This patient is currently admitted. You can reassign their bed.'
                : 'Admit patient with medical record to available bed'}
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { num: 1, label: 'Patient' },
              { num: 2, label: 'Ward & Bed' },
              { num: 3, label: 'Details' }
            ].map(step => (
              <div
                key={step.num}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: currentStep >= step.num ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentStep >= step.num ? 'white' : 'rgba(255,255,255,0.3)',
                  color: currentStep >= step.num ? '#6366f1' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600',
                  opacity: currentStep >= step.num ? 1 : 0.7
                }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '32px', maxHeight: 'calc(90vh - 250px)', overflowY: 'auto' }}>
          
          {/* STEP 1: Patient Selection */}
          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '15px'
                }}>
                  Select Patient <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">-- Select a patient with medical record --</option>
                  {eligiblePatients.map(patient => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.name} • {patient.age}Y/{patient.gender}
                      {patient.is_serious_case && ' ⚠️ CRITICAL'}
                      {patient.currently_admitted && ` [Currently in ${patient.current_ward_name} - ${patient.current_bed_number}]`}
                    </option>
                  ))}
                </select>
                
                {eligiblePatients.length === 0 && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '12px',
                    color: '#dc2626',
                    fontSize: '14px'
                  }}>
                    ⚠️ No patients with medical records found. Patients need a doctor's assessment before admission.
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div style={{
                  padding: '20px',
                  background: selectedPatient.currently_admitted ? '#fef2f2' : '#f0fdf4',
                  border: `2px solid ${selectedPatient.currently_admitted ? '#fecaca' : '#86efac'}`,
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: `1px solid ${selectedPatient.currently_admitted ? '#fecaca' : '#86efac'}`
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: selectedPatient.currently_admitted ? '#fee2e2' : '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {selectedPatient.is_serious_case ? '⚠️' : '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                        {selectedPatient.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.blood_type}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                        Diagnosis
                      </div>
                      <div style={{ fontSize: '14px', color: '#1e293b' }}>
                        {selectedPatient.diagnosis}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                        Treating Doctor
                      </div>
                      <div style={{ fontSize: '14px', color: '#1e293b' }}>
                        Dr. {selectedPatient.doctor_name} • {selectedPatient.specialization}
                      </div>
                    </div>
                    
                    {selectedPatient.currently_admitted && (
                      <div style={{
                        padding: '12px',
                        background: '#fee2e2',
                        borderRadius: '8px',
                        marginTop: '8px'
                      }}>
                        <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
                          ⚠️ Currently Admitted
                        </div>
                        <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px' }}>
                          {selectedPatient.current_ward_name} - Bed {selectedPatient.current_bed_number}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: canProceedToStep2 ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: canProceedToStep2 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: canProceedToStep2 ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                Continue to Ward Selection →
              </button>
            </div>
          )}

          {/* STEP 2: Ward & Bed Selection */}
          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '15px'
                }}>
                  Select Ward <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="ward_id"
                  value={formData.ward_id}
                  onChange={(e) => handleWardChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">-- Select Ward --</option>
                  {wards.map(ward => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.name} • {ward.category} ({ward.available_beds || 0} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '15px'
                }}>
                  Select Bed <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="bed_id"
                  value={formData.bed_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.ward_id}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: formData.ward_id ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    background: formData.ward_id ? 'white' : '#f8fafc',
                    opacity: formData.ward_id ? 1 : 0.6
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">-- Select Bed --</option>
                  {wardBeds.map(bed => (
                    <option key={bed.bed_id} value={bed.bed_id}>
                      Bed {bed.bed_number} - Available
                    </option>
                  ))}
                </select>
                
                {formData.ward_id && wardBeds.length === 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fef3c7',
                    border: '2px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontSize: '13px'
                  }}>
                    ⚠️ No available beds in this ward
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: canProceedToStep3 ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: canProceedToStep3 ? 'pointer' : 'not-allowed',
                    boxShadow: canProceedToStep3 ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                  }}
                >
                  Continue to Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Additional Details */}
          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '15px'
                }}>
                  Attending Doctor <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '15px'
                }}>
                  Admission Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="admission_reason"
                  value={formData.admission_reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Enter detailed reason for admission..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '15px'
                }}>
                  Expected Discharge Date
                </label>
                <input
                  type="date"
                  name="expected_discharge_date"
                  value={formData.expected_discharge_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: loading 
                      ? '#cbd5e1' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ 
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      ✓ {selectedPatient?.currently_admitted ? 'Reassign Bed' : 'Admit Patient'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default AdmitPatientForm;
