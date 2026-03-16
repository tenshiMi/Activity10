import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    // 🌟 FIX: Added 'sticky top-0 z-50 bg-white' to completely lock it to the screen!
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Side: Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:bg-blue-700 transition">
              <Calendar className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="block font-extrabold text-xl text-gray-900 leading-none">Harmony Events</span>
              <span className="block text-[10px] text-gray-500 font-bold tracking-wider mt-0.5">EVENT MANAGEMENT PLATFORM</span>
            </div>
          </Link>

          {/* Right Side: Auth / Profile */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* User Profile Pill */}
                <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-gray-200 py-1.5 px-4 rounded-full">
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 leading-none">{user.name || 'User'}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{user.role || 'ATTENDEE'}</span>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Logged Out Buttons */}
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition px-4 py-2">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-md">
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