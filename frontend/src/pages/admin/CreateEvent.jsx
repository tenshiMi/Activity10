import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, PhilippinePeso, Type, AlignLeft, Tag, Image, Users, Ticket, Megaphone } from 'lucide-react'; // 🌟 Added Ticket and Megaphone icons

export default function CreateEvent() {
    const navigate = useNavigate();
    const location = useLocation();

    // Safely grab the event from the router state
    const eventToEdit = location.state?.eventToEdit || null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [organizers, setOrganizers] = useState([]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    // 🌟 NEW: Added capacity and announcement to the initial state
    const [formData, setFormData] = useState({
        title: eventToEdit?.title || '',
        date: formatDateForInput(eventToEdit?.date),
        time: eventToEdit?.time || '',
        location: eventToEdit?.location || '',
        description: eventToEdit?.description || '',
        price: eventToEdit?.price || '',
        category: eventToEdit?.category || '',
        organizerId: eventToEdit?.organizerId || (user.role === 'Admin' ? '' : user.id),
        imageUrl: eventToEdit?.imageUrl || '',
        capacity: eventToEdit?.capacity || '', 
        announcement: eventToEdit?.announcement || '', 
    });

    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

    useEffect(() => {
        if (user.role === 'Admin') {
            axios.get('http://localhost:3000/users')
                .then(response => {
                    const activeOrganizers = response.data.filter(u => u.role === 'Organizer' && u.isActive);
                    setOrganizers(activeOrganizers);
                })
                .catch(error => console.error('Error fetching organizers:', error));
        }
    }, [user.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: name === 'organizerId' ? Number(value) : value 
        });
    };

    // 🌟 NEW: Auto-formats the price to 2 decimal places when you click away from the input
    const handlePriceBlur = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setFormData({ ...formData, price: val.toFixed(2) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (eventToEdit?.id) {
                await axios.put(`http://localhost:3000/events/${eventToEdit.id}`, formData);
                setModal({ show: true, type: 'success', title: 'Success', message: 'Event updated successfully!' });
            } else {
                await axios.post('http://localhost:3000/events', formData);
                setModal({ show: true, type: 'success', title: 'Success', message: 'Event created successfully!' });
            }
        } catch (error) {
            console.error('Error saving event:', error);
            setModal({ show: true, type: 'error', title: 'Error', message: 'Failed to save event. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto pb-12 pt-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {eventToEdit ? 'Edit Event' : 'Create New Event'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {eventToEdit ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
                        {user.role === 'Admin' && !eventToEdit && <span className="ml-1 text-blue-600 font-medium">(Admin Mode)</span>}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
                    
                    {user.role === 'Admin' && (
                        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mb-6">
                            <label className="block text-sm font-bold text-blue-900 mb-2">
                                <Users className="inline w-4 h-4 mr-1" />
                                Assign to Organizer
                            </label>
                            <select
                                name="organizerId"
                                required
                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                                value={formData.organizerId}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select an Organizer...</option>
                                {organizers.map(org => (
                                    <option key={org.id} value={org.id}>
                                        {org.name} ({org.email})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-blue-600 mt-2 font-medium">
                                As an Admin, you must assign this event to an Organizer. It will appear on their dashboard.
                            </p>
                        </div>
                    )}

                    {/* Event Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <Type className="inline w-4 h-4 mr-1" />
                            Event Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Tech Summit 2024"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">
                                <Image className="inline w-4 h-4 mr-1" />
                                Cover Image URL
                            </label>
                            <span className="text-sm text-gray-400">Optional</span>
                        </div>
                        <input
                            type="url"
                            name="imageUrl" 
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://example.com/my-event-banner.jpg"
                            value={formData.imageUrl} 
                            onChange={handleChange}
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Calendar className="inline w-4 h-4 mr-1" />
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-text"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-text"
                                value={formData.time}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter event location"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    {/* 🌟 NEW: Price, Capacity, and Category (3 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <PhilippinePeso className="inline w-4 h-4 mr-1" />
                                Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                min="0" // 🌟 Prevents negative numbers
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                                onBlur={handlePriceBlur} // 🌟 Auto-formats to .00 when clicking away
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Ticket className="inline w-4 h-4 mr-1" />
                                Capacity
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                min="1"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 500"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Tag className="inline w-4 h-4 mr-1" />
                                Category
                            </label>
                            <select
                                name="category"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select category...</option>
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <AlignLeft className="inline w-4 h-4 mr-1" />
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows="3"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Describe the main details of the event..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* 🌟 NEW: Announcement */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">
                                <Megaphone className="inline w-4 h-4 mr-1" />
                                Announcement / Alerts
                            </label>
                            <span className="text-sm text-gray-400">Optional</span>
                        </div>
                        <textarea
                            name="announcement"
                            rows="2"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-orange-50/30"
                            placeholder="Highlight important rules, dress codes, or guest speakers..."
                            value={formData.announcement}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {isLoading ? 'Saving...' : eventToEdit ? 'Update Event' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modals */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center animate-in zoom-in duration-200">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${modal.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-500'}`}>
                            {modal.type === 'error' ? '❌' : '✓'}
                        </div>
                        <h2 className={`text-2xl font-extrabold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-gray-900'}`}>
                            {modal.title}
                        </h2>
                        <p className="text-gray-500 font-medium mb-8">{modal.message}</p>
                        <button 
                            onClick={() => {
                                setModal({ show: false, type: '', title: '', message: '' });
                                navigate('/admin'); 
                            }}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-bold transition shadow-md"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}