import Navbar from '../../../components/shared/Navbar';
import { useBedManagement } from './hooks/useBedManagement';
import { filterBeds } from './utils/BedHelpers';
import WardsStatsSection from './sections/WardsStatsSection';
import FiltersSection from './sections/FiltersSection';
import BedsTableSection from './sections/BedsTableSection';
import BedModals from './sections/BedModals';

function BedManagement({ user, setUser }) {
  const {
    wards,
    beds,
    loading,
    error,
    success,
    showAddBedModal,
    showBulkAddModal,
    selectedWard,
    bedNumber,
    bedPrefix,
    numBeds,
    filterWard,
    filterStatus,
    setError,
    setSuccess,
    setShowAddBedModal,
    setShowBulkAddModal,
    setSelectedWard,
    setBedNumber,
    setBedPrefix,
    setNumBeds,
    setFilterWard,
    setFilterStatus,
    handleAddBed,
    handleBulkAddBeds,
    handleUpdateBedStatus,
    handleDeleteBed,
    clearFilters
  } = useBedManagement();

  const filteredBeds = filterBeds(beds, filterWard, filterStatus);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} setUser={setUser} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading bed management...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} setUser={setUser} />
      
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              🛏️ Bed Management
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Manage hospital beds and ward capacities
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddBedModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              + Add Single Bed
            </button>
            <button
              onClick={() => setShowBulkAddModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              + Bulk Add Beds
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>❌</span>
            <span style={{ color: '#dc2626', fontWeight: '600' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#dc2626'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div style={{
            padding: '16px 20px',
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#16a34a'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Ward Statistics */}
        <WardsStatsSection wards={wards} />

        {/* Filters */}
        <FiltersSection
          wards={wards}
          filterWard={filterWard}
          filterStatus={filterStatus}
          setFilterWard={setFilterWard}
          setFilterStatus={setFilterStatus}
          clearFilters={clearFilters}
        />

        {/* Beds Table */}
        <BedsTableSection
          filteredBeds={filteredBeds}
          handleUpdateBedStatus={handleUpdateBedStatus}
          handleDeleteBed={handleDeleteBed}
        />
      </div>

      {/* Modals */}
      <BedModals
        showAddBedModal={showAddBedModal}
        showBulkAddModal={showBulkAddModal}
        setShowAddBedModal={setShowAddBedModal}
        setShowBulkAddModal={setShowBulkAddModal}
        wards={wards}
        selectedWard={selectedWard}
        setSelectedWard={setSelectedWard}
        bedNumber={bedNumber}
        setBedNumber={setBedNumber}
        bedPrefix={bedPrefix}
        setBedPrefix={setBedPrefix}
        numBeds={numBeds}
        setNumBeds={setNumBeds}
        handleAddBed={handleAddBed}
        handleBulkAddBeds={handleBulkAddBeds}
      />
    </div>
  );
}

export default BedManagement;
