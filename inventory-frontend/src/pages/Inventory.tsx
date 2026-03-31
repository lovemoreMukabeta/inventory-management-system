import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingCart
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const userRole = localStorage.getItem('role');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter state
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', stock: 0, price: 0.0 });
  const [formError, setFormError] = useState('');

  // Sell Modal State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellItem, setSellItem] = useState<Product | null>(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellError, setSellError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchProducts = async () => {
    try {
      const url = searchTerm.trim() 
        ? `http://localhost:8080/api/products?search=${encodeURIComponent(searchTerm.trim())}` 
        : 'http://localhost:8080/api/products';
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem 
        ? `http://localhost:8080/api/products/${editingItem.id}` 
        : 'http://localhost:8080/api/products';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchProducts(); // refresh list
        closeModal();
      } else {
        const errorText = await res.text();
        setFormError(errorText || `Failed to save: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("Failed to save product", err);
      setFormError("Network error. Is the backend running?");
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellItem) return;
    try {
      const res = await fetch(`http://localhost:8080/api/products/${sellItem.id}/sell?quantity=${sellQuantity}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchProducts(); // refresh list
        setIsSellModalOpen(false);
      } else {
        const errorText = await res.text();
        setSellError(errorText || `Failed to process sale: ${res.statusText}`);
      }
    } catch (err) {
      setSellError("Network error. Is the backend running?");
    }
  };

  const openModal = (item?: Product) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, category: item.category, stock: item.stock, price: item.price });
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: '', stock: 0, price: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError('');
  };

  const getDerivedStatus = (stock: number) => {
    if (stock > 20) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Low Stock': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Out of Stock': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredItems = items.filter(item => filterStatus === 'All' || getDerivedStatus(item.stock) === filterStatus);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    const itemsToExport = items.filter(item => filterStatus === 'All' || getDerivedStatus(item.stock) === filterStatus);
    const headers = ['ID', 'Product Name', 'Category', 'Current Stock', 'Price', 'Status'];
    
    const csvRows = itemsToExport.map(item => {
      const status = getDerivedStatus(item.stock);
      return [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        item.stock,
        item.price.toFixed(2),
        `"${status}"`
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Inventory Items</h1>
            <p className="text-slate-500 mt-1">Manage and track your product stock levels</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={exportToCSV} className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all">
              <Download size={18} />
              <span>Export CSV</span>
            </button>
            {userRole === 'ADMIN' && (
              <button onClick={() => openModal()} className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
                <Plus size={20} />
                <span>Add New Product</span>
              </button>
            )}
          </div>
        </header>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or category..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 outline-none w-full transition-all"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${filterStatus !== 'All' ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <Filter size={18} />
                <span className="font-medium">Filters {filterStatus !== 'All' && `(${filterStatus})`}</span>
              </button>
              {isFilterDropdownOpen && (
                <div className="absolute top-12 left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 p-2">
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Status</div>
                  {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 mt-1 rounded-lg text-sm font-medium transition-all ${filterStatus === status ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-slate-500 text-sm font-medium">
            Showing <span className="text-slate-900">{items.length}</span> items
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Current Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                {userRole === 'ADMIN' && (
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading products...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No products found. Add one!</td></tr>
              ) : paginatedItems.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No products match your filter or page.</td></tr>
              ) : (
                paginatedItems.map((item) => {
                  const status = getDerivedStatus(item.stock);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${item.stock < 20 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      {userRole === 'ADMIN' && (
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => {
                              setSellItem(item);
                              setSellQuantity(1);
                              setSellError('');
                              setIsSellModalOpen(true);
                            }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Process Sale">
                              <ShoppingCart size={16} />
                            </button>
                            <button onClick={() => openModal(item)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit Product">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete Product">
                              <Trash2 size={16} />
                            </button>
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 text-slate-500 hover:text-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Previous</span>
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-primary-600 text-white shadow-md shadow-primary-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {page}
                </button>
              ))}
              {totalPages === 0 && (
                <button className="w-8 h-8 rounded-lg text-sm font-bold bg-primary-600 text-white shadow-md shadow-primary-100">1</button>
              )}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center space-x-1 text-slate-500 hover:text-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <input 
                  type="text" required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stock</label>
                  <input 
                    type="number" required min="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100">
                {editingItem ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {isSellModalOpen && sellItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Process Sale</h2>
              <button onClick={() => setIsSellModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            {sellError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {sellError}
              </div>
            )}
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Selling item:</p>
                <p className="font-bold text-slate-900 truncate">{sellItem.name}</p>
                <div className="flex justify-between text-sm mt-2 font-medium">
                  <span className="text-slate-500">Price: <span className="text-emerald-600">${sellItem.price.toFixed(2)}</span></span>
                  <span className="text-slate-500">Stock: <span className={sellItem.stock < 20 ? 'text-amber-600' : 'text-slate-700'}>{sellItem.stock}</span></span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity to Sell</label>
                <div className="flex items-center space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setSellQuantity(Math.max(1, sellQuantity - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold"
                  >-</button>
                  <input 
                    type="number" required min="1" max={sellItem.stock}
                    value={sellQuantity}
                    onChange={e => setSellQuantity(Math.min(sellItem.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none text-center font-bold text-lg"
                  />
                  <button 
                    type="button" 
                    onClick={() => setSellQuantity(Math.min(sellItem.stock, sellQuantity + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold"
                  >+</button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-4">
                <span className="text-slate-500 font-medium">Total Price:</span>
                <span className="text-2xl font-black text-emerald-600">${(sellItem.price * sellQuantity).toFixed(2)}</span>
              </div>
              
              <button 
                type="submit" 
                disabled={sellQuantity < 1 || sellQuantity > sellItem.stock}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Complete Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
