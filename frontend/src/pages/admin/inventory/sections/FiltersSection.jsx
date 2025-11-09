import { categories, categoryIcons } from '../utils/InventoryHelpers';

function FiltersSection({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus
}) {
  return (
    <div style={{
      background: 'white',
      padding: '20px 24px',
      borderRadius: '16px 16px 0 0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #E2E8F0',
      borderBottom: 'none'
    }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#94A3B8'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '2px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '15px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ 
            padding: '10px 12px', 
            fontSize: '13px', 
            fontWeight: '600', 
            color: '#64748B',
            display: 'flex',
            alignItems: 'center'
          }}>
            Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '8px 16px',
                background: filterCategory === cat ? '#F59E0B' : 'white',
                color: filterCategory === cat ? 'white' : '#64748B',
                border: filterCategory === cat ? 'none' : '1px solid #E2E8F0',
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
                if (filterCategory !== cat) e.target.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (filterCategory !== cat) e.target.style.background = 'white';
              }}
            >
              {cat !== 'All' && <span>{categoryIcons[cat]}</span>}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <span style={{ 
            padding: '10px 12px', 
            fontSize: '13px', 
            fontWeight: '600', 
            color: '#64748B',
            display: 'flex',
            alignItems: 'center'
          }}>
            Status:
          </span>
          {['All', 'in_stock', 'low_stock', 'out_of_stock'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                background: filterStatus === status 
                  ? status === 'in_stock' ? '#10B981' 
                    : status === 'low_stock' ? '#F59E0B' 
                    : status === 'out_of_stock' ? '#EF4444' 
                    : '#3B82F6'
                  : 'white',
                color: filterStatus === status ? 'white' : '#64748B',
                border: filterStatus === status ? 'none' : '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (filterStatus !== status) e.target.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== status) e.target.style.background = 'white';
              }}
            >
              {status === 'All' ? 'All' : status === 'in_stock' ? '✅ In Stock' : status === 'low_stock' ? '⚠️ Low' : '❌ Out'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FiltersSection;
