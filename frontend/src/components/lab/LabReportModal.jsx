function LabReportModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          animation: 'slideIn 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '32px',
            borderRadius: '24px 24px 0 0',
            color: 'white',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              fontSize: '28px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              fontWeight: '300'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                backdropFilter: 'blur(10px)'
              }}
            >
              🧪
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                Lab Report Details
              </h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                Order #{report.order_id}
              </p>
            </div>
          </div>

          {/* Patient Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Patient</div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{report.patient_name}</div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Age / Gender</div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>
                {report.patient_age}y • {report.patient_gender}
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Doctor</div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>Dr. {report.doctor_name}</div>
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        {report.clinical_notes && (
          <div style={{ padding: '24px 32px', background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>📋</span>
              <strong style={{ fontSize: '14px', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Clinical Notes
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6', fontStyle: 'italic' }}>
              {report.clinical_notes}
            </p>
          </div>
        )}

        {/* Test Results */}
        <div style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
            🧬 Test Results ({report.tests?.length || 0})
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {report.tests && report.tests.length > 0 ? (
              report.tests.map((test, index) => {
                const isAbnormal = test.is_abnormal;
                return (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      background: isAbnormal
                        ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      border: `2px solid ${isAbnormal ? '#fca5a5' : '#86efac'}`,
                      borderRadius: '12px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isAbnormal && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#dc2626',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        ⚠️ Abnormal
                      </div>
                    )}

                    <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                      {test.test_name}
                    </h4>

                    <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#475569' }}>
                        <strong>Category:</strong> {test.test_category}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#475569' }}>Result:</strong>
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '20px',
                              fontWeight: '700',
                              color: isAbnormal ? '#dc2626' : '#059669'
                            }}
                          >
                            {test.result_value} {test.unit}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          Normal Range: <strong>{test.normal_range || 'N/A'}</strong>
                        </div>
                      </div>
                    </div>

                    {test.technician_notes && (
                      <div
                        style={{
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${isAbnormal ? '#dc2626' : '#059669'}`
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                          Technician Notes:
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                          {test.technician_notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No test results available
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '24px 32px',
            borderTop: '2px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderRadius: '0 0 24px 24px'
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <strong>Completed:</strong> {new Date(report.completed_date).toLocaleString()}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabReportModal;
