// src/pages/billing/sections/PendingBillsSection.jsx

import { formatDate, formatCurrency, formatBillNumber, getPaymentStatusBadge, getOverdueStatus } from '../utils/Billinghelpers';

function PendingBillsSection({ pendingBills, onViewBill, onProcessPayment }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
        ⏳ Pending Payments ({pendingBills.length})
      </h2>
      
      {pendingBills.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '60px', 
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontWeight: '600' }}>All Paid Up!</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>No pending payments at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {pendingBills.map(bill => {
            const statusBadge = getPaymentStatusBadge(bill.payment_status);
            const overdueStatus = getOverdueStatus(bill.bill_date);
            const balanceAmount = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount || 0);
            
            return (
              <div 
                key={bill.bill_id}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${statusBadge.color}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                        {bill.patient_name}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {statusBadge.text}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: '#fee2e2',
                        color: overdueStatus.color,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {overdueStatus.text}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Bill Number</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatBillNumber(bill.bill_id)}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Bill Date</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{formatDate(bill.bill_date)}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Ward</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.ward_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Days</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{bill.total_days} days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', minWidth: '200px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Balance Due</p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#ea580c' }}>
                      {formatCurrency(balanceAmount)}
                    </p>
                    {bill.paid_amount > 0 && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        Paid: {formatCurrency(bill.paid_amount)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => onViewBill(bill.bill_id)}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      background: 'white',
                      color: '#3b82f6',
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#3b82f6';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#3b82f6';
                    }}
                  >
                    📄 View Details
                  </button>
                  <button
                    onClick={() => onProcessPayment(bill)}
                    style={{
                      flex: 1,
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    💳 Process Payment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PendingBillsSection;