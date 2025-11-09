import { useState, useEffect } from 'react';
import { api } from '../../../../api';

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    item_category: 'Medicine',
    quantity_in_stock: '',
    reorder_level: '',
    unit_price: ''
  });
  const [msg, setMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.addInventoryItem(formData);
      setMsg('✅ Inventory item added successfully!');
      setShowForm(false);
      setFormData({
        item_name: '',
        item_category: 'Medicine',
        quantity_in_stock: '',
        reorder_level: '',
        unit_price: ''
      });
      loadInventory();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Operation failed: ' + err.message);
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setFilterCategory('All');
    setFilterStatus('All');
  }

  return {
    // State
    inventory,
    showForm,
    formData,
    msg,
    searchQuery,
    filterCategory,
    filterStatus,
    
    // Setters
    setShowForm,
    setFormData,
    setMsg,
    setSearchQuery,
    setFilterCategory,
    setFilterStatus,
    
    // Actions
    handleSubmit,
    clearFilters
  };
}
