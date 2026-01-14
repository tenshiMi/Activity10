import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, PhilippinePeso, Type, AlignLeft, Tag } from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const location = useLocation();

    
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
                
                await axios.put(`http://localhost:3000/events/${eventToEdit.id}`, formData);
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'successful'
                });
            } else {
                
                await axios.post('http://localhost:3000/events', formData);
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'successful'
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
            <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    {eventToEdit ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="text-gray-500 mt-2">
                    {eventToEdit ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
                { }
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
                        placeholder="Enter event title"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                { }
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

                { }
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

                { }
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        <AlignLeft className="inline w-4 h-4 mr-1" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Describe the event"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                { }
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <PhilippinePeso className="inline w-4 h-4 mr-1" />
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            step="0.01"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.00"
                            value={formData.price}
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option>Conference</option>
                            <option>Workshop</option>
                            <option>Concert</option>
                            <option>Sports</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                { }
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : eventToEdit ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </form>
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
                            onClick={() => {
                                setModal({ show: false, type: '', title: '', message: '' });
                                navigate('/admin');
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