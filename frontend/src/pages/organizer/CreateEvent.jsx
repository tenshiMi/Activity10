import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, PhilippinePeso, Type, AlignLeft, Tag, BellRing } from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const location = useLocation();

    // Safely grab the event from the router state (if editing)
    const eventToEdit = location.state?.eventToEdit || null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Helper to safely format MySQL dates for the HTML date picker
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    // Initialize state DIRECTLY from the event
    const [formData, setFormData] = useState({
        title: eventToEdit?.title || '',
        date: formatDateForInput(eventToEdit?.date),
        time: eventToEdit?.time || '',
        location: eventToEdit?.location || '',
        description: eventToEdit?.description || '',
        price: eventToEdit?.price || '',
        category: eventToEdit?.category || '',
        announcement: eventToEdit?.announcement || '', // Keeping your announcement feature!
        organizerId: eventToEdit?.organizerId || user.id || 0
    });

    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (eventToEdit?.id) {
                // UPDATE EVENT
                await axios.put(`http://localhost:3000/events/${eventToEdit.id}`, formData);
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Event updated successfully!'
                });
            } else {
                // CREATE EVENT
                await axios.post('http://localhost:3000/events', formData);
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Event published successfully!'
                });
            }
        } catch (error) {
            console.error('Error saving event:', error);
            setModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to save event. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {eventToEdit ? 'Edit Event' : 'Create New Event'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {eventToEdit ? 'Update your event details below.' : 'Fill in the details to publish a new event.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
                    
                    {/* Event Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <Type className="inline w-4 h-4 mr-1" /> Event Title
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

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Calendar className="inline w-4 h-4 mr-1" /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.time}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" /> Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Grand Hall, New York"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Price & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <PhilippinePeso className="inline w-4 h-4 mr-1" /> Price (PHP)
                            </label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0 for Free"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Tag className="inline w-4 h-4 mr-1" /> Category
                            </label>
                            <select
                                name="category"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.category}
                                onChange={handleChange}
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <AlignLeft className="inline w-4 h-4 mr-1" /> Description
                        </label>
                        <textarea
                            name="description"
                            rows="5"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Tell people what this event is about..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Event Announcement (Yellow Box) */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <label className="block text-sm font-bold text-yellow-800 mb-1 flex items-center gap-2">
                            <BellRing size={16} /> Event Announcement
                        </label>
                        <p className="text-xs text-yellow-600 mb-3">
                            Send an update to attendees (e.g., "Doors open at 5 PM"). 
                        </p>
                        <textarea
                            name="announcement"
                            rows="2"
                            className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
                            placeholder="Write an update here..."
                            value={formData.announcement}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {isLoading ? 'Saving...' : eventToEdit ? 'Update Event' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success/Error Modal */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
                        <h2 className={`text-xl font-bold mb-4 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {modal.title}
                        </h2>
                        <p className="text-gray-600 mb-6">{modal.message}</p>
                        <div className="flex justify-end">
                            <button 
                                onClick={() => {
                                    setModal({ show: false, type: '', title: '', message: '' });
                                    navigate('/organizer'); // Send Organizer back to their dashboard
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
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