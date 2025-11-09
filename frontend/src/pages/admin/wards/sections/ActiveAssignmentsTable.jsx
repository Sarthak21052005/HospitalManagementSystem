import { formatDate } from '../utils/WardHelpers';

function ActiveAssignmentsTable({ activeAssignments, openReassignModal, handleUnassignWard }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>✅</span>
        Active Ward Assignments
      </h2>

      {activeAssignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Active Assignments</p>
          <p>Assign nurses to wards to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Nurse</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Ward</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Start Date</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAssignments.map(assignment => (
                <tr key={assignment.ward_nurse_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{assignment.nurse_name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{assignment.nurse_email}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{assignment.nurse_contact}</td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>{assignment.ward_name}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#eff6ff',
                      color: '#3b82f6',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {assignment.ward_category}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{assignment.ward_location}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{formatDate(assignment.start_date)}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openReassignModal(assignment)}
                        style={{
                          padding: '8px 16px',
                          background: '#eff6ff',
                          color: '#3b82f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#dbeafe'}
                        onMouseLeave={(e) => e.target.style.background = '#eff6ff'}
                      >
                        🔄 Reassign
                      </button>
                      <button
                        onClick={() => handleUnassignWard(assignment.ward_nurse_id)}
                        style={{
                          padding: '8px 16px',
                          background: '#fef2f2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                        onMouseLeave={(e) => e.target.style.background = '#fef2f2'}
                      >
                        ❌ Unassign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ActiveAssignmentsTable;
