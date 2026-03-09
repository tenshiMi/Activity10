import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Shield, ArrowRight, CheckCircle, XCircle, KeyRound, AlertCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Signup Form, 2: OTP Verification
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ADDED: confirmPassword to state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '', 
    role: 'Attendee'
  });
  
  const [otp, setOtp] = useState('');

  const [modal, setModal] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  // Real-time Validation
  const passwordRules = {
    length: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  // Submit Step 1: Create Account & Request OTP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isPasswordValid) {
      setErrorMessage('Please make sure your password meets all the security requirements.');
      return; 
    }

    // ADDED: Block submission if passwords don't match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please try again.');
      return;
    }

    setIsLoading(true);
    
    // We intentionally don't include confirmPassword in the payload sent to the backend
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    try {
      await axios.post('http://localhost:3000/users', payload);
      setStep(2); // Move to OTP step on success
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'This email is already taken or the server is down.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await axios.post('http://localhost:3000/users/verify-email', { 
        email: formData.email, 
        otp 
      });
      
      // Show Success Modal
      setModal({
        show: true,
        type: 'success',
        title: 'Verified!',
        message: 'Your account has been verified. You can now log in.'
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (modal.type === 'success') {
      navigate('/login'); 
    } else {
      setModal({ ...modal, show: false }); 
    }
  };

  const RequirementItem = ({ isValid, text }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
      {isValid ? <CheckCircle size={14} /> : <XCircle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            {step === 1 ? <User size={24} /> : <KeyRound size={24} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 1 ? 'Join the event management platform' : `We sent a code to ${formData.email}`}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm mb-5 animate-pulse">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: SIGNUP FORM */}
        {step === 1 && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    required name="firstName" type="text" placeholder="John" value={formData.firstName}
                    autoComplete="off"
                    readOnly 
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
                <div className="relative">
                  <input 
                    required name="lastName" type="text" placeholder="Doe" value={formData.lastName}
                    autoComplete="off"
                    readOnly 
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required name="email" type="email" placeholder="john@example.com" value={formData.email}
                  autoComplete="off"
                  readOnly 
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
              <div className="relative mb-2">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required name="password" type="password" placeholder="--------" value={formData.password}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5 mt-1">
                <RequirementItem isValid={passwordRules.length} text="At least 6 characters long" />
                <RequirementItem isValid={passwordRules.uppercase} text="Contains 1 uppercase letter" />
                <RequirementItem isValid={passwordRules.number} text="Contains 1 number" />
                <RequirementItem isValid={passwordRules.specialChar} text="Contains 1 special character" />
              </div>
            </div>

            {/* ADDED: Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Confirm Password</label>
              <div className="relative mb-2">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required name="confirmPassword" type="password" placeholder="--------" value={formData.confirmPassword}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">I am an...</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                <select 
                  name="role" value={formData.role}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  onChange={handleChange}
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Organizer">Organizer</option>
                </select>
              </div>
            </div>

            <button 
              disabled={isLoading || (formData.password.length > 0 && !isPasswordValid)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Sign Up'} <ArrowRight size={18} />
            </button>
            
            <p className="text-center mt-6 text-gray-600 text-sm">
              Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
            </p>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Enter Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required type="text" placeholder="123456" value={otp} maxLength={6}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition tracking-widest text-center font-bold text-lg"
                  onChange={(e) => { setOtp(e.target.value); setErrorMessage(''); }}
                />
              </div>
            </div>
            
            <button 
              disabled={isLoading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-blue-600 transition">
                Wait, I need to change my email
              </button>
            </div>
          </form>
        )}

      </div>

      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {modal.type === 'success' ? <CheckCircle size={40} /> : <XCircle size={40} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{modal.title}</h2>
            <p className="text-gray-500 mb-6 text-sm">{modal.message}</p>
            <button 
              onClick={handleModalClose}
              className={`w-full font-bold py-3 rounded-xl transition shadow-lg text-white ${
                modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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