import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function ReceptionPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', contact: '', address: '',
    emergency_contact: '', blood_type: '', is_serious_case: false, serious_case_notes: ''
  });
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('All');

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const data = await api.getReceptionPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.registerPatient(formData);
      setMsg('✅ Patient registered successfully!');
      setShowForm(false);
      setFormData({ 
        name: '', age: '', gender: 'Male', contact: '', address: '', 
        emergency_contact: '', blood_type: '', is_serious_case: false, serious_case_notes: '' 
      });
      loadPatients();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Registration failed: ' + err.message);
    }
  }

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.contact.includes(searchQuery) ||
                         p.patient_id.toString().includes(searchQuery);
    const matchesGender = filterGender === 'All' || p.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  const stats = {
    total: patients.length,
    male: patients.filter(p => p.gender === 'Male').length,
    female: patients.filter(p => p.gender === 'Female').length,
    other: patients.filter(p => p.gender === 'Other').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Enhanced Navigation Bar */}
      <nav style={{
        background: 'white',
        padding: '20px 32px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏥
            </div>
            <div>
              <h2 style={{ 
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Reception Desk
              </h2>
              <p style={{ 
                margin: 0,
                fontSize: '13px',
                color: '#64748B'
              }}>
                Patient Registration & Management
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/')} 
            style={{ 
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span>🔐</span>
            <span>Staff Login</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
              opacity: 0.1,
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
              filter: 'blur(20px)'
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#EC4899', marginBottom: '4px' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                Total Patients
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
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👨</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6', marginBottom: '4px' }}>
              {stats.male}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Male Patients
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👩</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#EC4899', marginBottom: '4px' }}>
              {stats.female}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Female Patients
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌐</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6', marginBottom: '4px' }}>
              {stats.other}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              Other
            </div>
          </div>
        </div>

        {/* Header with Register Button */}
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
              Patient Registry
            </h1>
            <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>
              Register and manage patient information
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)} 
            style={{ 
              padding: '14px 24px',
              background: showForm ? '#EF4444' : 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: showForm ? '0 8px 16px rgba(239, 68, 68, 0.3)' : '0 8px 16px rgba(236, 72, 153, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '18px' }}>{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Cancel' : 'Register New Patient'}</span>
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

        {/* Registration Form */}
        {showForm && (
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: '32px',
            border: '2px solid #EC4899'
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
              <span>📝</span>
              <span>Patient Registration Form</span>
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
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    placeholder="Enter patient's full name"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #E2E8F0', 
                      borderRadius: '10px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EC4899'}
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
                    Age *
                  </label>
                  <input 
                    type="number" 
                    value={formData.age} 
                    onChange={(e) => setFormData({...formData, age: e.target.value})} 
                    required 
                    min="0"
                    max="150"
                    placeholder="Enter age"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #E2E8F0', 
                      borderRadius: '10px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EC4899'}
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
                    Gender *
                  </label>
                  <select 
                    value={formData.gender} 
                    onChange={(e) => setFormData({...formData, gender: e.target.value})} 
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
                    onFocus={(e) => e.target.style.borderColor = '#EC4899'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  >
                    <option>Male</option>
                    <option>Female</option>
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
                    onFocus={(e) => e.target.style.borderColor = '#EC4899'}
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
                    Blood Type
                  </label>
                  <input 
                    type="text" 
                    value={formData.blood_type} 
                    onChange={(e) => setFormData({...formData, blood_type: e.target.value})} 
                    placeholder="e.g., A+, B-, O+"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #E2E8F0', 
                      borderRadius: '10px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EC4899'}
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
                    Emergency Contact
                  </label>
                  <input 
                    type="text" 
                    value={formData.emergency_contact} 
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})} 
                    placeholder="Emergency contact number"
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #E2E8F0', 
                      borderRadius: '10px',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EC4899'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#1E293B',
                  fontSize: '14px'
                }}>
                  Address *
                </label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  required 
                  placeholder="Enter full address"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '2px solid #E2E8F0', 
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EC4899'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              <div style={{ 
                padding: '16px',
                background: '#FEF3C7',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #FDE047'
              }}>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#92400E'
                }}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_serious_case} 
                    onChange={(e) => setFormData({...formData, is_serious_case: e.target.checked})} 
                    style={{ 
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <span>⚠️ Mark as Serious/Emergency Case</span>
                </label>
                
                {formData.is_serious_case && (
                  <div style={{ marginTop: '12px' }}>
                    <textarea 
                      value={formData.serious_case_notes} 
                      onChange={(e) => setFormData({...formData, serious_case_notes: e.target.value})} 
                      placeholder="Enter emergency case notes..."
                      rows="3"
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '2px solid #FDE047', 
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                style={{ 
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 24px rgba(236, 72, 153, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 16px rgba(236, 72, 153, 0.3)';
                }}
              >
                ✨ Register Patient
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
          borderBottom: 'none',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
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
              placeholder="Search patients by name, contact, or ID..."
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
              onFocus={(e) => e.target.style.borderColor = '#EC4899'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Male', 'Female', 'Other'].map(gender => (
              <button
                key={gender}
                onClick={() => setFilterGender(gender)}
                style={{
                  padding: '10px 20px',
                  background: filterGender === gender ? '#EC4899' : 'white',
                  color: filterGender === gender ? 'white' : '#64748B',
                  border: filterGender === gender ? 'none' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filterGender !== gender) {
                    e.target.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterGender !== gender) {
                    e.target.style.background = 'white';
                  }
                }}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Table */}
        <div style={{ 
          background: 'white', 
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}>
          {filteredPatients.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#94A3B8'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {searchQuery || filterGender !== 'All' ? '🔍' : '📋'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748B' }}>
                {searchQuery || filterGender !== 'All' ? 'No patients found' : 'No patients registered yet'}
              </div>
              <div style={{ fontSize: '14px' }}>
                {searchQuery || filterGender !== 'All' ? 'Try adjusting your search or filters' : 'Click "Register New Patient" to add the first patient'}
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
                    Patient ID
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
                    Age
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
                    Gender
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
                    Contact
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
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, index) => (
                  <tr 
                    key={p.patient_id} 
                    style={{ 
                      borderBottom: index === filteredPatients.length - 1 ? 'none' : '1px solid #F1F5F9',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#EC4899'
                    }}>
                      #{p.patient_id}
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
                        background: p.gender === 'Male' 
                          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                          : p.gender === 'Female'
                          ? 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'
                          : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{p.name}</span>
                    </td>
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      color: '#64748B'
                    }}>
                      {p.age} years
                    </td>
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px'
                    }}>
                      <span style={{
                        padding: '6px 12px',
                        background: p.gender === 'Male' 
                          ? '#DBEAFE' 
                          : p.gender === 'Female'
                          ? '#FCE7F3'
                          : '#F3E8FF',
                        color: p.gender === 'Male'
                          ? '#1E40AF'
                          : p.gender === 'Female'
                          ? '#BE185D'
                          : '#6B21A8',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{p.gender === 'Male' ? '👨' : p.gender === 'Female' ? '👩' : '🌐'}</span>
                        <span>{p.gender}</span>
                      </span>
                    </td>
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      color: '#64748B'
                    }}>
                      📞 {p.contact}
                    </td>
                    <td style={{ 
                      padding: '18px 20px',
                      fontSize: '14px',
                      color: '#64748B'
                    }}>
                      📅 {new Date(p.date_registered).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats Footer */}
        {filteredPatients.length > 0 && (
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
              Showing <span style={{ fontWeight: '700', color: '#1E293B' }}>{filteredPatients.length}</span> of <span style={{ fontWeight: '700', color: '#1E293B' }}>{patients.length}</span> patients
            </div>
            {(searchQuery || filterGender !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterGender('All');
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
        )}
      </div>
    </div>
  );
}

export default ReceptionPage;