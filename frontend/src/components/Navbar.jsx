import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Safely check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!(user && token);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Force a hard reload to clear all states and boot them to login
    window.location.href = '/login'; 
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 🌟 PREMIUM LOGO SECTION */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl group-hover:bg-blue-700 transition-colors shadow-sm">
              <Calendar size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                Harmony Events
              </h1>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Event MAnagement Platform
              </p>
            </div>
          </Link>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex items-center gap-2 md:gap-4">
            {isLoggedIn ? (
              <>
                {/* User Profile Snippet (Hidden on very small mobile screens) */}
                <div className="hidden md:flex items-center gap-3 mr-2 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 border border-gray-200 shadow-sm">
                    <UserIcon size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-bold text-gray-900 leading-none">{user?.name}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{user?.role || 'Attendee'}</span>
                  </div>
                </div>

                {/* Minimalist Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* 🌟 UPGRADED: Minimalist Logged-Out State */}
                <Link 
                  to="/login" 
                  className="text-gray-500 hover:text-gray-900 font-bold px-4 py-2 transition-colors text-sm"
                >
                  Sign In
                </Link>   
                <Link to="/signup" // <--- FIXED HERE
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md transform hover:-translate-y-0.5">
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