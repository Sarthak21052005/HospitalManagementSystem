import OrderCard from '../components/OrderCard';

function InProgressSection({ inProgressOrders, viewOrderDetails }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
        🔬 In Progress
      </h2>
      
      {inProgressOrders.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '16px', 
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, color: '#94a3b8' }}>No orders in progress</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {inProgressOrders.map(order => (
            <OrderCard 
              key={order.order_id}
              order={order}
              onView={() => viewOrderDetails(order.order_id)}
              showClaimButton={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default InProgressSection;
