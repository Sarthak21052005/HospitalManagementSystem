import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api';

export function useDashboard(setUser) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, nurses: 0 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const patients = await api.getReceptionPatients();
      const doctors = await api.getDoctors();
      const nurses = await api.getNurses();
      setStats({ patients: patients.length, doctors: doctors.length, nurses: nurses.length });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function handleLogout() {
    console.log('🚪 Logout attempt from Dashboard...');
    try {
      await api.logout();
      console.log('✅ Logout API successful');
    } catch (err) {
      console.error('❌ Logout API failed:', err);
    } finally {
      setUser(null);
      navigate('/');
    }
  }

  return {
    stats,
    showUserMenu,
    setShowUserMenu,
    activeNav,
    setActiveNav,
    navigate,
    handleLogout
  };
}
