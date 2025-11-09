import StatCard from '../components/StatCard';

function StatsSection({ stats, activeView, onStatClick }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px',
      marginBottom: '32px'
    }}>
      <div 
        onClick={() => onStatClick('pending')}
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <StatCard 
          icon="⏳" 
          title="Pending Orders" 
          value={stats.pending} 
          color="#f59e0b"
          bgColor="#fef3c7"
          isActive={activeView === 'pending'}
        />
      </div>

      <div 
        onClick={() => onStatClick('in_progress')}
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <StatCard 
          icon="🔬" 
          title="In Progress" 
          value={stats.inProgress} 
          color="#3b82f6"
          bgColor="#dbeafe"
          isActive={activeView === 'in_progress'}
        />
      </div>

      <div 
        onClick={() => onStatClick('completed')}
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <StatCard 
          icon="✅" 
          title="Completed Today" 
          value={stats.completedToday} 
          color="#10b981"
          bgColor="#d1fae5"
          isActive={activeView === 'completed'}
        />
      </div>
    </div>
  );
}

export default StatsSection;
