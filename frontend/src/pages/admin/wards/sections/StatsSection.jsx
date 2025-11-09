import { calculateTotalBeds } from '../utils/WardHelpers';

function StatsSection({ nurses, wards, activeAssignments }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{nurses.length}</div>
        <div style={{ opacity: 0.9 }}>Total Nurses</div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏥</div>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{wards.length}</div>
        <div style={{ opacity: 0.9 }}>Total Wards</div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{activeAssignments.length}</div>
        <div style={{ opacity: 0.9 }}>Active Assignments</div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
      }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛏️</div>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
          {calculateTotalBeds(wards)}
        </div>
        <div style={{ opacity: 0.9 }}>Total Beds</div>
      </div>
    </div>
  );
}

export default StatsSection;
