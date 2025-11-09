import Navbar from '../../../components/shared/Navbar';
import { useInventory } from './hooks/useInventory';
import { calculateStats, filterInventory } from './utils/InventoryHelpers';
import StatsSection from './sections/StatsSection';
import FiltersSection from './sections/FiltersSection';
import InventoryTable from './sections/InventoryTable';
import InventoryForm from './sections/InventoryForm';
import LowStockAlert from './sections/LowStockAlert';

function InventoryManagement({ user, setUser }) {
  const {
    inventory,
    showForm,
    formData,
    msg,
    searchQuery,
    filterCategory,
    filterStatus,
    setShowForm,
    setFormData,
    setMsg,
    setSearchQuery,
    setFilterCategory,
    setFilterStatus,
    handleSubmit,
    clearFilters
  } = useInventory();

  const stats = calculateStats(inventory);
  const filteredInventory = filterInventory(inventory, searchQuery, filterCategory, filterStatus);

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <StatsSection stats={stats} />

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
          <InventoryForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            setShowForm={setShowForm}
          />
        )}

        {/* Search and Filter Bar */}
        <FiltersSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {/* Inventory Table */}
        <InventoryTable
          filteredInventory={filteredInventory}
          inventory={inventory}
          searchQuery={searchQuery}
          filterCategory={filterCategory}
          filterStatus={filterStatus}
          clearFilters={clearFilters}
        />

        {/* Low Stock Alert */}
        <LowStockAlert
          stats={stats}
          setFilterStatus={setFilterStatus}
        />
      </div>
    </div>
  );
}

export default InventoryManagement;
