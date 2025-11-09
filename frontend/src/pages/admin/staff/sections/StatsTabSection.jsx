import { getTabColor } from '../utils/StaffHelpers';

function StatsTabsSection({ activeTab, doctors, nurses, onTabChange }) {
  const doctorColors = getTabColor(activeTab === 'doctors', 'doctors');
  const nurseColors = getTabColor(activeTab === 'nurses', 'nurses');

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '32px'
    }}>
      <button 
        onClick={() => onTabChange('doctors')} 
        style={{ 
          padding: '24px',
          border: `2px solid ${doctorColors.border}`,
          background: doctorColors.bg,
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
              color: doctorColors.text
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
        onClick={() => onTabChange('nurses')} 
        style={{ 
          padding: '24px',
          border: `2px solid ${nurseColors.border}`,
          background: nurseColors.bg,
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
              color: nurseColors.text
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
  );
}

export default StatsTabsSection;
