import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashBoard'; 
import NurseDashboard from './pages/NurseDashBoard';
import LabTechnicianDashboard from './pages/LabTechnician'; // ✅ NEW IMPORT
import ReceptionPage from './pages/ReceptionPage';
import StaffManagement from './pages/StaffManagement';
import InventoryManagement from './pages/InventoryManagement';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const data = await api.session();
      if (data.role) {
        setUser(data);
      }
    } catch (err) {
      console.error('Session check failed:', err);
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
    if (user.role === 'lab_technician') return '/lab/dashboard'; // ✅ NEW
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
