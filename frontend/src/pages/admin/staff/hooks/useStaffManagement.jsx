import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function useStaffManagement() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    specialization: '',
    contact: '',
    working_hours: '9AM-5PM'
  });
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      if (activeTab === 'doctors') {
        const data = await api.getDoctors();
        setDoctors(data);
      } else {
        const data = await api.getNurses();
        setNurses(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (activeTab === 'doctors') {
        if (editingId) {
          await api.updateDoctor(editingId, formData);
          setMsg('✅ Doctor updated successfully!');
        } else {
          await api.addDoctor(formData);
          setMsg('✅ Doctor added successfully!');
        }
      } else {
        if (editingId) {
          await api.updateNurse(editingId, formData);
          setMsg('✅ Nurse updated successfully!');
        } else {
          await api.addNurse(formData);
          setMsg('✅ Nurse added successfully!');
        }
      }
      resetForm();
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Operation failed: ' + err.message);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      specialization: '',
      contact: '',
      working_hours: '9AM-5PM'
    });
  }

  function handleEdit(item) {
    setEditingId(activeTab === 'doctors' ? item.doctor_id : item.nurse_id);
    setFormData({
      email: item.email,
      password: '',
      name: item.name,
      specialization: item.specialization || '',
      contact: item.contact,
      working_hours: item.working_hours || '9AM-5PM'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      if (activeTab === 'doctors') {
        await api.deleteDoctor(id);
        setMsg('✅ Doctor deleted successfully!');
      } else {
        await api.deleteNurse(id);
        setMsg('✅ Nurse deleted successfully!');
      }
      loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Delete failed: ' + err.message);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSearchQuery('');
  }

  return {
    // State
    activeTab,
    doctors,
    nurses,
    showForm,
    editingId,
    formData,
    msg,
    searchQuery,
    
    // Setters
    setShowForm,
    setFormData,
    setMsg,
    setSearchQuery,
    
    // Actions
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
    handleTabChange
  };
}
