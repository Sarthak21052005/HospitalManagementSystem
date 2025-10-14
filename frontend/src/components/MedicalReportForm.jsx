import { useState, useEffect } from 'react';
import { api } from '../api';

function MedicalReportForm({ patient, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chief_complaint: '',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    follow_up_date: '',
    notes: ''
  });

  // ✅ Lab Tests State
  const [requiresLabTests, setRequiresLabTests] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [labUrgency, setLabUrgency] = useState('ROUTINE');
  const [labNotes, setLabNotes] = useState('');

  // ✅ NEW: Medicine Prescription State
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [showMedicineSelector, setShowMedicineSelector] = useState(false);

  // Load available medicines on mount
  useEffect(() => {
    loadAvailableMedicines();
  }, []);

  async function loadAvailableMedicines() {
    try {
      const medicines = await api.getAvailableMedicines();
      setAvailableMedicines(medicines);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    }
  }

  // ✅ Lab Test Catalog
  const labTestCatalog = [
    { id: 1, name: 'Complete Blood Count (CBC)', category: 'Hematology', cost: 500 },
    { id: 2, name: 'Blood Sugar (Fasting)', category: 'Biochemistry', cost: 150 },
    { id: 3, name: 'Blood Sugar (Random)', category: 'Biochemistry', cost: 150 },
    { id: 4, name: 'HbA1c (Glycated Hemoglobin)', category: 'Biochemistry', cost: 600 },
    { id: 5, name: 'Lipid Profile', category: 'Biochemistry', cost: 800 },
    { id: 6, name: 'Liver Function Test (LFT)', category: 'Biochemistry', cost: 900 },
    { id: 7, name: 'Kidney Function Test (KFT)', category: 'Biochemistry', cost: 900 },
    { id: 8, name: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', cost: 700 },
    { id: 9, name: 'Urine Routine & Microscopy', category: 'Clinical Pathology', cost: 200 },
    { id: 10, name: 'Chest X-Ray', category: 'Radiology', cost: 400 },
    { id: 11, name: 'ECG (Electrocardiogram)', category: 'Cardiology', cost: 300 },
  ];

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Lab test toggle
  function toggleTest(testId) {
    if (selectedTests.includes(testId)) {
      setSelectedTests(selectedTests.filter(id => id !== testId));
    } else {
      setSelectedTests([...selectedTests, testId]);
    }
  }

  // ✅ NEW: Add medicine to prescription
  function addMedicine() {
    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        item_id: '',
        medicine_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 1,
        instructions: ''
      }
    ]);
  }

  // ✅ NEW: Update medicine in prescription
  function updateMedicine(index, field, value) {
    const updated = [...prescribedMedicines];
    updated[index][field] = value;

    // If item_id changes, auto-fill medicine_name
    if (field === 'item_id') {
      const medicine = availableMedicines.find(m => m.item_id === parseInt(value));
      if (medicine) {
        updated[index].medicine_name = medicine.item_name;
      }
    }

    setPrescribedMedicines(updated);
  }

  // ✅ NEW: Remove medicine from prescription
  function removeMedicine(index) {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  }

  // Calculate total lab cost
  function getTotalLabCost() {
    return selectedTests.reduce((sum, id) => {
      const test = labTestCatalog.find(t => t.id === id);
      return sum + (test?.cost || 0);
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.chief_complaint.trim()) {
      alert('⚠️ Please enter chief complaint');
      return;
    }

    if (requiresLabTests && selectedTests.length === 0) {
      alert('⚠️ Please select at least one lab test or uncheck "Lab Tests Required"');
      return;
    }

    // ✅ NEW: Validate prescribed medicines
    if (prescribedMedicines.length > 0) {
      for (let med of prescribedMedicines) {
        if (!med.item_id || !med.dosage || !med.frequency || !med.duration || !med.quantity) {
          alert('⚠️ Please fill all medicine details');
          return;
        }
      }
    }

    try {
      setLoading(true);

      // Step 1: Create medical report
      const reportData = {
        patient_id: patient.patientid || patient.patient_id,
        chief_complaint: formData.chief_complaint,
        symptoms: formData.symptoms,
        final_diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes,
        requires_lab_tests: requiresLabTests,
        lab_tests: requiresLabTests ? selectedTests : [],
        lab_urgency: requiresLabTests ? labUrgency : null,
        lab_notes: requiresLabTests ? labNotes : null
      };

      const response = await api.createMedicalReport(reportData);
      const recordId = response.record_id;

      // ✅ Step 2: Prescribe medicines (if any)
      if (prescribedMedicines.length > 0) {
        await api.prescribeMedicines(recordId, prescribedMedicines);
      }

      let successMsg = '✅ Medical report created successfully!';
      if (requiresLabTests) successMsg += ' Lab tests ordered.';
      if (prescribedMedicines.length > 0) successMsg += ` ${prescribedMedicines.length} medicine(s) prescribed.`;

      alert(successMsg);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error creating medical report:', err);
      alert('❌ Failed to create medical report: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', width: '100%' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>📋 Create Medical Report</h2>

        <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
          <strong>{patient.name}</strong> | Age: {patient.age} | Gender: {patient.gender}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Chief Complaint */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chief Complaint *</label>
            <textarea
              name="chief_complaint"
              value={formData.chief_complaint}
              onChange={handleChange}
              required
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>

          {/* Symptoms */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Symptoms</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>

          {/* Diagnosis */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={2}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>

          {/* Prescription */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prescription Notes</label>
            <textarea
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              placeholder="e.g., Rest for 3 days, avoid cold food..."
            />
          </div>

          {/* ✅ NEW: Medicine Prescription Section */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#374151' }}>💊 Prescribe Medicines</h3>
              <button type="button" onClick={addMedicine} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                + Add Medicine
              </button>
            </div>

            {prescribedMedicines.length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No medicines prescribed yet</p>
            ) : (
              <div>
                {prescribedMedicines.map((med, idx) => (
                  <div key={idx} style={{ marginBottom: '15px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      {/* Medicine Select */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Medicine *</label>
                        <select
                          value={med.item_id}
                          onChange={(e) => updateMedicine(idx, 'item_id', e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        >
                          <option value="">Select Medicine</option>
                          {availableMedicines.map(m => (
                            <option key={m.item_id} value={m.item_id}>
                              {m.item_name} (Stock: {m.quantity_in_stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dosage */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Dosage *</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                      </div>

                      {/* Frequency */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Frequency *</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                          placeholder="e.g., Twice daily"
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Duration *</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                          placeholder="e.g., 5 days"
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Quantity *</label>
                        <input
                          type="number"
                          value={med.quantity}
                          onChange={(e) => updateMedicine(idx, 'quantity', e.target.value)}
                          min="1"
                          required
                          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                      </div>

                      {/* Instructions */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#6b7280' }}>Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                          placeholder="e.g., After meals"
                          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <button type="button" onClick={() => removeMedicine(idx)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lab Tests Section (existing) */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={requiresLabTests}
                onChange={(e) => setRequiresLabTests(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              🧪 Lab Tests Required
            </label>

            {requiresLabTests && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Urgency</label>
                  <select value={labUrgency} onChange={(e) => setLabUrgency(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Tests</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {labTestCatalog.map(test => (
                      <label key={test.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', background: selectedTests.includes(test.id) ? '#dbeafe' : 'white', borderRadius: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(test.id)}
                          onChange={() => toggleTest(test.id)}
                          style={{ marginRight: '8px' }}
                        />
                        {test.name} (₹{test.cost})
                      </label>
                    ))}
                  </div>
                  {selectedTests.length > 0 && (
                    <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#059669' }}>
                      Total Cost: ₹{getTotalLabCost()}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Clinical Notes for Lab</label>
                  <textarea
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
                    placeholder="Additional instructions for lab technician..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Follow-up Date */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Follow-up Date</label>
            <input
              type="date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>

          {/* Additional Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: loading ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : '✅ Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicalReportForm;
