import { formatDate } from '../utils/WardHelpers';

function AssignmentHistoryTable({ inactiveAssignments }) {
  if (inactiveAssignments.length === 0) return null;

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📚</span>
        Assignment History
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Nurse</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Ward</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Start Date</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>End Date</th>
            </tr>
          </thead>
          <tbody>
            {inactiveAssignments.map(assignment => (
              <tr key={assignment.ward_nurse_id} style={{ borderBottom: '1px solid #f1f5f9', opacity: 0.6 }}>
                <td style={{ padding: '16px', fontWeight: '600', color: '#64748b' }}>{assignment.nurse_name}</td>
                <td style={{ padding: '16px', color: '#64748b' }}>{assignment.ward_name}</td>
                <td style={{ padding: '16px', color: '#64748b' }}>{formatDate(assignment.start_date)}</td>
                <td style={{ padding: '16px', color: '#64748b' }}>{formatDate(assignment.end_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentHistoryTable;
