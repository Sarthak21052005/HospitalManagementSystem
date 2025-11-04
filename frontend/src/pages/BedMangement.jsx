
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';

function BedManagement({ user, setUser }) {
  const navigate = useNavigate();
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [bedPrefix, setBedPrefix] = useState('');
  const [numBeds, setNumBeds] = useState(1);
  
  // Filter state
  const [filterWard, setFilterWard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading bed management data...');
      
      const [wardsData, bedsData] = await Promise.all([
        api.getWardsWithBedStats(),
        api.getBeds()
      ]);
      
      console.log('✅ Wards loaded:', wardsData);
      console.log('✅ Beds loaded:', bedsData);
      
      setWards(wardsData);
      setBeds(bedsData);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load bed management data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBed() {
    if (!selectedWard || !bedNumber) {
      setError('Please select a ward and enter a bed number');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Adding bed ${bedNumber} to ward ${selectedWard}...`);
      
      await api.addBed(parseInt(selectedWard), bedNumber);
      
      setSuccess('Bed added successfully!');
      setShowAddBedModal(false);
      setSelectedWard('');
      setBedNumber('');
      
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error adding bed:', err);
      setError(err.message || 'Failed to add bed');
    }
  }

  async function handleBulkAddBeds() {
    if (!selectedWard || !bedPrefix || numBeds < 1) {
      setError('Please fill all fields correctly');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Bulk adding ${numBeds} beds to ward ${selectedWard}...`);
      
      await api.bulkAddBeds(parseInt(selectedWard), bedPrefix, parseInt(numBeds));
      
      setSuccess(`Successfully added ${numBeds} beds!`);
      setShowBulkAddModal(false);
      setSelectedWard('');
      setBedPrefix('');
      setNumBeds(1);
      
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error bulk adding beds:', err);
      setError(err.message || 'Failed to add beds');
    }
  }

  async function handleUpdateBedStatus(bedId, newStatus) {
    try {
      setError(null);
      console.log(`🔄 Updating bed ${bedId} status to ${newStatus}...`);
      
      await api.updateBedStatus(bedId, newStatus);
      
      setSuccess('Bed status updated successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error updating bed status:', err);
      setError(err.message || 'Failed to update bed status');
    }
  }

  async function handleDeleteBed(bedId, bedNumber) {
    if (!confirm(`Are you sure you want to delete bed ${bedNumber}?`)) {
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Deleting bed ${bedId}...`);
      
      await api.deleteBed(bedId);
      
      setSuccess('Bed deleted successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error deleting bed:', err);
      setError(err.message || 'Failed to delete bed');
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return { bg: '#dcfce7', color: '#16a34a' };
      case 'occupied': return { bg: '#fee2e2', color: '#dc2626' };
      case 'maintenance': return { bg: '#fef3c7', color: '#d97706' };
      case 'reserved': return { bg: '#dbeafe', color: '#2563eb' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const filteredBeds = beds.filter(bed => {
    if (filterWard && bed.ward_id !== parseInt(filterWard)) return false;
    if (filterStatus && bed.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading bed management...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              🛏️ Bed Management
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Manage hospital beds and ward capacities
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddBedModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              + Add Single Bed
            </button>
            <button
              onClick={() => setShowBulkAddModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              + Bulk Add Beds
            </button>
          </div>
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

        {/* Ward Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {wards.map(ward => {
            const utilization = ward.bed_capacity > 0 
              ? Math.round((ward.current_beds / ward.bed_capacity) * 100) 
              : 0;
            
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
                    background: utilization >= 90 ? '#fee2e2' : '#dcfce7',
                    color: utilization >= 90 ? '#dc2626' : '#16a34a',
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
                      background: utilization >= 90 
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                        : 'linear-gradient(90deg, #10b981, #059669)',
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

        {/* Filters */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#64748b' }}>Filters:</span>
          
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <option value="">All Wards</option>
            {wards.map(ward => (
              <option key={ward.ward_id} value={ward.ward_id}>
                {ward.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>

          {(filterWard || filterStatus) && (
            <button
              onClick={() => {
                setFilterWard('');
                setFilterStatus('');
              }}
              style={{
                padding: '10px 20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Beds Table */}
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
      </div>

      {/* Add Single Bed Modal */}
      {showAddBedModal && (
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
        }} onClick={() => setShowAddBedModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '500px',
            maxWidth: '90%',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Add Single Bed</h3>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Add a new bed to a ward
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
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
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Select Ward --</option>
                  {wards.map(ward => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.name} ({ward.current_beds}/{ward.bed_capacity} beds)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                  Bed Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  placeholder="e.g., G-001, ICU-005"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddBedModal(false)}
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
                  onClick={handleAddBed}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Add Bed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Beds Modal */}
      {showBulkAddModal && (
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
        }} onClick={() => setShowBulkAddModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '500px',
            maxWidth: '90%',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Bulk Add Beds</h3>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Add multiple beds at once with auto-numbering
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
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
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Select Ward --</option>
                  {wards.map(ward => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.name} ({ward.bed_capacity - ward.current_beds} available slots)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                  Bed Prefix <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={bedPrefix}
                  onChange={(e) => setBedPrefix(e.target.value)}
                  placeholder="e.g., G-, ICU-, P-"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Example: G- will create G-001, G-002, etc.
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>
                  Number of Beds <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  value={numBeds}
                  onChange={(e) => setNumBeds(e.target.value)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowBulkAddModal(false)}
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
                  onClick={handleBulkAddBeds}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Add {numBeds} Beds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BedManagement;
