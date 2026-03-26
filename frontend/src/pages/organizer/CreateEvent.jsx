import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { 
    Calendar, MapPin, PhilippinePeso, Type, AlignLeft, Tag, 
    BellRing, Image as ImageIcon, Ticket, Clock, CheckCircle2, AlertCircle, Loader2, Users 
} from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const location = useLocation();

    const eventToEdit = location.state?.eventToEdit || null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const [formData, setFormData] = useState({
        title: eventToEdit?.title || '',
        imageUrl: eventToEdit?.imageUrl || '', 
        date: formatDateForInput(eventToEdit?.date),
        time: eventToEdit?.time || '',
        location: eventToEdit?.location || '',
        description: eventToEdit?.description || '',
        price: eventToEdit?.price || '',
        category: eventToEdit?.category || '',
        announcement: eventToEdit?.announcement || '',
        capacity: eventToEdit?.capacity || '', 
        organizerId: eventToEdit?.organizerId || user.id || 0
    });

    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePriceBlur = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setFormData({ ...formData, price: val.toFixed(2) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            capacity: parseInt(formData.capacity, 10) || 0,
            price: parseFloat(formData.price) || 0
        };

        try {
            if (eventToEdit?.id) {
                await api.put(`/events/${eventToEdit.id}`, payload);
                setModal({ show: true, type: 'success', title: 'Success!', message: 'Event updated successfully.' });
            } else {
                await api.post('/events', payload);
                
                // ---------------------------------------------------------
                // 🌟 NEW: Fetch users to find the Admin, and ring their bell!
                // ---------------------------------------------------------
                try {
                    const usersRes = await api.get('/users');
                    const admin = usersRes.data.find(u => u.role === 'Admin');
                    if (admin) {
                        await api.post('/notifications', {
                            userId: admin.id, // Notify the Admin
                            title: 'New Event Proposal 📋',
                            message: `${user.name || 'An Organizer'} submitted "${payload.title}" for approval.`,
                            type: 'SYSTEM' // Uses the Amber Alert Icon
                        });
                    }
                } catch (notifErr) {
                    console.error("Silent error: Failed to notify admin", notifErr);
                }
                // ---------------------------------------------------------

                setModal({ 
                    show: true, 
                    type: 'success', 
                    title: 'Submitted for Approval!', 
                    message: 'Your event has been sent to the Admins. You will be notified once it is approved.' 
                });
            }
        } catch (error) {
            console.error('Error saving event:', error);
            setModal({ show: true, type: 'error', title: 'Error', message: 'Failed to save event. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto pb-16">
            
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {eventToEdit ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="text-gray-500 font-medium mt-1">
                    {eventToEdit ? 'Update your event details below.' : 'Fill in the details to propose a new event.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* CARD 1: Basic Information */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Type className="text-blue-600" size={20} /> Basic Information
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Title</label>
                            <input
                                type="text" name="title" required value={formData.title} onChange={handleChange}
                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 font-bold"
                                placeholder="e.g. Tech Summit 2026"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>Cover Image URL</span>
                                    <span className="text-gray-400 font-normal">Optional</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-medium"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Tag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="category" required value={formData.category} onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select a category...</option>
                                        <optgroup label="Professional & Educational">
                                            <option value="Conference / Summit">Conference / Summit</option>
                                            <option value="Workshop / Masterclass">Workshop / Masterclass</option>
                                            <option value="Networking / Gala">Networking / Gala</option>
                                        </optgroup>
                                        <optgroup label="Entertainment & Arts">
                                            <option value="Concert / Live Music">Concert / Live Music</option>
                                            <option value="Theater / Comedy">Theater / Comedy</option>
                                            <option value="Festival / Expo">Festival / Expo</option>
                                        </optgroup>
                                        <optgroup label="Competitions & Lifestyle">
                                            <option value="Sports / E-Sports">Sports / E-Sports</option>
                                            <option value="Nightlife / Party">Nightlife / Party</option>
                                        </optgroup>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Date & Location */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin className="text-emerald-500" size={20} /> Date & Location
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date" name="date" required min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="time" name="time" required value={formData.time} onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location / Venue</label>
                            <input
                                type="text" name="location" required value={formData.location} onChange={handleChange}
                                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold"
                                placeholder="e.g. Imus City Plaza"
                            />
                        </div>
                    </div>
                </div>

                {/* CARD 3: Ticketing & Capacity */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Ticket className="text-purple-500" size={20} /> Ticketing
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ticket Price (PHP)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <PhilippinePeso className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number" name="price" step="0.01" min="0" required value={formData.price} onChange={handleChange} onBlur={handlePriceBlur}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold"
                                    placeholder="0 for Free"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Maximum Capacity</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number" name="capacity" min="1" required value={formData.capacity} onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold"
                                    placeholder="e.g. 500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 4: Additional Details */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlignLeft className="text-gray-400" size={20} /> Event Description
                        </h2>
                        <textarea
                            name="description" rows="5" value={formData.description} onChange={handleChange}
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-medium resize-none"
                            placeholder="What can attendees expect at this event?"
                        />
                    </div>

                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                            <BellRing size={16} /> Important Announcement (Optional)
                        </h2>
                        <p className="text-xs text-amber-600/80 mb-3">
                            This will appear highlighted at the top of your event page. Perfect for dress codes or parking info.
                        </p>
                        <textarea
                            name="announcement" rows="2" value={formData.announcement} onChange={handleChange}
                            className="block w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-gray-900 font-medium resize-none"
                            placeholder="e.g. Strictly formal attire. Doors close exactly at 8:00 PM."
                        />
                    </div>
                </div>

                {/* Submit Action */}
                {/* 🌟 PREMIUM ACTION FOOTER */}
<div className="mt-8 bg-slate-50 border border-slate-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
    <div className="text-sm font-medium text-slate-500 text-center sm:text-left">
        Please verify all details before submitting.<br/>
        <span className="text-amber-600 font-bold flex items-center gap-1 mt-1 justify-center sm:justify-start">
            <Clock size={14} /> Approvals may take up to 24 hours.
        </span>
    </div>
    
    <button 
        type="submit" 
        disabled={isLoading} 
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
    >
        {isLoading ? <Loader2 className="animate-spin" size={24} /> : eventToEdit ? 'Save Changes' : 'Submit for Approval'}
    </button>
</div>
            </form>

            {/* Success/Error Modal */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center transform transition-all animate-in zoom-in duration-200">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${modal.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                            {modal.type === 'error' ? <AlertCircle size={32} strokeWidth={2.5} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{modal.title}</h2>
                        <p className="text-gray-500 font-medium mb-8">{modal.message}</p>
                        <button 
                            onClick={() => {
                                setModal({ show: false, type: '', title: '', message: '' });
                                if (modal.type === 'success') navigate('/organizer');
                            }}
                            className={`w-full font-bold py-3.5 rounded-xl text-white transition-all shadow-md ${modal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
