function WardModals({
  showAssignModal,
  showReassignModal,
  setShowAssignModal,
  setShowReassignModal,
  selectedNurse,
  setSelectedNurse,
  selectedWard,
  setSelectedWard,
  selectedAssignment,
  newWard,
  setNewWard,
  nurses,
  wards,
  handleAssignWard,
  handleReassignWard
}) {
  return (
    <>
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
    </>
  );
}

export default WardModals;
