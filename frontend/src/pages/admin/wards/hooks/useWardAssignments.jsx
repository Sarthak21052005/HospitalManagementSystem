import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function useWardAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newWard, setNewWard] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading ward assignments data...');
      
      const [assignmentsData, nursesData, wardsData] = await Promise.all([
        api.getWardAssignments(),
        api.getAvailableNurses(),
        api.getWardsList()
      ]);
      
      console.log('✅ Assignments loaded:', assignmentsData);
      console.log('✅ Nurses loaded:', nursesData);
      console.log('✅ Wards loaded:', wardsData);
      
      setAssignments(assignmentsData);
      setNurses(nursesData);
      setWards(wardsData);
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load ward assignment data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignWard() {
    if (!selectedNurse || !selectedWard) {
      setError('Please select both a nurse and a ward');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Assigning nurse ${selectedNurse} to ward ${selectedWard}...`);
      
      await api.assignNurseToWard(parseInt(selectedNurse), parseInt(selectedWard));
      
      setSuccess('Ward assigned successfully!');
      setShowAssignModal(false);
      setSelectedNurse('');
      setSelectedWard('');
      
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error assigning ward:', err);
      setError(err.message || 'Failed to assign ward');
    }
  }

  async function handleUnassignWard(assignmentId) {
    if (!confirm('Are you sure you want to unassign this nurse from the ward?')) {
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Unassigning ward assignment ${assignmentId}...`);
      
      await api.unassignNurseFromWard(assignmentId);
      
      setSuccess('Ward unassigned successfully!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error unassigning ward:', err);
      setError(err.message || 'Failed to unassign ward');
    }
  }

  async function handleReassignWard() {
    if (!selectedAssignment || !newWard) {
      setError('Please select a new ward');
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Reassigning assignment ${selectedAssignment.ward_nurse_id} to ward ${newWard}...`);
      
      await api.reassignNurseToWard(selectedAssignment.ward_nurse_id, parseInt(newWard));
      
      setSuccess('Ward reassigned successfully!');
      setShowReassignModal(false);
      setSelectedAssignment(null);
      setNewWard('');
      
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('❌ Error reassigning ward:', err);
      setError(err.message || 'Failed to reassign ward');
    }
  }

  function openReassignModal(assignment) {
    setSelectedAssignment(assignment);
    setNewWard('');
    setShowReassignModal(true);
  }

  return {
    // State
    assignments,
    nurses,
    wards,
    loading,
    error,
    success,
    showAssignModal,
    showReassignModal,
    selectedNurse,
    selectedWard,
    selectedAssignment,
    newWard,
    
    // Setters
    setError,
    setSuccess,
    setShowAssignModal,
    setShowReassignModal,
    setSelectedNurse,
    setSelectedWard,
    setNewWard,
    
    // Actions
    handleAssignWard,
    handleUnassignWard,
    handleReassignWard,
    openReassignModal
  };
}
