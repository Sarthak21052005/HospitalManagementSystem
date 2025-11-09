import { calculateOccupancy } from '../utils/nurseHelpers';

function WardsSection({ wards, loadWardBeds }) {
  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h2 style={{ marginBottom: '20px' }}>🏥 My Assigned Wards</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {wards.map(ward => (
          <div 
            key={ward.ward_id}
            className="card"
            style={{ 
              cursor: 'pointer', 
              border: '2px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}
            onClick={() => loadWardBeds(ward.ward_id)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3>{ward.name}</h3>
              <span style={{ 
                background: '#f1f5f9', 
                padding: '4px 12px', 
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#475569'
              }}>
                {ward.category}
              </span>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Total Capacity:</span>
                <strong>{ward.bed_capacity} beds</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Available:</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>🟢 {ward.available_beds}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Occupied:</span>
                <span style={{ color: '#ef4444', fontWeight: '600' }}>🔴 {ward.occupied_beds}</span>
              </div>
            </div>

            <div style={{ 
              background: '#f1f5f9', 
              padding: '8px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              Occupancy: {calculateOccupancy(ward.occupied_beds, ward.bed_capacity)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WardsSection;
