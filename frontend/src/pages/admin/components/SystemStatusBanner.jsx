function SystemStatusBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '32px' }}>✨</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            System Operational
          </h3>
        </div>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
          All hospital management modules are running smoothly. Ready to manage staff, patients, and ward assignments.
        </p>
      </div>
      
      <div style={{
        padding: '12px 24px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '14px',
        position: 'relative',
        zIndex: 1
      }}>
        🟢 All Systems Online
      </div>
    </div>
  );
}

export default SystemStatusBanner;
