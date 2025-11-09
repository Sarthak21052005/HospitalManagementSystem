import { getStatusColor } from '../utils/BedHelpers';
function BedsTableSection({ filteredBeds, handleUpdateBedStatus, handleDeleteBed }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
        All Beds ({filteredBeds.length})
      </h2>

      {filteredBeds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛏️</div>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Beds Found</p>
          <p>Add beds to wards to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Bed Number</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Ward</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Patient</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeds.map(bed => {
                const statusStyle = getStatusColor(bed.status);
                return (
                  <tr key={bed.bed_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>{bed.bed_number}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{bed.ward_name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{bed.ward_category}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{bed.ward_location}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {bed.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {bed.patient_name ? (
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{bed.patient_name}</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>{bed.patient_contact}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No patient</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {bed.status !== 'occupied' && (
                          <select
                            value={bed.status}
                            onChange={(e) => handleUpdateBedStatus(bed.bed_id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="available">Available</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        )}
                        {bed.status !== 'occupied' && (
                          <button
                            onClick={() => handleDeleteBed(bed.bed_id, bed.bed_number)}
                            style={{
                              padding: '6px 12px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BedsTableSection;
