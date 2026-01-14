import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, BarChart3, LogOut, Calendar } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="text-blue-500" />
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Global Event List */}
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            location.pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}>
            <Calendar size={20} />
            <span>All Events</span>
          </Link>
          
          {/* User Management */}
          <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            location.pathname === '/admin/users' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}>
            <Users size={20} />
            <span>Manage Users</span>
          </Link>
          
          {/* Reports */}
          <Link to="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            location.pathname === '/admin/reports' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}>
            <BarChart3 size={20} />
            <span>Reports & Stats</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={confirmLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition w-full text-left">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      { }
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      { }
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}