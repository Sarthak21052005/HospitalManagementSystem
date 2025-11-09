import OrderCard from '../components/OrderCard';

function CompletedOrdersSection({ completedOrders, viewOrderDetails }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
        ✅ Completed Today
      </h2>
      
      {completedOrders.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '16px', 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <p style={{ margin: 0, color: '#94a3b8' }}>No orders completed today</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {completedOrders.map(order => (
            <div 
              key={order.order_id}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '2px solid #d1fae5',
                borderLeft: '6px solid #10b981'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    {order.patient_name}
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                    <strong>Completed:</strong> {new Date(order.completed_date || order.updated_at).toLocaleString()}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                    <strong>Tests:</strong> {order.test_count} test(s) • <strong>Doctor:</strong> Dr. {order.doctor_name}
                  </p>
                </div>
                <span style={{
                  padding: '8px 16px',
                  background: '#d1fae5',
                  color: '#16a34a',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700'
                }}>
                  ✅ COMPLETED
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompletedOrdersSection;
