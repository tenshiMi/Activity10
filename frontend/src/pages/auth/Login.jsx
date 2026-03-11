import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, AlertCircle, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 🌟 NEW: Reactivation Modal State
  const [reactivateModal, setReactivateModal] = useState({ show: false, email: '', otp: '', loading: false });

  // Handle Google OAuth Redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const userParam = queryParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'Admin') navigate('/admin');
        else if (user.role === 'Organizer') navigate('/organizer');
        else navigate('/');
      } catch (error) {
        setErrorMessage("Failed to complete Google login. Please try again.");
      }
    }
  }, [location.search, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); 

    try {
      const response = await axios.post('http://localhost:3000/auth/login', formData);
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Organizer') navigate('/organizer');
      else navigate('/');

    } catch (error) {
      // 🌟 NEW: Catch the inactive account error!
      if (error.response?.data?.message === 'INACTIVE_ACCOUNT') {
        try {
          // Automatically fire off the OTP email
          await axios.post('http://localhost:3000/auth/reactivate/send', { email: formData.email });
          // Show the modal
          setReactivateModal({ show: true, email: formData.email, otp: '', loading: false });
        } catch (mailError) {
          setErrorMessage("Account is inactive, but we failed to send the verification email.");
        }
      } else {
        setErrorMessage("Invalid Email or Password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 NEW: Handle submitting the OTP to reactivate
  const handleReactivateSubmit = async (e) => {
    e.preventDefault();
    setReactivateModal(prev => ({ ...prev, loading: true }));
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:3000/auth/reactivate/verify', {
        email: reactivateModal.email,
        otp: reactivateModal.otp
      });

      // The backend auto-logs them in upon success, so we grab the token!
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      setReactivateModal({ show: false, email: '', otp: '', loading: false });

      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Organizer') navigate('/organizer');
      else navigate('/');

    } catch (error) {
      setErrorMessage("Invalid or expired OTP. Please try again.");
      setReactivateModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      window.location.href = 'http://localhost:3000/auth/google';
    } else {
      alert(`${provider} login clicked! You need API keys to activate this.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && !reactivateModal.show && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                required name="email" type="email" placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                required name="password" type="password" placeholder="------"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end mt-1.5">
              <Link to="/forgot-password" className="text-xs text-purple-600 hover:text-purple-800 font-semibold transition">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* --- SOCIAL LOGIN SECTION --- */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSocialLogin('google')}
              type="button" 
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" onClick={() => handleSocialLogin('facebook')} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
              <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account? <Link to="/signup" className="text-purple-600 font-bold hover:underline">Sign Up</Link>
        </p>
      </div>

      {/* 🌟 NEW: REACTIVATION MODAL */}
      {reactivateModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-orange-500">
              <KeyRound size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Account Inactive</h2>
            <p className="text-gray-600 text-sm mb-6">
              Your account has been archived. We just sent a 6-digit code to <strong>{reactivateModal.email}</strong> to verify your identity and reactivate your account.
            </p>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm mb-4 border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleReactivateSubmit}>
              <input
                type="text"
                maxLength="6"
                required
                placeholder="Enter 6-digit OTP"
                className="w-full text-center tracking-widest text-2xl font-bold py-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-orange-500 outline-none"
                value={reactivateModal.otp}
                onChange={(e) => setReactivateModal({ ...reactivateModal, otp: e.target.value })}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReactivateModal({ show: false, email: '', otp: '', loading: false })}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reactivateModal.loading}
                  className="flex-1 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {reactivateModal.loading ? 'Verifying...' : 'Reactivate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}