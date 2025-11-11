// src/pages/billing/components/GenerateBillModal.jsx

import { useState, useEffect } from 'react';
import { api } from '../../../api';
import { formatDate, formatCurrency, calculateDays } from '../utils/Billinghelpers';

function GenerateBillModal({ admission, onClose, onGenerate }) {
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admission) {
      calculateBillPreview();
    }
  }, [admission, dischargeDate]);

  async function calculateBillPreview() {
    try {
      setLoading(true);
      const result = await api.calculateBill(admission.admission_id, dischargeDate);
      setCalculation(result);
    } catch (error) {
      console.error('Failed to calculate bill:', error);
      alert('Failed to calculate bill preview');
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    onGenerate(admission.admission_id, dischargeDate, discount, paymentMethod);
  }

  if (!admission) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            💰 Generate Bill
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Patient Info */}
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#64748b' }}>Patient Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Name</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{admission.patient_name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Ward</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{admission.ward_name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Admission Date</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatDate(admission.admission_date)}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Doctor</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Dr. {admission.doctor_name}</p>
              </div>
            </div>
          </div>

          {/* Discharge Date Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
              Discharge Date
            </label>
            <input
              type="date"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              min={admission.admission_date}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Bill Calculation Preview */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Calculating bill...
            </div>
          ) : calculation ? (
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#64748b' }}>Bill Breakdown</h3>
              
              <div style={{ marginBottom: '12px' }}>
                {[
                  { label: 'Room Charges', value: calculation.breakdown.room.total, detail: `${calculation.total_days} days` },
                  { label: 'Doctor Consultation', value: calculation.breakdown.consultation.total, detail: `${calculation.breakdown.consultation.count} visits` },
                  { label: 'Lab Tests', value: calculation.breakdown.lab.total, detail: `${calculation.breakdown.lab.count} tests` },
                  { label: 'Medicines', value: calculation.breakdown.medicines.total, detail: `${calculation.breakdown.medicines.count} items` },
                  { label: 'Nursing Care', value: calculation.breakdown.nursing.total, detail: `${calculation.breakdown.nursing.vitalCount} recordings` },
                  ...(calculation.breakdown.emergency.total > 0 ? [{ label: 'Emergency Charges', value: calculation.breakdown.emergency.total, detail: 'Critical case' }] : []),
                  ...(calculation.breakdown.equipment.total > 0 ? [{ label: 'Equipment Charges', value: calculation.breakdown.equipment.total, detail: 'Medical supplies' }] : [])
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{item.detail}</p>
                    </div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontWeight: '500', color: '#64748b' }}>Subtotal</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(calculation.subtotal)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontWeight: '500', color: '#64748b' }}>Tax (18%)</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(calculation.tax_amount)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#dbeafe', borderRadius: '8px', marginTop: '8px' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>Total Amount</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{formatCurrency(calculation.total_amount)}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Discount Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
              Discount (%)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              min="0"
              max="100"
              step="0.1"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: 'white'
              }}
            >
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Credit/Debit Card</option>
              <option value="upi">📱 UPI</option>
              <option value="insurance">🏥 Insurance</option>
              <option value="cheque">📝 Cheque</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'white',
                color: '#64748b',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!calculation}
              style={{
                flex: 1,
                padding: '14px',
                background: calculation ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: calculation ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: calculation ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Generate Bill & Discharge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateBillModal;
