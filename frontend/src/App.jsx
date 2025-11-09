import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashBoard';
import DoctorDashboard from './pages/DoctorDashBoard';
import NurseDashboard from './pages/NurseDashBoard';
import LabTechnicianDashboard from './pages/LabTechnician';
import ReceptionPage from './pages/ReceptionPage';
import StaffManagement from './pages/StaffManagement';
import InventoryManagement from './pages/InventoryManagement';
import WardAssignmentManagement from './pages/WardAssignmentMangement';
import LoadingSpinner from './components/shared/LoadingSpinner';
import BedManagement from './pages/BedMangement';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Step 1: Mark this tab as active when app loads
    sessionStorage.setItem('tabActive', 'true');
    
    checkSession();
    
    // ✅ Step 2: Handle page refresh vs tab close
    const handleBeforeUnload = (e) => {
      // Check if this is a page refresh or tab close
      const isRefresh = e.currentTarget.performance?.navigation?.type === 1;
      
      if (!isRefresh) {
        // This is a tab close or navigation away, not a refresh
        // Clear the session
        sessionStorage.removeItem('tabActive');
        navigator.sendBeacon('/api/auth/logout');
      }
    };

    // ✅ Step 3: Alternative method - using pagehide event (more reliable for tab close)
    const handlePageHide = (e) => {
      // If the page is being persisted (back/forward cache), don't logout
      if (e.persisted) {
        return;
      }
      
      // Remove the active tab marker
      sessionStorage.removeItem('tabActive');
      navigator.sendBeacon('/api/auth/logout');
    };

    // ✅ Step 4: Check if session should be maintained on page load
    const handlePageShow = (e) => {
      const wasTabActive = sessionStorage.getItem('tabActive');
      
      if (!wasTabActive) {
        // Tab was closed, session should be cleared
        setUser(null);
      } else {
        // Tab is being refreshed, keep session
        sessionStorage.setItem('tabActive', 'true');
      }
    };

    // Add all event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup: Remove all event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  async function checkSession() {
    try {
      const data = await api.session();
      if (data.role) {
        setUser(data);
        // Mark that user is logged in
        sessionStorage.setItem('tabActive', 'true');
      }
    } catch (err) {
      console.error('Session check failed:', err);
      sessionStorage.removeItem('tabActive');
    } finally {
      setLoading(false);
    }
  }

  // Get default redirect route based on user role
  function getDefaultRoute() {
    if (!user) return '/';
    if (user.role === 'admin') return '/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'nurse') return '/nurse/dashboard';
    if (user.role === 'lab_technician') return '/lab/dashboard';
    return '/';
  }

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route 
        path="/" 
        element={!user ? <LoginPage setUser={setUser} /> : <Navigate to={getDefaultRoute()} />} 
      />
      
      <Route 
        path="/reception" 
        element={<ReceptionPage />} 
      />
      
      {/* ===== ADMIN ROUTES (Only accessible by admin) ===== */}
      <Route 
        path="/dashboard" 
        element={
          user && user.role === 'admin' 
            ? <Dashboard user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />
      
      <Route 
        path="/staff" 
        element={
          user && user.role === 'admin' 
            ? <StaffManagement user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />
      
      <Route 
        path="/inventory" 
        element={
          user && user.role === 'admin' 
            ? <InventoryManagement user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />

      {/* ✅ Ward Assignment Management Route */}
      <Route 
        path="/ward-assignments" 
        element={
          user && user.role === 'admin' 
            ? <WardAssignmentManagement user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />

      {/* ✅ Bed Management Route */}
      <Route 
        path="/bed-management" 
        element={
          user && user.role === 'admin' 
            ? <BedManagement user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />
      
      {/* ===== DOCTOR ROUTES (Only accessible by doctor) ===== */}
      <Route 
        path="/doctor/dashboard" 
        element={
          user && user.role === 'doctor' 
            ? <DoctorDashboard user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />
      
      {/* ===== NURSE ROUTES (Only accessible by nurse) ===== */}
      <Route 
        path="/nurse/dashboard" 
        element={
          user && user.role === 'nurse' 
            ? <NurseDashboard user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />

      {/* ===== LAB TECHNICIAN ROUTES (Only accessible by lab technician) ===== */}
      <Route 
        path="/lab/dashboard" 
        element={
          user && user.role === 'lab_technician' 
            ? <LabTechnicianDashboard user={user} setUser={setUser} /> 
            : <Navigate to="/" />
        } 
      />
      
      {/* ===== CATCH ALL - Redirect to appropriate dashboard ===== */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
}

export default App;
