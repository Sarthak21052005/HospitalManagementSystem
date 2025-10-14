import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function InventoryManagement({ user, setUser }) {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '', item_category: 'Medicine', quantity_in_stock: '', reorder_level: '', unit_price: ''
  });
  const [msg, setMsg] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeNav, setActiveNav] = useState('inventory');

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.addInventoryItem(formData);
      setMsg('✅ Inventory item added successfully!');
      setShowForm(false);
      setFormData({ item_name: '', item_category: 'Medicine', quantity_in_stock: '', reorder_level: '', unit_price: '' });
      loadInventory();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Operation failed: ' + err.message);
    }
  }

  async function handleLogout() {
    console.log('🚪 Logout attempt from Inventory Management...');
    try {
      await api.logout();
      console.log('✅ Logout API successful');
    } catch (err) {
      console.error('❌ Logout API failed:', err);
    } finally {
      setUser(null);
      navigate('/');
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'staff', label: 'Staff', icon: '👥', path: '/staff' },
    { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
  ];

  const categories = ['All', 'Medicine', 'Injection', 'Surgical Equipment', 'PPE', 'Other'];
  
  const categoryIcons = {
    'Medicine': '💊',
    'Injection': '💉',
    'Surgical Equipment': '🔬',
    'PPE': '🧤',
    'Other': '📦'
  };

  // Calculate item status
  const getItemStatus = (item) => {
    if (item.quantity_in_stock === 0) return 'out_of_stock';
    if (item.quantity_in_stock <= item.reorder_level) return 'low_stock';
    return 'in_stock';
  };

  const filteredInventory = inventory.filter(item => {
    const status = getItemStatus(item);
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.item_category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.item_category === filterCategory;
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: inventory.length,
    inStock: inventory.filter(item => getItemStatus(item) === 'in_stock').length,
    lowStock: inventory.filter(item => getItemStatus(item) === 'low_stock').length,
    outOfStock: inventory.filter(item => getItemStatus(item) === 'out_of_stock').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity_in_stock * item.unit_price), 0)
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Enhanced Navigation Bar */}
      <nav style={{
        background: 'white',
        padding: '16px 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🏥
            </div>
            <span style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              HealthCare Pro
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                style={{
                  padding: '10px 20px',
                  background: activeNav === item.id ? '#EFF6FF' : 'transparent',
                  color: activeNav === item.id ? '#3B82F6' : '#64748B',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeNav !== item.id) e.target.style.background = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (activeNav !== item.id) e.target.style.background = 'transparent';
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.target.style.background = '#F8FAFC'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>▼</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '60px',
                right: 0,
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                minWidth: '200px',
                overflow: 'hidden',
                zIndex: 200
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#EF4444',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              opacity: 0.1,
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
              filter: 'blur(20px)'
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                Total Items
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981', marginBottom: '4px' }}>
              {stats.inStock}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              In Stock
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', marginBottom: '4px' }}>
              {stats.lowStock}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Low Stock
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444', marginBottom: '4px' }}>
              {stats.outOfStock}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Out of Stock
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              ₹{stats.totalValue.toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
              Total Inventory Value
            </div>
          </div>
        </div>

        {/* Header with Add Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#1E293B', 
              margin: '0 0 8px 0' 
            }}>
              Medical Inventory
            </h1>
            <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>
              Manage medical supplies and equipment
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)} 
            style={{ 
              padding: '14px 24px',
              background: showForm ? '#EF4444' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: showForm ? '0 8px 16px rgba(239, 68, 68, 0.3)' : '0 8px 16px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '18px' }}>{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Cancel' : 'Add Item'}</span>
          </button>
        </div>

        {/* Success/Error Message */}
        {msg && (
          <div style={{
            padding: '16px 20px',
            background: msg.includes('✅') ? '#DCFCE7' : '#FEE2E2',
            color: msg.includes('✅') ? '#16A34A' : '#DC2626',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '15px',
            fontWeight: '600',
            border: msg.includes('✅') ? '1px solid #BBF7D0' : '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <span style={{ fontSize: '20px' }}>{msg.includes('✅') ? '✅' : '⚠️'}</span>
            <span>{msg}</span>
          </div>
        )}

        {/* Add Item Form */}
        {showForm && (
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
        )}

        {/* Search and Filter Bar */}
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

        {/* Inventory Table */}
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
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ID
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Item Name
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Category
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'right',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Stock
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'right',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Reorder Level
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'right',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Unit Price
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'right',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Total Value
                  </th>
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'center',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => {
                  const status = getItemStatus(item);
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
                      <td style={{ 
                        padding: '18px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#F59E0B'
                      }}>
                        #{item.item_id}
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
                      <td style={{ 
                        padding: '18px 20px',
                        fontSize: '14px'
                      }}>
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
                      <td style={{ 
                        padding: '18px 20px',
                        textAlign: 'right',
                        fontSize: '15px',
                        fontWeight: '700',
                        color: status === 'out_of_stock' ? '#EF4444' : status === 'low_stock' ? '#F59E0B' : '#10B981'
                      }}>
                        {item.quantity_in_stock}
                      </td>
                      <td style={{ 
                        padding: '18px 20px',
                        textAlign: 'right',
                        fontSize: '14px',
                        color: '#64748B'
                      }}>
                        {item.reorder_level}
                      </td>
                      <td style={{ 
                        padding: '18px 20px',
                        textAlign: 'right',
                        fontSize: '14px',
                        color: '#64748B',
                        fontWeight: '600'
                      }}>
                        ₹{parseFloat(item.unit_price).toFixed(2)}
                      </td>
                      <td style={{ 
                        padding: '18px 20px',
                        textAlign: 'right',
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#3B82F6'
                      }}>
                        ₹{totalValue.toFixed(2)}
                      </td>
                      <td style={{ 
                        padding: '18px 20px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: '8px 16px',
                          background: status === 'out_of_stock' ? '#FEE2E2' : status === 'low_stock' ? '#FEF3C7' : '#DCFCE7',
                          color: status === 'out_of_stock' ? '#DC2626' : status === 'low_stock' ? '#92400E' : '#16A34A',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: status === 'out_of_stock' ? '1px solid #FECACA' : status === 'low_stock' ? '1px solid #FDE047' : '1px solid #BBF7D0'
                        }}>
                          <span>{status === 'out_of_stock' ? '❌' : status === 'low_stock' ? '⚠️' : '✅'}</span>
                          <span>
                            {status === 'out_of_stock' ? 'Out of Stock' : status === 'low_stock' ? 'Low Stock' : 'In Stock'}
                          </span>
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
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('All');
                    setFilterStatus('All');
                  }}
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

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE047 100%)',
            borderRadius: '16px',
            border: '2px solid #FBBF24',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '36px' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                Low Stock Alert
              </div>
              <div style={{ fontSize: '14px', color: '#78350F' }}>
                {stats.lowStock} item{stats.lowStock > 1 ? 's are' : ' is'} running low. Consider reordering soon.
              </div>
            </div>
            <button
              onClick={() => setFilterStatus('low_stock')}
              style={{
                padding: '10px 20px',
                background: '#92400E',
                color: '#FEF3C7',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#78350F'}
              onMouseLeave={(e) => e.target.style.background = '#92400E'}
            >
              View Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryManagement;