import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function useBedManagement() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [bedPrefix, setBedPrefix] = useState('');
  const [numBeds, setNumBeds] = useState(1);
  
  // Filter state
  const [filterWard, setFilterWard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading bed management data...');
      
      const [wardsData, bedsData] = await Promise.all([
        api.getWardsWithBedStats(),
        api.getBeds()
      ]);
      
      console.log('✅ Wards loaded:', wardsData);
      console.log('✅ Beds loaded:', bedsData);
      
      setWards(wardsData);
      setBeds(bedsData);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load bed management data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBed() {
    if (!selectedWard || !bedNumber) {
      setError('Please select a ward and enter a bed number');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Adding bed ${bedNumber} to ward ${selectedWard}...`);
      
      await api.addBed(parseInt(selectedWard), bedNumber);
      
      setSuccess('Bed added successfully!');
      setShowAddBedModal(false);
      setSelectedWard('');
      setBedNumber('');
      
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error adding bed:', err);
      setError(err.message || 'Failed to add bed');
    }
  }

  async function handleBulkAddBeds() {
    if (!selectedWard || !bedPrefix || numBeds < 1) {
      setError('Please fill all fields correctly');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Bulk adding ${numBeds} beds to ward ${selectedWard}...`);
      
      await api.bulkAddBeds(parseInt(selectedWard), bedPrefix, parseInt(numBeds));
      
      setSuccess(`Successfully added ${numBeds} beds!`);
      setShowBulkAddModal(false);
      setSelectedWard('');
      setBedPrefix('');
      setNumBeds(1);
      
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error bulk adding beds:', err);
      setError(err.message || 'Failed to add beds');
    }
  }

  async function handleUpdateBedStatus(bedId, newStatus) {
    try {
      setError(null);
      console.log(`🔄 Updating bed ${bedId} status to ${newStatus}...`);
      
      await api.updateBedStatus(bedId, newStatus);
      
      setSuccess('Bed status updated successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error updating bed status:', err);
      setError(err.message || 'Failed to update bed status');
    }
  }

  async function handleDeleteBed(bedId, bedNumber) {
    if (!confirm(`Are you sure you want to delete bed ${bedNumber}?`)) {
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Deleting bed ${bedId}...`);
      
      await api.deleteBed(bedId);
      
      setSuccess('Bed deleted successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error deleting bed:', err);
      setError(err.message || 'Failed to delete bed');
    }
  }

  function clearFilters() {
    setFilterWard('');
    setFilterStatus('');
  }

  return {
    // State
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
    
    // Setters
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
    
    // Actions
    handleAddBed,
    handleBulkAddBeds,
    handleUpdateBedStatus,
    handleDeleteBed,
    clearFilters
  };
}
