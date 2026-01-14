import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Shield, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Attendee'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Unified Modal State (Handles both Success and Error)
  const [modal, setModal] = useState({
    show: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛑 VALIDATION CHECKS

    if (formData.password.length < 6) {
      setModal({
        show: true,
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.'
      });
      return; // Stop here
    }

    // ✅ If all checks pass, proceed to send data
    setIsLoading(true);
    
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    try {
      await axios.post('http://localhost:3000/users', payload);
      // Show SUCCESS Modal
      setModal({
        show: true,
        type: 'success',
        title: 'Success!',
        message: 'Your account has been created successfully. You can now log in.'
      });
    } catch (error) {
      console.error("Signup failed:", error);
      // Show ERROR Modal
      setModal({
        show: true,
        type: 'error',
        title: 'Signup Failed',
        message: 'This email is already taken or the server is down. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle modal button click
  const handleModalClose = () => {
    if (modal.type === 'success') {
      navigate('/login'); // Redirect on success
    } else {
      setModal({ ...modal, show: false }); // Just close on error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <User size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Join the event management platform</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Split Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required name="firstName" type="text" placeholder="John"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (!/[a-zA-Z\s]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
              <div className="relative">
                <input 
                  required name="lastName" type="text" placeholder="Doe"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                  onKeyPress={(e) => {
                    if (!/[a-zA-Z\s]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                required name="email" type="email" placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                required name="password" type="password" placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">Must be at least 6 characters</p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">I am a...</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
              <select 
                name="role" 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                onChange={handleChange}
              >
                <option value="Attendee">Attendee</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? 'Creating...' : 'Sign Up'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
        </p>
      </div>

      {/* 🌟 UNIVERSAL POPUP MODAL */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
            
            {/* Dynamic Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {modal.type === 'success' ? <CheckCircle size={40} /> : <XCircle size={40} />}
            </div>

            {/* Dynamic Text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{modal.title}</h2>
            <p className="text-gray-500 mb-6">{modal.message}</p>
            
            {/* Dynamic Button Action */}
            <button 
              onClick={handleModalClose}
              className={`w-full font-bold py-3 rounded-xl transition shadow-lg text-white ${
                modal.type === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {modal.type === 'success' ? 'Go to Login' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}