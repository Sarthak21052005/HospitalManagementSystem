function StaffForm({ activeTab, editingId, formData, setFormData, handleSubmit, setShowForm }) {
  const primaryColor = activeTab === 'doctors' ? '#10B981' : '#8B5CF6';
  const gradient = activeTab === 'doctors' 
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
  const shadow = activeTab === 'doctors'
    ? '0 8px 16px rgba(16, 185, 129, 0.3)'
    : '0 8px 16px rgba(139, 92, 246, 0.3)';

  return (
    <div style={{
      background: 'white',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '32px',
      border: `2px solid ${primaryColor}`
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
        <span>{editingId ? '✏️' : '➕'}</span>
        <span>{editingId ? 'Edit' : 'Add New'} {activeTab === 'doctors' ? 'Doctor' : 'Nurse'}</span>
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
              Email Address *
            </label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
              disabled={!!editingId}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #E2E8F0', 
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                background: editingId ? '#F8FAFC' : 'white',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => !editingId && (e.target.style.borderColor = primaryColor)}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {!editingId && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#1E293B',
                fontSize: '14px'
              }}>
                Password *
              </label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #E2E8F0', 
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          )}

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Full Name *
            </label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #E2E8F0', 
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {activeTab === 'doctors' && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#1E293B',
                fontSize: '14px'
              }}>
                Specialization *
              </label>
              <input 
                type="text" 
                value={formData.specialization} 
                onChange={(e) => setFormData({...formData, specialization: e.target.value})} 
                required 
                placeholder="e.g., Cardiology, Pediatrics"
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #E2E8F0', 
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          )}

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1E293B',
              fontSize: '14px'
            }}>
              Contact Number *
            </label>
            <input 
              type="text" 
              value={formData.contact} 
              onChange={(e) => setFormData({...formData, contact: e.target.value})} 
              required 
              placeholder="+1 234 567 8900"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #E2E8F0', 
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {activeTab === 'doctors' && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#1E293B',
                fontSize: '14px'
              }}>
                Working Hours
              </label>
              <input 
                type="text" 
                value={formData.working_hours} 
                onChange={(e) => setFormData({...formData, working_hours: e.target.value})} 
                placeholder="9AM-5PM"
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #E2E8F0', 
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = primaryColor}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '14px 32px',
            background: gradient,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: shadow,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {editingId ? '💾 Update' : '✨ Add'} {activeTab === 'doctors' ? 'Doctor' : 'Nurse'}
        </button>
      </form>
    </div>
  );
}

export default StaffForm;
