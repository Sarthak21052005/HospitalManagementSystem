import { useState, useEffect } from 'react';
import { api } from '../../../api';
import { validateResults } from '../utils/LabHelpers';

function ResultModal({ order, onClose, onSuccess }) {
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!order || !order.tests) {
      console.error('❌ Order or tests missing:', order);
      return;
    }

    const initialResults = {};
    order.tests.forEach(test => {
      initialResults[test.test_id] = {
        resultValue: test.result_value || '',
        technicianNotes: test.technician_notes || ''
      };
    });
    setResults(initialResults);
  }, [order]);

  function updateResult(testId, field, value) {
    setResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value
      }
    }));
  }

  async function handleSubmit() {
    if (!validateResults(order.tests, results)) {
      alert('⚠️ Please enter results for all tests');
      return;
    }

    try {
      setSubmitting(true);
      
      const formattedResults = order.tests.map(test => ({
        test_id: test.test_id,
        result_value: results[test.test_id].resultValue,
        technician_notes: results[test.test_id].technicianNotes || null
      }));

      console.log('📤 Submitting results for order:', order.order_id);
      
      await api.submitLabResults(order.order_id, formattedResults);
      
      alert('✅ Lab results submitted successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error submitting results:', err);
      alert('❌ Failed to submit results: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!order || !order.tests) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '28px', 
          borderBottom: '2px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                ⚗️ Enter Lab Results
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
                Patient: <strong>{order.patient_name}</strong> • {order.age}y • {order.gender}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '24px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tests List */}
        <div style={{ padding: '28px' }}>
          {order.tests.map((test, index) => (
            <div key={test.test_id} style={{
              padding: '24px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              marginBottom: index < order.tests.length - 1 ? '20px' : 0
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  {test.test_name}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  {test.test_category} • Normal Range: {test.normal_range || 'N/A'} {test.unit || ''}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Result Value <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={results[test.test_id]?.resultValue || ''}
                    onChange={(e) => updateResult(test.test_id, 'resultValue', e.target.value)}
                    placeholder={`Enter result in ${test.unit || 'appropriate unit'}`}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Technician Notes
                  </label>
                  <textarea
                    value={results[test.test_id]?.technicianNotes || ''}
                    onChange={(e) => updateResult(test.test_id, 'technicianNotes', e.target.value)}
                    placeholder="Any observations or notes..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ 
          padding: '24px 28px', 
          borderTop: '2px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '14px 28px',
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '14px 32px',
              background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit Results'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
