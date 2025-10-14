import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';


function LoginPage({ setUser }) {
  const [tab, setTab] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  async function handleLogin(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);


    try {
      const data = await api.login(tab, email, password);
      if (data.success) {
        setUser(data);
        navigate('/dashboard');
      }
    } catch (err) {
      setMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }


  // ✅ UPDATED: Added lab_technician config
  const tabConfig = {
    admin: { icon: '👨‍💼', color: '#0066CC', label: 'Admin' },
    doctor: { icon: '👨‍⚕️', color: '#059669', label: 'Doctor' },
    nurse: { icon: '👩‍⚕️', color: '#8B5CF6', label: 'Nurse' },
    lab_technician: { icon: '🧪', color: '#F59E0B', label: 'Lab Tech' } // ✅ NEW
  };


  const currentColor = tabConfig[tab].color;


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />


      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}dd 100%)`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px',
            boxShadow: `0 8px 16px ${currentColor}40`
          }}>
            🏥
          </div>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            HealthCare Pro
          </h1>
          <p style={{
            margin: 0,
            color: '#64748B',
            fontSize: '15px'
          }}>
            Hospital Management System
          </p>
        </div>


        {/* ✅ UPDATED: Tab Selection - Changed to 2x2 grid for 4 roles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)', // ✅ Changed from 3 to 2 columns
          gap: '12px',
          marginBottom: '32px',
          padding: '8px',
          background: '#F8FAFC',
          borderRadius: '12px'
        }}>
          {Object.entries(tabConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setMsg(''); setEmail(''); setPassword(''); }}
              style={{
                padding: '12px 8px',
                border: 'none',
                background: tab === key ? 'white' : 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: tab === key ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                transform: tab === key ? 'translateY(-2px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '24px' }}>{config.icon}</span>
              <span style={{
                fontSize: '13px',
                fontWeight: tab === key ? '600' : '500',
                color: tab === key ? config.color : '#64748B'
              }}>
                {config.label}
              </span>
            </button>
          ))}
        </div>


        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              {tab === 'admin' ? 'Admin ID' : 'Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={tab === 'admin' ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder={tab === 'admin' ? 'Enter admin ID' : 'Enter your email'}
                onFocus={(e) => e.target.style.borderColor = currentColor}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '14px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingRight: '48px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                onFocus={(e) => e.target.style.borderColor = currentColor}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>


          {msg && (
            <div style={{
              padding: '12px 16px',
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{msg}</span>
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#94A3B8' : `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}dd 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : `0 8px 16px ${currentColor}40`,
              transform: loading ? 'none' : 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 12px 24px ${currentColor}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 8px 16px ${currentColor}40`;
              }
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Signing in...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>


        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '24px 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '500' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>


        {/* Reception Button */}
        <button
          onClick={() => navigate('/reception')}
          style={{
            width: '100%',
            padding: '14px',
            background: 'white',
            border: '2px solid #E2E8F0',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            color: '#64748B',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#CBD5E1';
            e.target.style.background = '#F8FAFC';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#E2E8F0';
            e.target.style.background = 'white';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '20px' }}>🏥</span>
          <span>Go to Reception</span>
        </button>
      </div>
    </div>
  );
  
}



export default LoginPage;
