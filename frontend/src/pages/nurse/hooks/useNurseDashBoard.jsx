import { useState, useEffect } from 'react';
import { api } from '../../../api';

export function useNurseDashboard() {
  const [stats, setStats] = useState({
    totalWards: 0,
    admittedPatients: 0,
    availableBeds: 0,
    criticalPatients: 0
  });
  
  const [wards, setWards] = useState([]);
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardBeds, setWardBeds] = useState([]);
  
  // Modal states
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, wardsData, patientsData, tasksData] = await Promise.all([
        api.getNurseStats(),
        api.getNurseWards(),
        api.getAdmittedPatients(),
        api.getNurseTasks('PENDING')
      ]);
      
      setStats(statsData);
      setWards(wardsData);
      setAdmittedPatients(patientsData);
      setPendingTasks(tasksData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadWardBeds(wardId) {
    try {
      const beds = await api.getWardBeds(wardId);
      setWardBeds(beds);
      setSelectedWard(wardId);
      setActiveView('bedManagement');
    } catch (err) {
      console.error('Failed to load ward beds:', err);
      alert('Failed to load beds');
    }
  }

  function handleCardClick(cardType) {
    switch(cardType) {
      case 'wards':
        setActiveView('wards');
        break;
      case 'patients':
        setActiveView('patients');
        break;
      case 'critical':
        setActiveView('patients');
        break;
      case 'tasks':
        setActiveView('tasks');
        break;
      default:
        setActiveView('overview');
    }
  }

  return {
    // State
    stats,
    wards,
    admittedPatients,
    pendingTasks,
    loading,
    activeView,
    selectedWard,
    wardBeds,
    showAdmitForm,
    showVitalsForm,
    selectedPatient,
    
    // Setters
    setActiveView,
    setShowAdmitForm,
    setShowVitalsForm,
    setSelectedPatient,
    
    // Actions
    loadDashboardData,
    loadWardBeds,
    handleCardClick
  };
}
