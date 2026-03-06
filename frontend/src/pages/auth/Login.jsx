import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'Organizer') {
        navigate('/organizer');
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Invalid Email or Password. Please try again.");
    } finally {
      setIsLoading(false);
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
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-600 uppercase">Password</label>
              <Link to="/forgot-password" className="text-xs text-purple-600 hover:text-purple-800 font-semibold transition">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                required name="password" type="password" placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account? <Link to="/signup" className="text-purple-600 font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}