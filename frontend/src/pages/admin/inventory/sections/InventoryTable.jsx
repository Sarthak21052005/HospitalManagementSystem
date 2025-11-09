    import { getItemStatus, getStatusStyle, getStockColor, categoryIcons } from '../utils/InventoryHelpers';

function InventoryTable({ filteredInventory, inventory, searchQuery, filterCategory, filterStatus, clearFilters }) {
  return (
    <>
      <div style={{ 
        background: 'white', 
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {filteredInventory.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#94A3B8'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {searchQuery || filterCategory !== 'All' || filterStatus !== 'All' ? '🔍' : '📦'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748B' }}>
              {searchQuery || filterCategory !== 'All' || filterStatus !== 'All' ? 'No items found' : 'No inventory items yet'}
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchQuery || filterCategory !== 'All' || filterStatus !== 'All' ? 'Try adjusting your search or filters' : 'Click "Add Item" to add your first inventory item'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              <tr>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item Name</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reorder Level</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit Price</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Value</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => {
                const status = getItemStatus(item);
                const statusStyle = getStatusStyle(status);
                const totalValue = item.quantity_in_stock * item.unit_price;
                
                return (
                  <tr 
                    key={item.item_id}
                    style={{ 
                      borderBottom: index === filteredInventory.length - 1 ? 'none' : '1px solid #F1F5F9',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '18px 20px', fontSize: '14px', fontWeight: '600', color: '#F59E0B' }}>
                      #{item.item_id}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '15px', fontWeight: '600', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {categoryIcons[item.item_category] || '📦'}
                      </div>
                      <span>{item.item_name}</span>
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '14px' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: '#FEF3C7',
                        color: '#92400E',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {item.item_category}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'right', fontSize: '15px', fontWeight: '700', color: getStockColor(status) }}>
                      {item.quantity_in_stock}
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'right', fontSize: '14px', color: '#64748B' }}>
                      {item.reorder_level}
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'right', fontSize: '14px', color: '#64748B', fontWeight: '600' }}>
                      ₹{parseFloat(item.unit_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'right', fontSize: '15px', fontWeight: '700', color: '#3B82F6' }}>
                      ₹{totalValue.toFixed(2)}
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '8px 16px',
                        background: statusStyle.background,
                        color: statusStyle.color,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: statusStyle.border
                      }}>
                        <span>{statusStyle.icon}</span>
                        <span>{statusStyle.text}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      {filteredInventory.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px 24px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ color: '#64748B', fontSize: '14px' }}>
            Showing <span style={{ fontWeight: '700', color: '#1E293B' }}>{filteredInventory.length}</span> of <span style={{ fontWeight: '700', color: '#1E293B' }}>{inventory.length}</span> items
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              padding: '8px 16px',
              background: '#F1F5F9',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#475569'
            }}>
              💰 Filtered Value: ₹{filteredInventory.reduce((sum, item) => sum + (item.quantity_in_stock * item.unit_price), 0).toLocaleString()}
            </div>
            {(searchQuery || filterCategory !== 'All' || filterStatus !== 'All') && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '8px 16px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#64748B',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#E2E8F0';
                  e.target.style.color = '#475569';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#F1F5F9';
                  e.target.style.color = '#64748B';
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default InventoryTable;
