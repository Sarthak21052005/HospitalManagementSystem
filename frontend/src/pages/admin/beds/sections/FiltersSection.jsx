function FiltersSection({ 
  wards, 
  filterWard, 
  filterStatus, 
  setFilterWard, 
  setFilterStatus,
  clearFilters 
}) {
  return (
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
          onClick={clearFilters}
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
  );
}

export default FiltersSection;
