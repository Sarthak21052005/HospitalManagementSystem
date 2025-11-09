function LowStockAlert({ stats, setFilterStatus }) {
  if (stats.lowStock === 0) return null;

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px 24px',
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE047 100%)',
      borderRadius: '16px',
      border: '2px solid #FBBF24',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{ fontSize: '36px' }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
          Low Stock Alert
        </div>
        <div style={{ fontSize: '14px', color: '#78350F' }}>
          {stats.lowStock} item{stats.lowStock > 1 ? 's are' : ' is'} running low. Consider reordering soon.
        </div>
      </div>
      <button
        onClick={() => setFilterStatus('low_stock')}
        style={{
          padding: '10px 20px',
          background: '#92400E',
          color: '#FEF3C7',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#78350F'}
        onMouseLeave={(e) => e.target.style.background = '#92400E'}
      >
        View Items
      </button>
    </div>
  );
}

export default LowStockAlert;
