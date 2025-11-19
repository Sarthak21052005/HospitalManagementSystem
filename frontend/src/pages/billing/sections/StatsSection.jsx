// src/pages/billing/sections/StatsSection.jsx

import { formatCurrency } from '../utils/Billinghelpers';

function StatsSection({ stats, activeView, onStatClick }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '20px',
      marginBottom: '32px'
    }}>
      {/* Pending Bills */}
      <div 
        onClick={() => onStatClick('pending')}
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: activeView === 'pending' ? '2px solid #ea580c' : '1px solid #e2e8f0',
          boxShadow: activeView === 'pending' ? '0 4px 12px rgba(234, 88, 12, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            borderRadius: '12px',
            fontSize: '32px'
          }}>
            ⏳
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Pending Bills</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#ea580c' }}>
              {stats.pendingBills}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              {formatCurrency(stats.pendingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Paid Today */}
      <div 
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            borderRadius: '12px',
            fontSize: '32px'
          }}>
            ✅
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Paid Today</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>
              {formatCurrency(stats.paidToday)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div 
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '12px',
            fontSize: '32px'
          }}>
            📊
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Monthly Revenue</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
              {formatCurrency(stats.monthlyRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Bills */}
      <div 
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderRadius: '12px',
            fontSize: '32px'
          }}>
            ⚠️
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>Overdue Bills</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>
              {stats.overdueBills}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsSection;