function LoadingSpinner() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '15%',
        width: '300px',
        height: '300px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '400px',
        height: '400px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      {/* Main loading card */}
      <div style={{
        background: 'white',
        padding: '48px 64px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Hospital logo */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🏥
        </div>

        {/* Spinner */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            border: '4px solid #F1F5F9',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>

        {/* Text content */}
        <h2 style={{
          margin: '0 0 12px 0',
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          HealthCare Pro
        </h2>

        <p style={{
          margin: 0,
          color: '#64748B',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          Loading your dashboard...
        </p>

        {/* Animated dots */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#667eea',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out infinite'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            background: '#764ba2',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out 0.2s infinite'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            background: '#667eea',
            borderRadius: '50%',
            animation: 'bounce 1.4s ease-in-out 0.4s infinite'
          }} />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 0.3;
          }
          40% { 
            transform: translateY(-12px);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0);
          }
          50% { 
            transform: translate(30px, -30px);
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;