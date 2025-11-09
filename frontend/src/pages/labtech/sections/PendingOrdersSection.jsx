import OrderCard from '../components/OrderCard';

function PendingOrdersSection({ pendingOrders, claimOrder, viewOrderDetails }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
        ⏳ Pending Orders
      </h2>
      
      {pendingOrders.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '60px', 
          borderRadius: '16px', 
          textAlign: 'center',
          border: '2px dashed #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontWeight: '600' }}>
            All Caught Up!
          </h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>No pending lab orders at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {pendingOrders.map(order => (
            <OrderCard 
              key={order.order_id}
              order={order}
              onClaim={() => claimOrder(order.order_id)}
              onView={() => viewOrderDetails(order.order_id)}
              showClaimButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingOrdersSection;
