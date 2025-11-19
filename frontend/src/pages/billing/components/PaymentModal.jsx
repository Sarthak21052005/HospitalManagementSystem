// src/pages/billing/components/PaymentModal.jsx

import { useState } from 'react';
import { formatCurrency, formatBillNumber } from '../utils/Billinghelpers';

function PaymentModal({ bill, onClose, onProcessPayment }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  if (!bill) return null;

  const balanceAmount = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount || 0);

  function handleSubmit(e) {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (paymentAmount > balanceAmount) {
      alert('Payment amount cannot exceed balance due');
      return;
    }
    
    onProcessPayment(bill.bill_id, paymentAmount, paymentMethod, referenceNumber);
  }

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
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            💳 Process Payment
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

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Bill Info */}
          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Bill Number</p>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>
                {formatBillNumber(bill.bill_id)}
              </p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Patient</p>
              <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.patient_name}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Total Amount</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(bill.total_amount)}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Paid</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#16a34a' }}>{formatCurrency(bill.paid_amount || 0)}</p>
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#991b1b' }}>Balance Due</p>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '24px', color: '#dc2626' }}>
                {formatCurrency(balanceAmount)}
              </p>
            </div>
          </div>

          {/* Payment Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
              Payment Amount *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontWeight: '600'
              }}>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={balanceAmount}
                step="0.01"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 32px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  fontWeight: '600'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(balanceAmount.toFixed(2))}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                background: '#f1f5f9',
                color: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Pay Full Amount
            </button>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
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

          {/* Reference Number */}
          {(paymentMethod !== 'cash') && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                Reference/Transaction Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter reference number"
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
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
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
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              Process Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;