import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios'; // <-- Uncommented!

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // REAL API CALL TO BACKEND
      await axios.post('http://localhost:3000/auth/forgot-password', { email });
      setStep(2);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to send OTP. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // REAL API CALL TO BACKEND
      await axios.post('http://localhost:3000/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      // REAL API CALL TO BACKEND
      await axios.post('http://localhost:3000/auth/reset-password', { 
        email, 
        otp, 
        newPassword: passwords.newPassword 
      });
      
      // Redirect to login after success
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50 relative">
        
        {/* Back to Login Link */}
        <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-purple-600 transition flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="text-center mb-8 mt-6">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && `We sent a code to ${email}`}
            {step === 3 && "Create a new strong password"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm mb-5 animate-pulse">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required type="email" placeholder="john@example.com" value={email}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                />
              </div>
            </div>
            <button disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-2 disabled:opacity-50">
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">One Time Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required type="text" placeholder="Enter 6-digit code" value={otp} maxLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition tracking-widest text-center font-bold text-lg"
                  onChange={(e) => { setOtp(e.target.value); setErrorMessage(''); }}
                />
              </div>
            </div>
            <button disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-2 disabled:opacity-50">
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-purple-600 transition">
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required type="password" placeholder="••••••••" value={passwords.newPassword}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  onChange={(e) => { setPasswords({...passwords, newPassword: e.target.value}); setErrorMessage(''); }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required type="password" placeholder="••••••••" value={passwords.confirmPassword}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  onChange={(e) => { setPasswords({...passwords, confirmPassword: e.target.value}); setErrorMessage(''); }}
                />
              </div>
            </div>
            <button disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-2 disabled:opacity-50">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}