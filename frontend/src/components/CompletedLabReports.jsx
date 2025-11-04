import { useState, useEffect } from 'react';
import { api } from '../api';
import LabReportModal from './LabReportModal';

function CompletedLabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await api.getCompletedLabReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load lab reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function viewReport(orderId) {
    try {
      const reportData = await api.getLabReportDetails(orderId);
      setSelectedReport(reportData);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load report details:', err);
      alert('Failed to load report details');
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #f3f4f6',
          borderTop: '6px solid #f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading lab reports...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '20px',
        border: '3px dashed #f59e0b'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🧪</div>
        <h3 style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '24px', fontWeight: '700' }}>
          No Lab Reports Yet
        </h3>
        <p style={{ margin: 0, color: '#b45309', fontSize: '16px' }}>
          Completed lab reports will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
          🧪 Completed Lab Reports
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          {reports.length} report{reports.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {reports.map((report) => (
          <div
            key={report.order_id}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.2)';
              e.currentTarget.style.borderColor = '#f59e0b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onClick={() => viewReport(report.order_id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px', flexWrap: 'wrap' }}>
              {/* Left Section - Patient Info */}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}>
                    {report.patient_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
                      {report.patient_name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      ID: #{report.patient_id} • {report.age}y • {report.gender}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🩺</span>
                    <span style={{ fontSize: '14px', color: '#475569' }}>
                      <strong>Doctor:</strong> Dr. {report.doctor_name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📋</span>
                    <span style={{ fontSize: '14px', color: '#475569' }}>
                      <strong>Order:</strong> #{report.order_id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🧪</span>
                    <span style={{ fontSize: '14px', color: '#475569' }}>
                      <strong>Tests:</strong> {report.test_count} test{report.test_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Dates & Action */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    marginBottom: '12px'
                  }}>
                    ✓ Completed
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                    <strong>Ordered:</strong> {new Date(report.order_date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    <strong>Completed:</strong> {new Date(report.completed_date).toLocaleDateString()}
                  </div>
                </div>

                <button
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    viewReport(report.order_id);
                  }}
                >
                  📄 View Details
                </button>
              </div>
            </div>

            {/* Clinical Notes */}
            {report.clinical_notes && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%)',
                borderRadius: '10px',
                borderLeft: '4px solid #f59e0b'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Clinical Notes:
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#78350f', fontStyle: 'italic' }}>
                  {report.clinical_notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedReport && (
        <LabReportModal
          report={selectedReport}
          onClose={() => {
            setShowModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}

export default CompletedLabReports;
