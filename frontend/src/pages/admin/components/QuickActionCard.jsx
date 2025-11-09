function QuickActionCard({ action }) {
  return (
    <button
      onClick={action.action}
      style={{
        padding: '24px',
        background: `${action.color}10`,
        border: `2px solid ${action.color}30`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = `${action.color}20`;
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.borderColor = action.color;
        e.target.style.boxShadow = `0 8px 20px ${action.color}30`;
      }}
      onMouseLeave={(e) => {
        e.target.style.background = `${action.color}10`;
        e.target.style.transform = 'translateY(0)';
        e.target.style.borderColor = `${action.color}30`;
        e.target.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '36px' }}>{action.icon}</div>
      <div style={{ color: action.color, fontWeight: '700', fontSize: '16px' }}>
        {action.label}
      </div>
    </button>
  );
}

export default QuickActionCard;
