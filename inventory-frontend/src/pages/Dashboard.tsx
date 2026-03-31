import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Search,
  Bell,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    stockByCategory: {} as Record<string, number>,
    salesTrends: [] as number[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [calcInput, setCalcInput] = useState('');

  const handleCalcClick = (btn: string | number) => {
    if (btn === 'C') {
      setCalcInput('');
    } else if (btn === 'DEL') {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (btn === '=') {
      try {
        let sanitized = calcInput.replace(/[^0-9+\-*/.%]/g, '');
        sanitized = sanitized.replace(/%/g, '/100');
        if (!sanitized) return;
        // eslint-disable-next-line no-new-func
        const evaluated = new Function(`"use strict"; return (${sanitized})`)();
        
        if (!isFinite(evaluated) || isNaN(evaluated)) {
           setCalcInput('Error');
        } else {
           const formatted = Math.round(evaluated * 10000) / 10000;
           setCalcInput(String(formatted));
        }
      } catch (err) {
        setCalcInput('Error');
      }
    } else {
      setCalcInput((prev) => (prev === 'Error' ? String(btn) : prev + String(btn)));
    }
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchStats = async () => {
    try {
      const url = searchTerm.trim() 
        ? `http://localhost:8080/api/products/stats?search=${encodeURIComponent(searchTerm.trim())}` 
        : 'http://localhost:8080/api/products/stats';
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStats();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const stats = [
    { label: 'Total Products', value: dashboardStats.totalProducts.toString(), icon: Package, color: 'bg-blue-500', trend: 'Live' },
    { label: 'Low Stock', value: dashboardStats.lowStock.toString(), icon: AlertTriangle, color: 'bg-amber-500', trend: 'Live' },
    { label: 'Total Value', value: `$${dashboardStats.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'bg-emerald-500', trend: 'Live' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1">Monitor your inventory performance and alerts</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stats by product or category..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 outline-none w-64 transition-all"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={() => navigate('/inventory')} className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all">
              <Plus size={20} />
              <span>Add Item</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-2xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-${stat.color.split('-')[1]}-100`}>
                  <stat.icon size={24} />
                </div>
                <span className={`text-sm font-bold text-emerald-500 bg-slate-50 px-2 py-1 rounded-lg`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-slate-500 font-medium mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 7-Day Sales Trends */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">7-Day Sales Trends</h2>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {!dashboardStats.salesTrends || dashboardStats.salesTrends.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No sales data recorded yet.</div>
              ) : (
                dashboardStats.salesTrends.map((sales, i) => {
                  const maxSales = Math.max(...dashboardStats.salesTrends, 1);
                  const heightPercent = (sales / maxSales) * 100;
                  const daysAgo = 6 - i;
                  const label = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer pt-4 h-full justify-end">
                      <div className="w-full relative group h-full flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-500 group-hover:from-emerald-700 group-hover:to-emerald-500" 
                          style={{ height: `${heightPercent}%`, minHeight: '5%' }}
                        ></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-md">
                          {sales} sold
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2 font-medium truncate w-full text-center" title={label}>{label}</span>
                    </div>
                  );
                })
              )}
            </div>
        </div>

        {/* Recent Activity & Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Stock by Category</h2>
            </div>
            <div className="h-64 flex items-end justify-between space-x-4">
              {!dashboardStats.stockByCategory || Object.keys(dashboardStats.stockByCategory).length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
              ) : (
                Object.entries(dashboardStats.stockByCategory).map(([category, stock], i) => {
                  const maxStock = Math.max(...Object.values(dashboardStats.stockByCategory));
                  const heightPercent = maxStock > 0 ? (stock / maxStock) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer pt-4 h-full justify-end">
                      <div className="w-full relative group h-full flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-xl transition-all duration-500 group-hover:from-primary-700 group-hover:to-primary-500" 
                          style={{ height: `${heightPercent}%`, minHeight: '5%' }}
                        ></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-md">
                          {category}: {stock}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2 font-medium truncate w-full text-center" title={category}>{category}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6">Quick Calculator</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-2xl text-right overflow-hidden">
                <p className="text-slate-400 text-sm mb-1">{calcInput ? 'Calculating...' : 'Total Adjustment'}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight truncate">
                  {calcInput || '0'}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {['C', 'DEL', '%', '/', 7, 8, 9, '*', 4, 5, 6, '-', 1, 2, 3, '+', 0, '.', '='].map((btn) => (
                  <button 
                    key={btn}
                    onClick={() => handleCalcClick(btn)}
                    className={`h-12 flex items-center justify-center rounded-xl font-bold transition-all text-lg
                      ${typeof btn === 'number' || btn === '.' 
                        ? 'bg-slate-50 text-slate-700 hover:bg-slate-100' 
                        : btn === '=' 
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md' 
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      } ${btn === 0 ? 'col-span-2' : ''}`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
