function StatCard({ icon, title, value, color, bgColor, isActive }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '16px',
      border: isActive ? `2px solid ${color}` : '1px solid #e2e8f0',
      boxShadow: isActive ? `0 4px 12px ${color}40` : '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          fontSize: '40px', 
          width: '64px', 
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          borderRadius: '12px'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>{title}</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
