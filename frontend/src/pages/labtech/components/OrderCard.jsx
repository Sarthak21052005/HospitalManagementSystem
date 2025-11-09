import { getUrgencyColor, formatOrderDate } from '../utils/LabHelpers';

function OrderCard({ order, onClaim, onView, showClaimButton }) {
  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      border: `3px solid ${getUrgencyColor(order.urgency)}20`,
      borderLeft: `6px solid ${getUrgencyColor(order.urgency)}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
              {order.patient_name}
            </h3>
            <span style={{
              padding: '4px 12px',
              background: getUrgencyColor(order.urgency),
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {order.urgency}
            </span>
          </div>
          
          <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Patient Info:</strong> {order.age}y • {order.gender}
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Doctor:</strong> Dr. {order.doctor_name} ({order.specialization})
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Tests Ordered:</strong> {order.test_count} test(s)
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Ordered:</strong> {formatOrderDate(order.order_date)}
            </p>
          </div>

          {order.clinical_notes && (
            <div style={{ 
              padding: '12px', 
              background: '#f0f9ff', 
              borderRadius: '8px',
              borderLeft: '3px solid #3b82f6'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                <strong>Clinical Notes:</strong> {order.clinical_notes}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {showClaimButton && (
            <button
              onClick={onClaim}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }}
            >
              🖐️ Claim Order
            </button>
          )}
          <button
            onClick={onView}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            {showClaimButton ? '📄 View Details' : '⚗️ Enter Results'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
