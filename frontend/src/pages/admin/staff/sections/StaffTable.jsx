import { getStaffId } from '../utils/StaffHelpers';

function StaffTable({ 
  activeTab, 
  filteredData, 
  currentData, 
  searchQuery,
  handleEdit, 
  handleDelete 
}) {
  const gradient = activeTab === 'doctors' 
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';

  return (
    <>
      <div style={{ 
        background: 'white', 
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {filteredData.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#94A3B8'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {searchQuery ? '🔍' : '📋'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748B' }}>
              {searchQuery ? 'No results found' : `No ${activeTab} added yet`}
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchQuery ? 'Try a different search term' : `Click "Add ${activeTab === 'doctors' ? 'Doctor' : 'Nurse'}" to get started`}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              <tr>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ID
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Name
                </th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email
                </th>
                {activeTab === 'doctors' && (
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Specialization
                  </th>
                )}
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contact
                </th>
                {activeTab === 'doctors' && (
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Hours
                  </th>
                )}
                <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={getStaffId(item, activeTab)} 
                  style={{ 
                    borderBottom: index === filteredData.length - 1 ? 'none' : '1px solid #F1F5F9',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '18px 20px', fontSize: '14px', fontWeight: '600', color: '#64748B' }}>
                    #{getStaffId(item, activeTab)}
                  </td>
                  <td style={{ 
                    padding: '18px 20px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: gradient,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{item.name}</span>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: '14px', color: '#64748B' }}>
                    {item.email}
                  </td>
                  {activeTab === 'doctors' && (
                    <td style={{ padding: '18px 20px', fontSize: '14px' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: '#DCFCE7',
                        color: '#16A34A',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {item.specialization}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '18px 20px', fontSize: '14px', color: '#64748B' }}>
                    📞 {item.contact}
                  </td>
                  {activeTab === 'doctors' && (
                    <td style={{ padding: '18px 20px', fontSize: '14px', color: '#64748B' }}>
                      🕐 {item.working_hours}
                    </td>
                  )}
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEdit(item)} 
                        style={{ 
                          padding: '8px 16px',
                          background: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2563EB';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#3B82F6';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(getStaffId(item, activeTab))} 
                        style={{ 
                          padding: '8px 16px',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#DC2626';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#EF4444';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      {filteredData.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px 24px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: '#64748B', fontSize: '14px' }}>
            Showing <span style={{ fontWeight: '700', color: '#1E293B' }}>{filteredData.length}</span> of <span style={{ fontWeight: '700', color: '#1E293B' }}>{currentData.length}</span> {activeTab}
          </div>
          {searchQuery && (
            <div style={{
              padding: '6px 12px',
              background: '#F1F5F9',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#64748B',
              fontWeight: '600'
            }}>
              🔍 Search: "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default StaffTable;
