import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { 
    Calendar, MapPin, PhilippinePeso, Type, AlignLeft, Tag, 
    Image as ImageIcon, Users, Ticket, Megaphone, Loader2, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const location = useLocation();

    const eventToEdit = location.state?.eventToEdit || null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [organizers, setOrganizers] = useState([]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try { return new Date(dateString).toISOString().split('T')[0]; } 
        catch (e) { return ''; }
    };

    const [formData, setFormData] = useState({
        title: eventToEdit?.title || '',
        date: formatDateForInput(eventToEdit?.date),
        time: eventToEdit?.time || '',
        location: eventToEdit?.location || '',
        description: eventToEdit?.description || '',
        price: eventToEdit?.price || '',
        category: eventToEdit?.category || '',
        organizerId: eventToEdit?.organizerId || '',
        imageUrl: eventToEdit?.imageUrl || '',
        capacity: eventToEdit?.capacity || '', 
        announcement: eventToEdit?.announcement || '', 
    });

    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        if (user.role === 'Admin') {
            api.get('/users')
                .then(response => {
                    const activeOrganizers = response.data.filter(u => u.role === 'Organizer' && u.isActive);
                    setOrganizers(activeOrganizers);
                })
                .catch(error => console.error('Error fetching organizers:', error));
        }
    }, [user.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'organizerId' ? Number(value) : value });
    };

    const handlePriceBlur = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) setFormData({ ...formData, price: val.toFixed(2) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            capacity: parseInt(formData.capacity, 10) || 0,
            price: parseFloat(formData.price) || 0
        };

        // 🌟 Admin automatically bypasses pending approval
        if (user.role === 'Admin' && !eventToEdit) {
            payload.status = 'Published';
        }

        try {
            if (eventToEdit?.id) {
                await api.put(`/events/${eventToEdit.id}`, payload);
                setModal({ show: true, type: 'success', title: 'Success!', message: 'Event updated successfully.' });
            } else {
                await api.post('/events', payload);
                setModal({ show: true, type: 'success', title: 'Published!', message: 'The event is now live on the platform.' });
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
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {eventToEdit ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="text-gray-500 font-medium mt-1">
                    {eventToEdit ? 'Update the event details below.' : 'Publish a new event directly to the platform.'}
                    {!eventToEdit && <span className="ml-2 text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase tracking-wider">Admin Override</span>}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* ADMIN ASSIGNMENT BOX */}
                <div className="bg-blue-50/50 border border-blue-200/60 p-6 rounded-3xl shadow-sm">
                    <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Users size={18} className="text-blue-600" /> Assign to Organizer
                    </h2>
                    <select
                        name="organizerId" required value={formData.organizerId} onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-gray-800 shadow-sm cursor-pointer appearance-none"
                    >
                        <option value="" disabled>Select an Organizer...</option>
                        {organizers.map(org => (
                            <option key={org.id} value={org.id}>{org.name} ({org.email})</option>
                        ))}
                    </select>
                    <p className="text-xs text-blue-600/80 mt-2 font-medium">This event will appear on the selected organizer's dashboard for management.</p>
                </div>

                {/* CARD 1: Basic Info */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Type className="text-blue-600" size={20} /> Basic Information</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold" placeholder="e.g. Tech Summit 2026" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between"><span>Cover Image URL</span><span className="text-gray-400 font-normal">Optional</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ImageIcon className="h-5 w-5 text-gray-400" /></div>
                                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-medium" placeholder="https://example.com/image.jpg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Tag className="h-5 w-5 text-gray-400" /></div>
                                    <select name="category" required value={formData.category} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer">
                                        <option value="" disabled>Select category...</option>
                                        <optgroup label="Professional & Educational"><option value="Conference / Summit">Conference / Summit</option><option value="Workshop / Masterclass">Workshop / Masterclass</option><option value="Networking / Gala">Networking / Gala</option></optgroup>
                                        <optgroup label="Entertainment & Arts"><option value="Concert / Live Music">Concert / Live Music</option><option value="Theater / Comedy">Theater / Comedy</option><option value="Festival / Expo">Festival / Expo</option></optgroup>
                                        <optgroup label="Competitions & Lifestyle"><option value="Sports / E-Sports">Sports / E-Sports</option><option value="Nightlife / Party">Nightlife / Party</option></optgroup>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Date & Location */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><MapPin className="text-emerald-500" size={20} /> Date & Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-gray-400" /></div>
                                <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Clock className="h-5 w-5 text-gray-400" /></div>
                                <input type="time" name="time" required value={formData.time} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location / Venue</label>
                            <input type="text" name="location" required value={formData.location} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold" placeholder="e.g. Imus City Plaza" />
                        </div>
                    </div>
                </div>

                {/* CARD 3: Ticketing */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Ticket className="text-purple-500" size={20} /> Ticketing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ticket Price (PHP)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><PhilippinePeso className="h-5 w-5 text-gray-400" /></div>
                                <input type="number" name="price" step="0.01" min="0" required value={formData.price} onChange={handleChange} onBlur={handlePriceBlur} className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold" placeholder="0 for Free" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Maximum Capacity</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Users className="h-5 w-5 text-gray-400" /></div>
                                <input type="number" name="capacity" min="1" required value={formData.capacity} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-bold" placeholder="e.g. 500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 4: Details */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><AlignLeft className="text-gray-400" size={20} /> Event Description</h2>
                        <textarea name="description" rows="5" required value={formData.description} onChange={handleChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-gray-900 font-medium resize-none" placeholder="What can attendees expect at this event?" />
                    </div>
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2"><Megaphone size={16} /> Important Announcement (Optional)</h2>
                        <p className="text-xs text-amber-600/80 mb-3">This will appear highlighted at the top of the event page.</p>
                        <textarea name="announcement" rows="2" value={formData.announcement} onChange={handleChange} className="block w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-gray-900 font-medium resize-none" placeholder="e.g. Strictly formal attire..." />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center gap-2 active:scale-95">
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : eventToEdit ? 'Save Changes' : 'Publish Event'}
                    </button>
                </div>
            </form>

            {/* Modals */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center transform transition-all animate-in zoom-in duration-200">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-8 ${modal.type === 'error' ? 'bg-red-50 border-red-100/50 text-red-500' : 'bg-emerald-50 border-emerald-100/50 text-emerald-500'}`}>
                            {modal.type === 'error' ? <AlertCircle size={32} strokeWidth={2.5} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">{modal.title}</h2>
                        <p className="text-gray-500 font-medium mb-8">{modal.message}</p>
                        <button 
                            onClick={() => {
                                setModal({ show: false, type: '', title: '', message: '' });
                                navigate('/admin'); 
                            }}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold transition shadow-md active:scale-95"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
