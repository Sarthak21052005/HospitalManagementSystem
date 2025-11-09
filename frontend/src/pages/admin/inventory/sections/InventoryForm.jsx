function InventoryForm({ formData, setFormData, handleSubmit, setShowForm }) {
  return (
    <div style={{
      background: 'white',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '32px',
      border: '2px solid #F59E0B'
    }}>
      <h3 style={{ 
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '24px',
        color: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>📦</span>
        <span>Add Inventory Item</span>
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Item Name *
            </label>
            <input 
              type="text" 
              value={formData.item_name} 
              onChange={(e) => setFormData({...formData, item_name: e.target.value})} 
              required 
              placeholder="Enter item name"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
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

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Category *
            </label>
            <select 
              value={formData.item_category} 
              onChange={(e) => setFormData({...formData, item_category: e.target.value})} 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #E2E8F0', 
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            >
              <option>Medicine</option>
              <option>Injection</option>
              <option>Surgical Equipment</option>
              <option>PPE</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Quantity in Stock *
            </label>
            <input 
              type="number" 
              value={formData.quantity_in_stock} 
              onChange={(e) => setFormData({...formData, quantity_in_stock: e.target.value})} 
              required 
              min="0"
              placeholder="0"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
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

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Reorder Level *
            </label>
            <input 
              type="number" 
              value={formData.reorder_level} 
              onChange={(e) => setFormData({...formData, reorder_level: e.target.value})} 
              required 
              min="0"
              placeholder="Minimum stock alert level"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
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

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Unit Price (₹) *
            </label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.unit_price} 
              onChange={(e) => setFormData({...formData, unit_price: e.target.value})} 
              required 
              min="0"
              placeholder="0.00"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
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

        <button 
          type="submit" 
          style={{ 
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.3)';
          }}
        >
          ✨ Add to Inventory
        </button>
      </form>
    </div>
  );
}

export default InventoryForm;
