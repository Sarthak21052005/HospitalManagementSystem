import { useState, useEffect } from 'react';
import { api } from '../../../api';

export function useDoctorDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedThisMonth: 0
  });
  
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, scheduleData, patientsData, appointmentsData] = await Promise.all([
        api.getDoctorStats(),
        api.getTodaySchedule(),
        api.getAllPatients(),
        api.getDoctorAppointments()
      ]);
      
      setStats(statsData);
      setTodaySchedule(scheduleData);
      setAllPatients(patientsData);
      setAllAppointments(appointmentsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCardClick(cardType) {
    setActiveView(cardType);
  }

  function handleCreateReport(patient) {
    setSelectedPatient(patient);
    setShowReportForm(true);
  }

  function handleCloseReportForm() {
    setShowReportForm(false);
    setSelectedPatient(null);
  }

  function handleReportSuccess() {
    setShowReportForm(false);
    setSelectedPatient(null);
    loadDashboardData();
  }

  return {
    // State
    stats,
    todaySchedule,
    allPatients,
    allAppointments,
    loading,
    activeView,
    filterType,
    searchQuery,
    showReportForm,
    selectedPatient,
    
    // Setters
    setActiveView,
    setFilterType,
    setSearchQuery,
    
    // Actions
    handleCardClick,
    handleCreateReport,
    handleCloseReportForm,
    handleReportSuccess,
    loadDashboardData
  };
}
