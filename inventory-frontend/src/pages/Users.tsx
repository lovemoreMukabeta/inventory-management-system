import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Users as UsersIcon,
  Search,
  Trash2,
  Mail,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/users', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 403) {
        // Not authorized
        window.location.href = '/inventory';
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:8080/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setUsers(users.filter(user => user.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'text-primary-600 bg-primary-50 border-primary-100' 
      : 'text-slate-600 bg-slate-50 border-slate-100';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
              <UsersIcon size={28} />
            </div>
            User Management
          </h1>
          <p className="text-slate-500 mt-2">Manage registered users and their access roles</p>
        </header>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search users by name, email or role..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 outline-none w-full transition-all"
            />
          </div>
          <div className="text-slate-500 text-sm font-medium">
             Total <span className="text-slate-900 font-bold">{users.length}</span> registered users
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center animate-pulse text-slate-400 font-medium">Loading user directory...</div>
          ) : paginatedUsers.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">No users found matching your criteria.</div>
          ) : (
            paginatedUsers.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                    <UserIcon size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getRoleColor(user.role)}`}>
                    <Shield size={12} />
                    {user.role}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{user.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <Mail size={14} />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium tracking-tight uppercase">User ID: #{user.id}</span>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
