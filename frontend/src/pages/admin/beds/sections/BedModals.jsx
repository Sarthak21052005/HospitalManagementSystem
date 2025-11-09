function BedModals({
  showAddBedModal,
  showBulkAddModal,
  setShowAddBedModal,
  setShowBulkAddModal,
  wards,
  selectedWard,
  setSelectedWard,
  bedNumber,
  setBedNumber,
  bedPrefix,
  setBedPrefix,
  numBeds,
  setNumBeds,
  handleAddBed,
  handleBulkAddBeds
}) {
  return (
    <>
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
    </>
  );
}

export default BedModals;
