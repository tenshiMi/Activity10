import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, LogOut } from 'lucide-react';
import { ScanLine } from 'lucide-react';

export default function DashboardLayout() {
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

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800">
          Harmony Events
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/organizer" className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/organizer/create" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition">
            <PlusCircle size={20} />
            <span>Create Event</span>
          </Link>
          <Link to="/organizer/attendees" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition">
            <Users size={20} />
            <span>Attendees</span>
          </Link>
          <Link to="/organizer/scan" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition">
            <ScanLine size={20} />
            <span>Scan Tickets</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={confirmLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition w-full text-left">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          { }
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