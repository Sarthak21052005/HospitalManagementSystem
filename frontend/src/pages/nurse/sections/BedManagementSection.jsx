import { getBedStatusColor, getBedStatusIcon } from '../utils/nurseHelpers';

function BedManagementSection({ wardBeds }) {
  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h2 style={{ marginBottom: '20px' }}>🛏️ Bed Management</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {wardBeds.map(bed => (
          <div 
            key={bed.bed_id}
            style={{ 
              border: `3px solid ${getBedStatusColor(bed.status)}`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              background: bed.status === 'occupied' ? '#fef2f2' : '#f9fafb'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {getBedStatusIcon(bed.status)}
            </div>
            <h3>Bed {bed.bed_number}</h3>
            <span style={{ 
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: getBedStatusColor(bed.status),
              color: 'white',
              marginTop: '8px',
              textTransform: 'capitalize'
            }}>
              {bed.status}
            </span>
            
            {bed.patient_name && (
              <div style={{ marginTop: '12px', padding: '8px', background: 'white', borderRadius: '6px' }}>
                <strong>{bed.patient_name}</strong>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>
                  {bed.age}y • {bed.gender}
                </p>
                {bed.is_serious_case && (
                  <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ Critical</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BedManagementSection;
