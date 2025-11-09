// Helper functions for inventory management

export const categories = ['All', 'Medicine', 'Injection', 'Surgical Equipment', 'PPE', 'Other'];

export const categoryIcons = {
  'Medicine': '💊',
  'Injection': '💉',
  'Surgical Equipment': '🔬',
  'PPE': '🧤',
  'Other': '📦'
};

export function getItemStatus(item) {
  if (item.quantity_in_stock === 0) return 'out_of_stock';
  if (item.quantity_in_stock <= item.reorder_level) return 'low_stock';
  return 'in_stock';
}

export function filterInventory(inventory, searchQuery, filterCategory, filterStatus) {
  return inventory.filter(item => {
    const status = getItemStatus(item);
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.item_category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.item_category === filterCategory;
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

export function calculateStats(inventory) {
  return {
    total: inventory.length,
    inStock: inventory.filter(item => getItemStatus(item) === 'in_stock').length,
    lowStock: inventory.filter(item => getItemStatus(item) === 'low_stock').length,
    outOfStock: inventory.filter(item => getItemStatus(item) === 'out_of_stock').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity_in_stock * item.unit_price), 0)
  };
}

export function getStatusStyle(status) {
  switch (status) {
    case 'out_of_stock':
      return {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
        icon: '❌',
        text: 'Out of Stock'
      };
    case 'low_stock':
      return {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #FDE047',
        icon: '⚠️',
        text: 'Low Stock'
      };
    default:
      return {
        background: '#DCFCE7',
        color: '#16A34A',
        border: '1px solid #BBF7D0',
        icon: '✅',
        text: 'In Stock'
      };
  }
}

export function getStockColor(status) {
  if (status === 'out_of_stock') return '#EF4444';
  if (status === 'low_stock') return '#F59E0B';
  return '#10B981';
}
