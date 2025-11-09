import { calculateUtilization, getUtilizationColor, getUtilizationGradient } from '../utils/BedHelpers';

function WardsStatsSection({ wards }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      {wards.map(ward => {
        const utilization = calculateUtilization(ward.current_beds, ward.bed_capacity);
        const utilColor = getUtilizationColor(utilization);
        const utilGradient = getUtilizationGradient(utilization);
        
        return (
          <div key={ward.ward_id} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  {ward.name}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {ward.category} • {ward.location}
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                background: utilColor.bg,
                color: utilColor.color,
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {utilization}%
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Beds</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                  {ward.current_beds} / {ward.bed_capacity}
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${utilization}%`,
                  height: '100%',
                  background: utilGradient,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#16a34a', fontWeight: '600' }}>{ward.available_beds || 0}</div>
                <div style={{ color: '#4ade80' }}>Available</div>
              </div>
              <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#dc2626', fontWeight: '600' }}>{ward.occupied_beds || 0}</div>
                <div style={{ color: '#f87171' }}>Occupied</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WardsStatsSection;
