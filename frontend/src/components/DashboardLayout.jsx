import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, ScanLine, LogOut, Calendar, User } from 'lucide-react';
import NotificationBell from './NotificationBell'; 

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/organizer', icon: LayoutDashboard },
    { name: 'Create Event', path: '/organizer/create', icon: PlusCircle },
    { name: 'Attendees', path: '/organizer/attendees', icon: Users },
    { name: 'Scan Tickets', path: '/organizer/scan', icon: ScanLine },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      
      {/* 🌟 PREMIUM ORGANIZER NAVBAR WITH GLASSMORPHISM */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Section */}
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300">
                  <Calendar className="text-white w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block font-extrabold text-xl text-gray-900 leading-none tracking-tight">Harmony Events</span>
                  <span className="block text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">PLATFORM</span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1.5 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/60">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-bold text-sm ${
                        isActive 
                          ? 'bg-white text-blue-700 shadow-sm border border-gray-200/50' 
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 border border-transparent'
                      }`}
                    >
                      <link.icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile & Notifications Section */}
            <div className="flex items-center gap-4">
              
              <div className="bg-white border border-gray-200 shadow-sm rounded-full p-1 flex items-center">
                <NotificationBell />
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              {/* Polished Profile Chip */}
              <div className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-300 transition-colors py-1.5 pl-1.5 pr-5 rounded-full shadow-sm cursor-default">
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-900 leading-none">{user?.name || 'Tenshi Amara'}</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 tracking-wider">{user?.role || 'ORGANIZER'}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowLogoutModal(true)} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100 ml-1" 
                title="Logout"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>

            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-8">
        <Outlet />
      </main>

      {/* Logout Modal for Organizer */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in duration-200 transform scale-100">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 border-8 border-red-100/50 text-red-600">
              <LogOut size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold mb-2 text-gray-900">Confirm Logout</h2>
            <p className="text-gray-500 font-medium mb-8">Are you sure you want to log out of your Organizer account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleLogout} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/20 active:scale-[0.98]">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}