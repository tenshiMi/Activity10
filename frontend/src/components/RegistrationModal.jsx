import React, { useState, useEffect } from 'react';
import axios from 'axios'; // <--- Import Axios
import { X, User, Mail, Briefcase } from 'lucide-react';


export default function RegistrationModal({ isOpen, onClose, eventTitle, eventId, userInfo = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // Pre-fill form with user information if available
  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        email: userInfo.email || '',
        company: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: ''
      });
    }
  }, [userInfo, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if already registered
      const checkResponse = await axios.get(`http://localhost:3000/attendees/check-registration?email=${formData.email}&eventId=${eventId}`);
      
      if (checkResponse.data.isRegistered) {
        setModal({
          show: true,
          type: 'error',
          title: 'Already Registered',
          message: 'You have already registered for this event.'
        });
        setIsLoading(false);
        return;
      }

      
      await axios.post('http://localhost:3000/attendees', {
        ...formData,
        eventId: eventId.toString() 
      });
      
      setModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: `Successfully registered for ${eventTitle}!`
      });
      onClose();
    } catch (error) {
      console.error("Registration failed:", error);
      setModal({
        show: true,
        type: 'error',
        title: 'Registration Failed',
        message: 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        { }
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Register Event</h3>
          <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        { }
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            Registering for: <span className="font-semibold text-blue-600">{eventTitle}</span>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Full Name {userInfo ? <span className="text-green-600 text-xs">(Auto-filled)</span> : ''}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input required name="name" type="text" placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${userInfo ? 'bg-gray-50 text-gray-600' : ''}`}
                onChange={handleChange}
                value={formData.name}
                readOnly={!!userInfo} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Email {userInfo ? <span className="text-green-600 text-xs">(Auto-filled)</span> : ''}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input required name="email" type="email" placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${userInfo ? 'bg-gray-50 text-gray-600' : ''}`}
                onChange={handleChange}
                value={formData.email}
                readOnly={!!userInfo} />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Company</label>
             <div className="relative">
               <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
               <input name="company" type="text" placeholder="Tech Corp"
                 className="w-full pl-10 pr-4 py-2 border rounded-lg"
                 onChange={handleChange} />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 mt-4"
          >
            {isLoading ? 'Registering...' : 'Confirm Registration'}
          </button>
        </form>
      </div>
    </div>

    { }
    {modal.show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
          <h2 className={`text-xl font-bold mb-4 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {modal.title}
          </h2>
          <p className="text-gray-600 mb-6">{modal.message}</p>
          <div className="flex justify-end">
            <button 
              onClick={() => setModal({ show: false, type: '', title: '', message: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}