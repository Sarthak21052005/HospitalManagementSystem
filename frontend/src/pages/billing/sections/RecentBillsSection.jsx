// src/pages/billing/sections/RecentBillsSection.jsx

import { formatDate, formatCurrency, formatBillNumber, getPaymentStatusBadge, getPaymentMethodIcon } from '../utils/Billinghelpers';

function RecentBillsSection({ recentBills, onViewBill, onPrintInvoice }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
        📊 Recent Bills ({recentBills.length})
      </h2>
      
      {recentBills.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '60px', 
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <p style={{ margin: 0, color: '#94a3b8' }}>No bills generated yet</p>
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Bill #</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Days</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>Amount</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Payment</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((bill, idx) => {
                const statusBadge = getPaymentStatusBadge(bill.payment_status);
                const paymentIcon = getPaymentMethodIcon(bill.payment_method);
                
                return (
                  <tr 
                    key={bill.bill_id || idx}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ padding: '16px', fontWeight: '600', color: '#3b82f6' }}>
                      {formatBillNumber(bill.bill_id)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{bill.patient_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {bill.age}y • {bill.gender}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>
                      {formatDate(bill.bill_date)}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>
                      {bill.total_days} days
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>
                      {formatCurrency(bill.total_amount)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '18px' }}>{paymentIcon}</span>
                      <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '13px' }}>
                        {bill.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => onViewBill(bill.bill_id)}
                          style={{
                            padding: '6px 12px',
                            background: '#f1f5f9',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#dbeafe'}
                          onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                        >
                          👁️ View
                        </button>
                        {bill.payment_status === 'paid' && (
                          <button
                            onClick={() => onPrintInvoice(bill.bill_id)}
                            style={{
                              padding: '6px 12px',
                              background: '#f1f5f9',
                              color: '#10b981',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#dcfce7'}
                            onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                          >
                            🖨️ Print
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentBillsSection;