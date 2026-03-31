import React from 'react';
import { 
  BarChart3, 
  Package, 
  LogOut,
  ExternalLink,
  Users
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const userRole = localStorage.getItem('role');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 space-y-8">
      <div className="flex items-center space-x-3 px-2">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <ExternalLink size={24} />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          InvMatrix
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        <Link 
          to="/dashboard" 
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/dashboard') 
              ? 'bg-primary-50 text-primary-600 font-medium' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </Link>
        <Link 
          to="/inventory" 
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/inventory') 
              ? 'bg-primary-50 text-primary-600 font-medium' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package size={20} />
          <span>Inventory</span>
        </Link>

        {userRole === 'ADMIN' && (
          <Link 
            to="/users" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              isActive('/users') 
                ? 'bg-primary-50 text-primary-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={20} />
            <span>Manage Users</span>
          </Link>
        )}

        <div className="pt-4 mt-2 mb-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
