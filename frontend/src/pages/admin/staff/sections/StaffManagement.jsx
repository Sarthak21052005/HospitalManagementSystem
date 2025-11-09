import Navbar from '../../../components/shared/Navbar';
import { useStaffManagement } from './hooks/useStaffManagement';
import { filterStaffData } from './utils/staffHelpers';
import StatsTabsSection from './sections/StatsTabsSection';
import SearchSection from './sections/SearchSection';
import StaffTable from './sections/StaffTable';
import StaffForm from './sections/StaffForm';

function StaffManagement({ user, setUser }) {
  const {
    activeTab,
    doctors,
    nurses,
    showForm,
    editingId,
    formData,
    msg,
    searchQuery,
    setShowForm,
    setFormData,
    setMsg,
    setSearchQuery,
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
    handleTabChange
  } = useStaffManagement();

  const currentData = activeTab === 'doctors' ? doctors : nurses;
  const filteredData = filterStaffData(currentData, searchQuery);

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <Navbar user={user} setUser={setUser} />
      
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
        <StatsTabsSection
          activeTab={activeTab}
          doctors={doctors}
          nurses={nurses}
          onTabChange={handleTabChange}
        />

        {/* Add/Edit Form */}
        {showForm && (
          <StaffForm
            activeTab={activeTab}
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            setShowForm={setShowForm}
          />
        )}

        {/* Search Bar */}
        <SearchSection
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Staff Table */}
        <StaffTable
          activeTab={activeTab}
          filteredData={filteredData}
          currentData={currentData}
          searchQuery={searchQuery}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default StaffManagement;
