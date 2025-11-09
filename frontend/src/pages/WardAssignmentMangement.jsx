import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/shared/Navbar';

function WardAssignmentManagement({ user, setUser }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newWard, setNewWard] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading ward assignments data...');
      
      // Load all data in parallel
      const [assignmentsData, nursesData, wardsData] = await Promise.all([
        api.getWardAssignments(),
        api.getAvailableNurses(),
        api.getWardsList()
      ]);
      
      console.log('✅ Assignments loaded:', assignmentsData);
      console.log('✅ Nurses loaded:', nursesData);
      console.log('✅ Wards loaded:', wardsData);
      
      setAssignments(assignmentsData);
      setNurses(nursesData);
      setWards(wardsData);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load ward assignment data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignWard() {
    if (!selectedNurse || !selectedWard) {
      setError('Please select both a nurse and a ward');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Assigning nurse ${selectedNurse} to ward ${selectedWard}...`);
      
      await api.assignNurseToWard(parseInt(selectedNurse), parseInt(selectedWard));
      
      setSuccess('Ward assigned successfully!');
      setShowAssignModal(false);
      setSelectedNurse('');
      setSelectedWard('');
      
      // Reload data
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error assigning ward:', err);
      setError(err.message || 'Failed to assign ward');
    }
  }

  async function handleUnassignWard(assignmentId) {
    if (!confirm('Are you sure you want to unassign this nurse from the ward?')) {
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Unassigning ward assignment ${assignmentId}...`);
      
      await api.unassignNurseFromWard(assignmentId);
      
      setSuccess('Ward unassigned successfully!');
      
      // Reload data
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error unassigning ward:', err);
      setError(err.message || 'Failed to unassign ward');
    }
  }

  async function handleReassignWard() {
    if (!selectedAssignment || !newWard) {
      setError('Please select a new ward');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Reassigning assignment ${selectedAssignment.ward_nurse_id} to ward ${newWard}...`);
      
      await api.reassignNurseToWard(selectedAssignment.ward_nurse_id, parseInt(newWard));
      
      setSuccess('Ward reassigned successfully!');
      setShowReassignModal(false);
      setSelectedAssignment(null);
      setNewWard('');
      
      // Reload data
      await loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error reassigning ward:', err);
      setError(err.message || 'Failed to reassign ward');
    }
  }

  function openReassignModal(assignment) {
    setSelectedAssignment(assignment);
    setNewWard('');
    setShowReassignModal(true);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading ward assignments...</p>
        </div>
      </div>
    );
  }

  const activeAssignments = assignments.filter(a => a.status === 'active');
  const inactiveAssignments = assignments.filter(a => a.status === 'inactive');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              🏥 Ward Assignment Management
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Manage nurse-ward assignments and track bed availability
            </p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            + Assign Nurse to Ward
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>❌</span>
            <span style={{ color: '#dc2626', fontWeight: '600' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#dc2626'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div style={{
            padding: '16px 20px',
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#16a34a'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '24px',
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{nurses.length}</div>
            <div style={{ opacity: 0.9 }}>Total Nurses</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '24px',
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏥</div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{wards.length}</div>
            <div style={{ opacity: 0.9 }}>Total Wards</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            padding: '24px',
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{activeAssignments.length}</div>
            <div style={{ opacity: 0.9 }}>Active Assignments</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '24px',
            borderRadius: '16px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛏️</div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {wards.reduce((sum, w) => sum + (w.bed_capacity || 0), 0)}
            </div>
            <div style={{ opacity: 0.9 }}>Total Beds</div>
          </div>
        </div>

        {/* Active Assignments */}
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
                      <td style={{ padding: '16px', color: '#64748b' }}>{new Date(assignment.start_date).toLocaleDateString()}</td>
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

        {/* Inactive Assignments History */}
        {inactiveAssignments.length > 0 && (
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
                      <td style={{ padding: '16px', color: '#64748b' }}>{new Date(assignment.start_date).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{new Date(assignment.end_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assign Ward Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowAssignModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '500px',
            maxWidth: '90%',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Assign Nurse to Ward</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Select a nurse and ward to create new assignment
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                  Select Nurse <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={selectedNurse}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Select Nurse --</option>
                  {nurses.map(nurse => (
                    <option key={nurse.nurse_id} value={nurse.nurse_id}>
                      {nurse.name} ({nurse.current_assignments || 0} current assignments)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                  Select Ward <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Select Ward --</option>
                  {wards.map(ward => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.name} - {ward.category} ({ward.assigned_nurses || 0} nurses, {ward.bed_capacity || 0} beds)
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignWard}
                  disabled={!selectedNurse || !selectedWard}
                  style={{
                    padding: '12px 24px',
                    background: selectedNurse && selectedWard ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: selectedNurse && selectedWard ? 'pointer' : 'not-allowed'
                  }}
                >
                  ✓ Assign Ward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Ward Modal */}
      {showReassignModal && selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowReassignModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '500px',
            maxWidth: '90%',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Reassign to New Ward</h3>
                <button
                  onClick={() => setShowReassignModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                {selectedAssignment.nurse_name} → New Ward
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}>Current Ward</p>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>
                  {selectedAssignment.ward_name} - {selectedAssignment.ward_category}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                  Select New Ward <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={newWard}
                  onChange={(e) => setNewWard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Select New Ward --</option>
                  {wards.filter(w => w.ward_id !== selectedAssignment.ward_id).map(ward => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.name} - {ward.category} ({ward.assigned_nurses || 0} nurses, {ward.bed_capacity || 0} beds)
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowReassignModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassignWard}
                  disabled={!newWard}
                  style={{
                    padding: '12px 24px',
                    background: newWard ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newWard ? 'pointer' : 'not-allowed'
                  }}
                >
                  ✓ Reassign Ward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WardAssignmentManagement;
