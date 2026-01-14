import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added useLocation
import axios from 'axios';
import { Calendar, MapPin, PhilippinePeso, Type, AlignLeft, Tag } from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are editing an existing event
    const eventToEdit = location.state?.eventToEdit;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        price: '',
        category: 'Conference',
        organizerId: user.id || 0
    });

    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

    // Pre-fill data if editing
    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                title: eventToEdit.title,
                date: eventToEdit.date,
                time: eventToEdit.time,
                location: eventToEdit.location,
                description: eventToEdit.description,
                price: eventToEdit.price,
                category: eventToEdit.category
            });
        }
    }, [eventToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (eventToEdit) {
                // UPDATE Existing Event
                await axios.put(`http://localhost:3000/events/${eventToEdit.id}`, formData);
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'successful'
                });
            } else {
                // CREATE New Event
                await axios.post('http://localhost:3000/events', formData);
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'successful'
                });
            }
        } catch (error) {
            console.error("Error saving event:", error);
            setModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to save event.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                {eventToEdit ? 'Edit Event' : 'Create New Event'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <div className="relative">
                        <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            required name="title" type="text" placeholder="e.g. Tech Summit 2024"
                            value={formData.title} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                required name="date" type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.date} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            required name="time" type="time"
                            value={formData.time} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            required name="location" type="text" placeholder="e.g. Grand Hall, New York"
                            value={formData.location} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (PHP)</label>
                        <div className="relative">
                            <PhilippinePeso className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                required name="price" type="number" placeholder="0 for Free"
                                value={formData.price} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                name="category"
                                value={formData.category} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option>Conference</option>
                                <option>Workshop</option>
                                <option>Concert</option>
                                <option>Meetup</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea
                            name="description" rows="4" placeholder="Tell people what this event is about..."
                            value={formData.description} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>
                </div>
                {/* Announcement Section */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-bold text-yellow-800 mb-1">📢 Event Announcement</label>
                    <p className="text-xs text-yellow-600 mb-2">Send an update to attendees (e.g., "Doors open at 5 PM").</p>
                    <textarea
                        name="announcement" rows="2"
                        placeholder="Write an update here..."
                        value={formData.announcement} onChange={handleChange}
                        className="w-full px-3 py-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 outline-none"
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                >
                    {isLoading ? 'Saving...' : (eventToEdit ? 'Update Event' : 'Publish Event')}
                </button>
            </form>
        </div>

        {/* Modal */}
        {modal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                    <h2 className={`text-xl font-bold mb-4 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {modal.title}
                    </h2>
                    <p className="text-gray-600 mb-6">{modal.message}</p>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => {
                                setModal({ show: false, type: '', title: '', message: '' });
                                navigate('/organizer');
                            }}
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