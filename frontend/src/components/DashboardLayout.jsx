import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, ScanLine, LogOut, Calendar, User, Bell, CheckCircle2 } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // State for the notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);

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
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-blue-500 transition-colors">
                  <Calendar className="text-white w-6 h-6" />
                </div>
                <div>
                  <span className="block font-extrabold text-xl text-gray-900 leading-none tracking-tight">Harmony Events</span>
                  <span className="block text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">PLATFORM</span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-bold text-sm ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <link.icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} strokeWidth={2.5} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-5">
              
              {/* 🌟 RESPONSIVE NOTIFICATION BELL */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-xl transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`}
                >
                  <Bell size={22} strokeWidth={2} />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">2 New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Ticket size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">New ticket sold!</p>
                            <p className="text-xs text-gray-500 mt-0.5">Miane bought a ticket for Night Party.</p>
                            <span className="text-[10px] font-bold text-gray-400 mt-1 block">10 mins ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Event Published</p>
                            <p className="text-xs text-gray-500 mt-0.5">MLBB Tournament is now live.</p>
                            <span className="text-[10px] font-bold text-gray-400 mt-1 block">2 hours ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link to="/organizer" onClick={() => setShowNotifications(false)} className="block text-center p-3 text-sm font-bold text-blue-600 hover:bg-gray-50 border-t border-gray-100 transition">
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 py-1.5 pl-1.5 pr-4 rounded-full shadow-sm">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-900 leading-none">{user?.name || 'Tenshi Amara'}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{user?.role || 'ORGANIZER'}</span>
                </div>
              </div>

              <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Logout">
                <LogOut size={20} strokeWidth={2.5} />
              </button>

            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}