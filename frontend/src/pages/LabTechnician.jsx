import { useState, useEffect } from 'react';
import { api } from '../api';
import Navbar from '../components/shared/Navbar';

function LabTechnicianDashboard({ user, setUser }) {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completedToday: 0 });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await api.getPendingLabOrders();
      
      const pending = data.filter(o => o.status === 'PENDING');
      const inProgress = data.filter(o => o.status === 'IN_PROGRESS');
      
      setPendingOrders(pending);
      setInProgressOrders(inProgress);
      
      setStats({
        pending: pending.length,
        inProgress: inProgress.length,
        completedToday: 0
      });
    } catch (err) {
      console.error('Failed to load orders:', err);
      alert('Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  }

  async function claimOrder(orderId) {
    try {
      await api.updateLabOrderStatus(orderId, 'IN_PROGRESS');
      alert('✅ Order claimed successfully!');
      loadOrders();
    } catch (err) {
      console.error('Failed to claim order:', err);
      alert('Failed to claim order');
    }
  }

  async function viewOrderDetails(orderId) {
    try {
      const orderData = await api.getLabOrderDetails(orderId);
      console.log('📦 Received order data:', orderData); // Debug log
      setSelectedOrder(orderData);
      setShowResultModal(true);
    } catch (err) {
      console.error('Failed to load order details:', err);
      alert('Failed to load order details');
    }
  }

  function getUrgencyColor(urgency) {
    switch(urgency) {
      case 'STAT': return '#dc2626';
      case 'URGENT': return '#f59e0b';
      case 'ROUTINE': return '#10b981';
      default: return '#64748b';
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ textAlign: 'center', padding: '60px', flex: 1 }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '6px solid #f3f4f6',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading lab orders...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ flex: 1, padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
            🧪 Lab Technician Dashboard
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
            Welcome, {user.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <StatCard 
            icon="⏳" 
            title="Pending Orders" 
            value={stats.pending} 
            color="#f59e0b"
            bgColor="#fef3c7"
          />
          <StatCard 
            icon="🔬" 
            title="In Progress" 
            value={stats.inProgress} 
            color="#3b82f6"
            bgColor="#dbeafe"
          />
          <StatCard 
            icon="✅" 
            title="Completed Today" 
            value={stats.completedToday} 
            color="#10b981"
            bgColor="#d1fae5"
          />
        </div>

        {/* Pending Orders */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            ⏳ Pending Orders
          </h2>
          
          {pendingOrders.length === 0 ? (
            <div style={{ 
              background: 'white', 
              padding: '60px', 
              borderRadius: '16px', 
              textAlign: 'center',
              border: '2px dashed #e2e8f0'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontWeight: '600' }}>
                All Caught Up!
              </h3>
              <p style={{ margin: 0, color: '#94a3b8' }}>No pending lab orders at the moment</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {pendingOrders.map(order => (
                <OrderCard 
                  key={order.order_id}
                  order={order}
                  onClaim={() => claimOrder(order.order_id)}
                  onView={() => viewOrderDetails(order.order_id)}
                  getUrgencyColor={getUrgencyColor}
                  showClaimButton={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* In Progress Orders */}
        <div>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            🔬 In Progress
          </h2>
          
          {inProgressOrders.length === 0 ? (
            <div style={{ 
              background: 'white', 
              padding: '40px', 
              borderRadius: '16px', 
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ margin: 0, color: '#94a3b8' }}>No orders in progress</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {inProgressOrders.map(order => (
                <OrderCard 
                  key={order.order_id}
                  order={order}
                  onView={() => viewOrderDetails(order.order_id)}
                  getUrgencyColor={getUrgencyColor}
                  showClaimButton={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result Entry Modal */}
      {showResultModal && selectedOrder && (
        <ResultModal 
          order={selectedOrder}
          onClose={() => {
            setShowResultModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowResultModal(false);
            setSelectedOrder(null);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}

// ===== STAT CARD COMPONENT =====
function StatCard({ icon, title, value, color, bgColor }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          fontSize: '40px', 
          width: '64px', 
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          borderRadius: '12px'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>{title}</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// ===== ORDER CARD COMPONENT =====
function OrderCard({ order, onClaim, onView, getUrgencyColor, showClaimButton }) {
  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      border: `3px solid ${getUrgencyColor(order.urgency)}20`,
      borderLeft: `6px solid ${getUrgencyColor(order.urgency)}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
              {order.patient_name}
            </h3>
            <span style={{
              padding: '4px 12px',
              background: getUrgencyColor(order.urgency),
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {order.urgency}
            </span>
          </div>
          
          <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Patient Info:</strong> {order.age}y • {order.gender}
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Doctor:</strong> Dr. {order.doctor_name} ({order.specialization})
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Tests Ordered:</strong> {order.test_count} test(s)
            </p>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              <strong style={{ color: '#475569' }}>Ordered:</strong> {new Date(order.order_date).toLocaleString()}
            </p>
          </div>

          {order.clinical_notes && (
            <div style={{ 
              padding: '12px', 
              background: '#f0f9ff', 
              borderRadius: '8px',
              borderLeft: '3px solid #3b82f6'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                <strong>Clinical Notes:</strong> {order.clinical_notes}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {showClaimButton && (
            <button
              onClick={onClaim}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }}
            >
              🖐️ Claim Order
            </button>
          )}
          <button
            onClick={onView}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            {showClaimButton ? '📄 View Details' : '⚗️ Enter Results'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== RESULT ENTRY MODAL =====
function ResultModal({ order, onClose, onSuccess }) {
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // ✅ FIXED: Check if tests exist before initializing
    if (!order || !order.tests) {
      console.error('❌ Order or tests missing:', order);
      return;
    }

    // Initialize results state
    const initialResults = {};
    order.tests.forEach(test => {
      initialResults[test.test_id] = {
        resultValue: test.result_value || '',
        technicianNotes: test.technician_notes || ''
      };
    });
    setResults(initialResults);
  }, [order]);

  function updateResult(testId, field, value) {
    setResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value
      }
    }));
  }

  async function handleSubmit() {
    // Validation
    const allFilled = order.tests.every(test => results[test.test_id]?.resultValue?.trim());
    if (!allFilled) {
      alert('⚠️ Please enter results for all tests');
      return;
    }

    try {
      setSubmitting(true);
      
      // ✅ FIXED: Use correct field names and structure
      const formattedResults = order.tests.map(test => ({
        test_id: test.test_id,
        result_value: results[test.test_id].resultValue,
        technician_notes: results[test.test_id].technicianNotes || null
      }));

      console.log('📤 Submitting results for order:', order.order_id);
      
      // ✅ FIXED: Use order.order_id directly (not order.order.order_id)
      await api.submitLabResults(order.order_id, formattedResults);
      
      alert('✅ Lab results submitted successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error submitting results:', err);
      alert('❌ Failed to submit results: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ FIXED: Add safety check
  if (!order || !order.tests) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '28px', 
          borderBottom: '2px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                ⚗️ Enter Lab Results
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
                Patient: <strong>{order.patient_name}</strong> • {order.age}y • {order.gender}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '24px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tests List */}
        <div style={{ padding: '28px' }}>
          {order.tests.map((test, index) => (
            <div key={test.test_id} style={{
              padding: '24px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              marginBottom: index < order.tests.length - 1 ? '20px' : 0
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                  {test.test_name}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  {test.test_category} • Normal Range: {test.normal_range || 'N/A'} {test.unit || ''}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Result Value */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Result Value <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={results[test.test_id]?.resultValue || ''}
                    onChange={(e) => updateResult(test.test_id, 'resultValue', e.target.value)}
                    placeholder={`Enter result in ${test.unit || 'appropriate unit'}`}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Technician Notes
                  </label>
                  <textarea
                    value={results[test.test_id]?.technicianNotes || ''}
                    onChange={(e) => updateResult(test.test_id, 'technicianNotes', e.target.value)}
                    placeholder="Any observations or notes..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ 
          padding: '24px 28px', 
          borderTop: '2px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '14px 28px',
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '14px 32px',
              background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit Results'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabTechnicianDashboard;
