function StatsCard({ icon, label, value, color = 'blue' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {typeof icon === 'string' ? (
          <span style={{ fontSize: '32px' }}>{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default StatsCard;
