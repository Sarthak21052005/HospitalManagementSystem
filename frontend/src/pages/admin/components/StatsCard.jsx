function StatsCard({ card }) {
  return (
    <div
      style={{
        background: 'white',
        padding: '28px',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: card.gradient,
        opacity: 0.1,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)',
        filter: 'blur(30px)'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: card.gradient,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: `0 8px 16px ${card.color}30`
          }}>
            {card.icon}
          </div>
          <div style={{
            padding: '6px 12px',
            background: card.trend === 'up' ? '#DCFCE7' : '#FEE2E2',
            color: card.trend === 'up' ? '#16A34A' : '#DC2626',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{card.trend === 'up' ? '↗' : '↘'}</span>
            <span>{card.change}</span>
          </div>
        </div>

        <div style={{ fontSize: '36px', fontWeight: '700', color: card.color, marginBottom: '4px' }}>
          {card.value}
        </div>
        <div style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>
          {card.title}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
