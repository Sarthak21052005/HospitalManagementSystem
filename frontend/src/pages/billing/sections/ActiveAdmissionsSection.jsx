// src/pages/billing/sections/ActiveAdmissionsSection.jsx

import { formatDate, calculateDays } from '../utils/Billinghelpers';

function ActiveAdmissionsSection({ activeAdmissions, onGenerateBill }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
        🏥 Ready for Discharge ({activeAdmissions.length})
      </h2>
      
      {activeAdmissions.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '60px', 
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontWeight: '600' }}>All Clear!</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>No active admissions pending discharge</p>
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Age/Gender</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Ward</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Bed</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Doctor</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Admitted</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Days</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeAdmissions.map((admission, idx) => (
                <tr 
                  key={admission.admission_id || idx}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        {admission.patient_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {admission.patient_name}
                          {admission.is_serious_case && (
                            <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          ID: {admission.patient_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    {admission.age}y • {admission.gender}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{admission.ward_name}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Bed {admission.bed_number}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    Dr. {admission.doctor_name}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    {formatDate(admission.admission_date)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {admission.days_admitted} days
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => onGenerateBill(admission)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      💰 Generate Bill
                    </button>
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

export default ActiveAdmissionsSection;