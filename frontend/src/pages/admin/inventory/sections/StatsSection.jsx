function StatsSection({ stats }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          opacity: 0.1,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          filter: 'blur(20px)'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
            Total Items
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>
          {stats.inStock}
        </div>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          In Stock
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' }}>
          {stats.lowStock}
        </div>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          Low Stock
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444', marginBottom: '4px' }}>
          {stats.outOfStock}
        </div>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          Out of Stock
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
        color: 'white'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
        <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
          ₹{stats.totalValue.toLocaleString()}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
          Total Inventory Value
        </div>
      </div>
    </div>
  );
}

export default StatsSection;
