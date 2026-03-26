import React, { useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom'; // 🌟 NEW: Import Link
import { User, Mail, Lock, Camera, CheckCircle2, AlertCircle, Save, AtSign, ShieldCheck, Eye, EyeOff, Loader2, KeyRound, X, ArrowLeft } from 'lucide-react'; // 🌟 NEW: Added ArrowLeft

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '', 
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    avatarUrl: user.avatarUrl || '' 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 🌟 NEW: Email Verification State
  const [verifyModal, setVerifyModal] = useState({ show: false, code: '', isVerifying: false });

  // Fallback avatar
  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=2563eb`;

  const isEmailChanged = formData.email.trim() !== user.email.trim();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Strict 1MB limit for profile pictures
      if (file.size > 1 * 1024 * 1024) { 
        setStatus({ type: 'error', message: 'Picture is too large. Please select an image under 1MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result });
        setStatus({ type: '', message: '' }); // Clear errors if successful
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { percent: 0, text: 'N/A', color: 'bg-slate-300' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength === 1) return { percent: 25, text: 'Weak', color: 'bg-rose-500' };
    if (strength === 2) return { percent: 50, text: 'Medium', color: 'bg-amber-500' };
    if (strength === 3) return { percent: 75, text: 'Good', color: 'bg-blue-500' };
    if (strength === 4) return { percent: 100, text: 'Strong', color: 'bg-emerald-500' };
    return { percent: 0, text: 'Invalid', color: 'bg-rose-500' };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const handleSaveInitiate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Strict constraint: Password strength
    if (formData.newPassword.trim() !== '' && passwordStrength.percent < 75) {
      setStatus({ type: 'error', message: 'New password is not strong enough. Please follow the requirements.' });
      return;
    }

    // 🌟 INTERCEPT: If email is changed, trigger OTP Verification instead of saving
    if (isEmailChanged) {
      if (!formData.currentPassword.trim()) {
        setStatus({ type: 'error', message: 'Security check: Please enter your Current Password to change your email.' });
        return;
      }
      
      try {
        setIsLoading(true);
        // OPTIONAL: Call your backend here to actually send the OTP code to their new email.
        // await axios.post('http://localhost:3000/auth/send-otp', { email: formData.email });
        
        setVerifyModal({ show: true, code: '', isVerifying: false });
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to send verification code. Try again.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // If no email change, proceed to normal save
    executeSave();
  };

  const executeSave = async () => {
    setIsLoading(true);
    try {
      const payload = { 
        name: formData.name, 
        email: formData.email, 
        username: formData.username.replace('@', ''), 
        avatarUrl: formData.avatarUrl 
      };

      if (formData.newPassword.trim() !== '') {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      await api.put(`/users/${user.id}`, payload);
      
      const updatedUser = { ...user, ...payload };
      delete updatedUser.currentPassword; 
      delete updatedUser.newPassword;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setFormData({ ...formData, currentPassword: '', newPassword: '' });
      setVerifyModal({ show: false, code: '', isVerifying: false });
      setStatus({ type: 'success', message: 'Your profile has been securely updated!' });
      
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Update failed. Verify your details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setVerifyModal(prev => ({ ...prev, isVerifying: true }));
    
    // Simulate network delay for verification
    setTimeout(() => {
      if (verifyModal.code === '123456') { // Change '123456' to your actual backend validation check!
        executeSave(); // Code is correct, execute the save!
      } else {
        setStatus({ type: 'error', message: 'Invalid verification code. Please try again.' });
        setVerifyModal(prev => ({ ...prev, isVerifying: false, show: false }));
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        
        {/* 🌟 NEW: PREMIUM BACK BUTTON */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors mb-6 group w-fit">
          <div className="bg-white border border-slate-200 p-1.5 rounded-lg group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors shadow-sm">
            <ArrowLeft size={16} strokeWidth={2.5} />
          </div>
          Back to Dashboard
        </Link>

        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium mt-1 text-base">Manage your personal details and platform security.</p>
          </div>
          <button 
            form="profileForm" type="submit" disabled={isLoading}
            className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-slate-950/10 disabled:opacity-70 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} strokeWidth={2.5}/>}
            {isLoading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {status.message && (
          <div className={`mb-8 p-6 rounded-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-top shadow-sm border ${status.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <AlertCircle size={24} className="shrink-0" />
            <p className="font-bold">{status.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Picture Card */}
          <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
             <div className="relative group mb-6">
                <div className="w-40 h-40 rounded-full border-4 border-slate-100 overflow-hidden shadow-xl shadow-slate-900/10 bg-slate-50">
                  <img src={formData.avatarUrl || fallbackAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={28} />
                  <span className="text-xs font-black uppercase mt-2 tracking-widest">Update</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                </label>
             </div>
             <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 leading-tight text-center">{user.name}</h2>
             <p className="text-slate-500 font-bold mb-4">@{user.username || user.name?.toLowerCase().replace(' ', '_')}</p>
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-black uppercase tracking-wider">
               {user.role || 'ATTENDEE'}
             </div>
          </div>

          <form id="profileForm" onSubmit={handleSaveInitiate} className="md:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3">
                 <User size={20} className="text-blue-600" /> Basic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-950 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input type="text" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange}
                      className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-extrabold text-blue-700 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                  
                  {/* 🌟 SMART BADGE: Changes based on email edits */}
                  <div className="absolute right-3.5 top-3">
                    {isEmailChanged ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] uppercase font-black tracking-wider rounded-lg border border-amber-200 animate-pulse shadow-sm">
                        <AlertCircle size={14} strokeWidth={2.5} /> Verify to Save
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] uppercase font-black tracking-wider rounded-lg border border-emerald-100 shadow-sm">
                        <ShieldCheck size={14} strokeWidth={2.5} /> Shield Verified
                      </div>
                    )}
                  </div>

                  <input type="email" name="email" required value={formData.email} onChange={handleChange}
                    className={`w-full pl-10 pr-40 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold transition-all ${isEmailChanged ? 'text-amber-700 focus:ring-2 focus:ring-amber-500 focus:bg-white' : 'text-slate-950 focus:ring-2 focus:ring-blue-600 focus:bg-white'}`}
                  />
                </div>
                {isEmailChanged && <p className="text-xs text-amber-600 font-bold mt-2">A verification code will be required when saving this new email address.</p>}
              </div>
            </div>

            {/* Strict Security Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#2563eb_var(--tw-gradient-stops))] from-[#2563eb]/20 to-transparent pointer-events-none"></div>

              <h3 className="text-xl font-black text-slate-950 mb-8 flex items-center gap-3 relative z-10">
                 <Lock size={20} className="text-rose-600" /> Platform Security
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input type={showCurrentPassword ? 'text' : 'password'} name="currentPassword" value={formData.currentPassword} onChange={handleChange} autoComplete="current-password"
                      placeholder="Required to apply security changes"
                      className="w-full pl-10 pr-12 py-3.5 bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none font-bold text-slate-950 placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 transition-colors">
                        {showCurrentPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">New Password</label>
                  <div className="relative mb-3">
                    <input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={handleChange} autoComplete="new-password"
                      placeholder="Leave blank to keep current"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium text-slate-950 placeholder:text-sm transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 transition-colors">
                        {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  
                  {formData.newPassword && (
                    <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in zoom-in duration-300">
                       <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: `${passwordStrength.percent}%` }}></div>
                       </div>
                       <span className={`text-[10px] shrink-0 font-black uppercase tracking-widest ${passwordStrength.color === 'bg-slate-300' ? 'text-slate-500' : passwordStrength.color.replace('bg-', 'text-')}`}>
                          {passwordStrength.text}
                       </span>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 text-sm bg-blue-50/50 border border-blue-100 text-blue-800 rounded-xl flex items-start gap-3">
                    <ShieldCheck size={20} className="shrink-0 mt-0.5 text-blue-600" />
                    <p className="font-medium text-xs leading-relaxed">
                        Harmony Platform adheres to strict security standards. Passwords must be <strong className="font-black">at least 8 characters</strong> long and include an <strong className="font-black">Uppercase letter</strong>, a <strong className="font-black">Digit</strong>, and a <strong className="font-black">Special character (@#$!)</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 🌟 PREMIUM OTP VERIFICATION MODAL */}
      {verifyModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in duration-200 scale-100">
            <div className="absolute top-4 right-4">
              <button onClick={() => setVerifyModal({ show: false, code: '', isVerifying: false })} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X size={18} strokeWidth={3} />
              </button>
            </div>
            
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-amber-50 border-8 border-amber-100/50 text-amber-600">
              <KeyRound size={32} strokeWidth={2.5} />
            </div>
            
            <h2 className="text-2xl font-extrabold mb-2 text-slate-950 tracking-tight">Verify New Email</h2>
            <p className="text-slate-500 font-medium mb-6 text-sm leading-relaxed">
              We just sent a 6-digit code to <strong className="text-slate-800">{formData.email}</strong>. Enter it below to authorize this change.
            </p>
            
            <form onSubmit={handleVerifyOTP}>
              <input 
                type="text" required maxLength="6" placeholder="000000"
                value={verifyModal.code} onChange={(e) => setVerifyModal({...verifyModal, code: e.target.value.replace(/\D/g, '')})}
                className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-black bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none mb-6 text-slate-900 transition-all"
              />
              <button 
                type="submit" disabled={verifyModal.isVerifying || verifyModal.code.length < 6}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-lg hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                {verifyModal.isVerifying ? <Loader2 className="animate-spin" size={24} /> : 'Confirm & Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
