import { useState } from 'react';
import { api } from '../../api';
function RecordVitalsForm({ patient, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    temperature: '',
    blood_pressure: '',
    pulse_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.temperature && !formData.blood_pressure && !formData.pulse_rate) {
      alert('Please fill in at least one vital sign measurement.');
      return;
    }

    try {
      setLoading(true);

      // ✅ Send with patient_id and record_id (if available)
      const payload = {
        patient_id: patient.patient_id,
        record_id: patient.record_id || null,  // ✅ Link to medical record if available
        temperature: formData.temperature || null,
        blood_pressure: formData.blood_pressure || null,
        pulse_rate: formData.pulse_rate ? parseInt(formData.pulse_rate) : null,
        respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
        oxygen_saturation: formData.oxygen_saturation ? parseFloat(formData.oxygen_saturation) : null,
        notes: formData.notes || null
      };

      await api.recordVitalSigns(payload);
      
      alert('✅ Vital signs recorded successfully!');
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err) {
      console.error('Failed to record vital signs:', err);
      alert(err.message || 'Failed to record vital signs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '32px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1e293b' }}>
            🩺 Record Vital Signs
          </h2>
          <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              <strong>Patient:</strong> {patient.patient_name || patient.name} ({patient.age}yrs, {patient.gender})
            </p>
            {patient.record_id && (
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
                📋 Medical Record ID: {patient.record_id}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Temperature */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                🌡️ Temperature (°F)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                step="0.1"
                min="90"
                max="110"
                placeholder="e.g., 98.6"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Blood Pressure */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                💉 Blood Pressure (mmHg)
              </label>
              <input
                type="text"
                name="blood_pressure"
                value={formData.blood_pressure}
                onChange={handleChange}
                placeholder="e.g., 120/80"
                pattern="\d{2,3}/\d{2,3}"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#64748b', fontSize: '13px' }}>Format: systolic/diastolic (e.g., 120/80)</small>
            </div>

            {/* Pulse Rate */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                💓 Pulse Rate (bpm)
              </label>
              <input
                type="number"
                name="pulse_rate"
                value={formData.pulse_rate}
                onChange={handleChange}
                min="40"
                max="200"
                placeholder="e.g., 72"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Respiratory Rate */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                🫁 Respiratory Rate (breaths/min)
              </label>
              <input
                type="number"
                name="respiratory_rate"
                value={formData.respiratory_rate}
                onChange={handleChange}
                min="8"
                max="60"
                placeholder="e.g., 16"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Oxygen Saturation */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                🫧 Oxygen Saturation (%)
              </label>
              <input
                type="number"
                name="oxygen_saturation"
                value={formData.oxygen_saturation}
                onChange={handleChange}
                step="0.1"
                min="50"
                max="100"
                placeholder="e.g., 98.5"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                📝 Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional observations..."
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Recording...' : '✅ Save Vital Signs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordVitalsForm;
