import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Calendar, Shield, Settings } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const isLoggedIn = user && token;

  // Reset modal state when login state changes
  useEffect(() => {
    setShowLogoutModal(false);
  }, [isLoggedIn]);


  if (
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname.startsWith('/organizer') ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <Calendar className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Harmony Events
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Event Management Platform</p>
            </div>
          </Link>

          {/* Navigation Links & User Actions */}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="text-white" size={16} />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 text-xs capitalize">{user.role}</p>
                  </div>
                </div>

                {/* Role-based Dashboard Links */}
                {user.role === 'Admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all shadow-md hover:shadow-lg"
                  >
                    <Shield size={16} />
                    <span className="hidden sm:inline font-medium">Admin Panel</span>
                  </Link>
                )}
                {user.role === 'Organizer' && (
                  <Link
                    to="/organizer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg"
                  >
                    <Settings size={16} />
                    <span className="hidden sm:inline font-medium">Dashboard</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={confirmLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-200 hover:border-red-200"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Enhanced Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h2>
              <p className="text-gray-600">Are you sure you want to log out of your account?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}