import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api';

function StaffManagement({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', specialization: '', contact: '', working_hours: '9AM-5PM'
  });
  const [msg, setMsg] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('staff');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      if (activeTab === 'doctors') {
        const data = await api.getDoctors();
        setDoctors(data);
      } else {
        const data = await api.getNurses();
        setNurses(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (activeTab === 'doctors') {
        if (editingId) {
          await api.updateDoctor(editingId, formData);
          setMsg('✅ Doctor updated successfully!');
        } else {
          await api.addDoctor(formData);
          setMsg('✅ Doctor added successfully!');
        }
      } else {
        if (editingId) {
          await api.updateNurse(editingId, formData);
          setMsg('✅ Nurse updated successfully!');
        } else {
          await api.addNurse(formData);
          setMsg('✅ Nurse added successfully!');
        }
      }
      resetForm();
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Operation failed: ' + err.message);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ email: '', password: '', name: '', specialization: '', contact: '', working_hours: '9AM-5PM' });
  }

  function handleEdit(item) {
    setEditingId(activeTab === 'doctors' ? item.doctor_id : item.nurse_id);
    setFormData({
      email: item.email,
      password: '',
      name: item.name,
      specialization: item.specialization || '',
      contact: item.contact,
      working_hours: item.working_hours || '9AM-5PM'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      if (activeTab === 'doctors') {
        await api.deleteDoctor(id);
        setMsg('✅ Doctor deleted successfully!');
      } else {
        await api.deleteNurse(id);
        setMsg('✅ Nurse deleted successfully!');
      }
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Delete failed: ' + err.message);
    }
  }

  async function handleLogout() {
    console.log('🚪 Logout attempt from Staff Management...');
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

  const currentData = activeTab === 'doctors' ? doctors : nurses;
  const filteredData = currentData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.specialization && item.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        {/* Header Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '32px' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#1E293B', 
              margin: '0 0 8px 0' 
            }}>
              Staff Management
            </h1>
            <p style={{ color: '#64748B', margin: 0, fontSize: '16px' }}>
              Manage doctors and nurses in your hospital
            </p>
          </div>
          
          <button 
            onClick={() => { resetForm(); setShowForm(!showForm); }} 
            style={{ 
              padding: '14px 24px',
              background: showForm ? '#EF4444' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: showForm ? '0 8px 16px rgba(239, 68, 68, 0.3)' : '0 8px 16px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '18px' }}>{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Cancel' : `Add ${activeTab === 'doctors' ? 'Doctor' : 'Nurse'}`}</span>
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

        {/* Tab Selection with Stats */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button 
            onClick={() => { setActiveTab('doctors'); setSearchQuery(''); }} 
            style={{ 
              padding: '24px',
              border: activeTab === 'doctors' ? '2px solid #10B981' : '2px solid #E2E8F0',
              background: activeTab === 'doctors' ? '#ECFDF5' : 'white',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'doctors' ? '0 8px 16px rgba(16, 185, 129, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'doctors') {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'doctors') {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
              <div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: activeTab === 'doctors' ? '#10B981' : '#1E293B'
                }}>
                  Doctors
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: activeTab === 'doctors' ? '#10B981' : '#64748B'
                }}>
                  {doctors.length}
                </div>
              </div>
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#64748B',
              fontWeight: '500'
            }}>
              Medical professionals
            </div>
          </button>

          <button 
            onClick={() => { setActiveTab('nurses'); setSearchQuery(''); }} 
            style={{ 
              padding: '24px',
              border: activeTab === 'nurses' ? '2px solid #8B5CF6' : '2px solid #E2E8F0',
              background: activeTab === 'nurses' ? '#F3E8FF' : 'white',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'nurses' ? '0 8px 16px rgba(139, 92, 246, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'nurses') {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'nurses') {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>👩‍⚕️</span>
              <div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: activeTab === 'nurses' ? '#8B5CF6' : '#1E293B'
                }}>
                  Nurses
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: activeTab === 'nurses' ? '#8B5CF6' : '#64748B'
                }}>
                  {nurses.length}
                </div>
              </div>
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#64748B',
              fontWeight: '500'
            }}>
              Healthcare support staff
            </div>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '32px',
            border: '2px solid ' + (activeTab === 'doctors' ? '#10B981' : '#8B5CF6')
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
                    onFocus={(e) => !editingId && (e.target.style.borderColor = activeTab === 'doctors' ? '#10B981' : '#8B5CF6')}
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
                      onFocus={(e) => e.target.style.borderColor = activeTab === 'doctors' ? '#10B981' : '#8B5CF6'}
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
                    onFocus={(e) => e.target.style.borderColor = activeTab === 'doctors' ? '#10B981' : '#8B5CF6'}
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
                      onFocus={(e) => e.target.style.borderColor = '#10B981'}
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
                    onFocus={(e) => e.target.style.borderColor = activeTab === 'doctors' ? '#10B981' : '#8B5CF6'}
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
                      onFocus={(e) => e.target.style.borderColor = '#10B981'}
                      onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                style={{ 
                  padding: '14px 32px',
                  background: activeTab === 'doctors' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: activeTab === 'doctors' ? '0 8px 16px rgba(16, 185, 129, 0.3)' : '0 8px 16px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = activeTab === 'doctors' ? '0 12px 24px rgba(16, 185, 129, 0.4)' : '0 12px 24px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = activeTab === 'doctors' ? '0 8px 16px rgba(16, 185, 129, 0.3)' : '0 8px 16px rgba(139, 92, 246, 0.3)';
                }}
              >
                {editingId ? '💾 Update' : '✨ Add'} {activeTab === 'doctors' ? 'Doctor' : 'Nurse'}
              </button>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ 
          background: 'white',
          padding: '20px 24px',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          borderBottom: 'none'
        }}>
          <div style={{ position: 'relative' }}>
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
              placeholder={`Search ${activeTab}...`}
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
              onFocus={(e) => e.target.style.borderColor = activeTab === 'doctors' ? '#10B981' : '#8B5CF6'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
        </div>

        {/* Staff Table */}
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
                    Name
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
                    Email
                  </th>
                  {activeTab === 'doctors' && (
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#475569',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Specialization
                    </th>
                  )}
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Contact
                  </th>
                  {activeTab === 'doctors' && (
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#475569',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Hours
                    </th>
                  )}
                  <th style={{ 
                    padding: '16px 20px', 
                    textAlign: 'center',
                    fontWeight: '700',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr 
                    key={activeTab === 'doctors' ? item.doctor_id : item.nurse_id} 
                    style={{ 
                      borderBottom: index === filteredData.length - 1 ? 'none' : '1px solid #F1F5F9',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748B'
                    }}>
                      #{activeTab === 'doctors' ? item.doctor_id : item.nurse_id}
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
                        background: activeTab === 'doctors' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
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
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      color: '#64748B'
                    }}>
                      {item.email}
                    </td>
                    {activeTab === 'doctors' && (
                      <td style={{ 
                        padding: '18px 20px',
                        fontSize: '14px'
                      }}>
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
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      color: '#64748B'
                    }}>
                      📞 {item.contact}
                    </td>
                    {activeTab === 'doctors' && (
                      <td style={{ 
                        padding: '18px 20px',
                        fontSize: '14px',
                        color: '#64748B'
                      }}>
                        🕐 {item.working_hours}
                      </td>
                    )}
                    <td style={{ 
                      padding: '18px 20px',
                      textAlign: 'center'
                    }}>
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
                          onClick={() => handleDelete(activeTab === 'doctors' ? item.doctor_id : item.nurse_id)} 
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
      </div>
    </div>
  );
}

export default StaffManagement;