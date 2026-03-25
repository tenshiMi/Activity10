import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell'; 

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 🌟 NEW: Get the saved avatar or generate the initials avatar
  const displayAvatar = user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=2563eb`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm font-sans">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Side: Premium Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300">
              <Calendar className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <span className="block font-extrabold text-xl text-gray-900 leading-none tracking-tight">Harmony Events</span>
              <span className="block text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">PLATFORM</span>
            </div>
          </Link>

          {/* Right Side: Auth / Profile */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-full p-1 flex items-center">
                  <NotificationBell />
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* 🌟 UPGRADED: Profile Pill with Dynamic Picture */}
                <Link 
                  to="/profile" 
                  className="hidden sm:flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all py-1.5 pl-1.5 pr-5 rounded-full shadow-sm cursor-pointer active:scale-95 group"
                  title="Edit Profile"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-100 shadow-inner shrink-0 group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                    <img src={displayAvatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-extrabold text-gray-900 leading-none group-hover:text-blue-700 transition-colors">{user.name || 'User'}</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 tracking-wider">{user.role || 'ATTENDEE'}</span>
                  </div>
                </Link>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 px-4 py-2.5 rounded-full sm:rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Logout"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Logged Out Buttons */}
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition px-4 py-2">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95">
                  Get Started
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}