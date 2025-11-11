// src/pages/billing/components/BillDetailsModal.jsx

import { formatDate, formatCurrency, formatBillNumber, getPaymentStatusBadge, getPaymentMethodIcon } from '../utils/Billinghelpers';

function BillDetailsModal({ bill, onClose }) {
  if (!bill) return null;

  const statusBadge = getPaymentStatusBadge(bill.payment_status);
  const paymentIcon = getPaymentMethodIcon(bill.payment_method);
  const balanceAmount = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount || 0);

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
        maxWidth: '900px',
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
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
              Bill Details
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {formatBillNumber(bill.bill_id)}
            </p>
          </div>
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
          {/* Patient & Admission Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {/* Patient Info */}
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Patient Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Name</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.patient_name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Age / Gender</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.age}y • {bill.gender}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Blood Type</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.blood_type || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Contact</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.contact || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Admission Info */}
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Admission Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Ward / Bed</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                    {bill.ward_name} • Bed {bill.bed_number}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Doctor</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                    Dr. {bill.doctor_name}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{bill.specialization}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Admission Date</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatDate(bill.admission_date)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Discharge Date</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatDate(bill.discharge_date)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Total Days</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.total_days} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Items */}
          {bill.items && bill.items.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                Bill Breakdown
              </h3>
              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px' }}>Item</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '12px' }}>Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#64748b', fontSize: '12px' }}>Rate</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#64748b', fontSize: '12px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.item_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{item.item_type}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>{formatCurrency(item.unit_price)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
              Payment Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b' }}>Subtotal</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(bill.subtotal)}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b' }}>Tax (18% GST)</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatCurrency(bill.tax_amount)}</p>
              </div>
              {bill.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, color: '#16a34a' }}>Discount</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#16a34a' }}>- {formatCurrency(bill.discount)}</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#dbeafe', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>Total Amount</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{formatCurrency(bill.total_amount)}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#dcfce7', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#166534' }}>Paid Amount</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#166534' }}>{formatCurrency(bill.paid_amount || 0)}</p>
              </div>
              {balanceAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#fee2e2', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#991b1b' }}>Balance Due</p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>{formatCurrency(balanceAmount)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div style={{
            background: statusBadge.bg,
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Payment Status</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: statusBadge.color }}>
                  {statusBadge.text.toUpperCase()}
                </p>
              </div>
              {bill.payment_method && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Payment Method</p>
                  <p style={{ margin: 0, fontSize: '18px' }}>
                    {paymentIcon} <span style={{ fontWeight: '600', color: '#1e293b', marginLeft: '8px' }}>{bill.payment_method}</span>
                  </p>
                </div>
              )}
            </div>
            {bill.payment_date && (
              <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Paid on {formatDate(bill.payment_date)}
              </p>
            )}
          </div>

          {/* Payment History */}
          {bill.payments && bill.payments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                Payment History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bill.payments.map((payment, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1e293b' }}>
                        {getPaymentMethodIcon(payment.payment_method)} {payment.payment_method}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {formatDate(payment.transaction_date)}
                        {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                      </p>
                      {payment.processed_by_name && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                          Processed by: {payment.processed_by_name}
                        </p>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillDetailsModal;
