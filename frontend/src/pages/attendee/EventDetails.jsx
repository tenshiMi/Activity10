import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios'; // <--- Import Axios
import { ArrowLeft, Calendar, MapPin, Clock, Share2, LogIn } from 'lucide-react';
import RegistrationModal from '../../components/RegistrationModal';

export default function EventDetails() {
    const { id } = useParams(); // Get the ID from URL (e.g., "1")

    // Check authentication
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    const isLoggedIn = user && token;

    // 1. STATE for holding the real event data
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(true);

    // 2. FETCH DATA when page opens
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/events/${id}`);
                setEvent(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching event details:", error);
                setLoading(false);
            }
        };

        const checkRegistrationStatus = async () => {
            if (!isLoggedIn) {
                setCheckingRegistration(false);
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.email) {
                    const response = await axios.get(`http://localhost:3000/attendees/check-registration?email=${user.email}&eventId=${id}`);
                    setIsRegistered(response.data.isRegistered);
                }
            } catch (error) {
                console.error("Error checking registration status:", error);
            } finally {
                setCheckingRegistration(false);
            }
        };

        fetchEvent();
        checkRegistrationStatus();
    }, [id, isLoggedIn]);

    // 3. Handle Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading event details...
            </div>
        );
    }

    // 4. Handle "Not Found"
    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-red-500">Event not found</h2>
                <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
            <div className="bg-white max-w-3xl w-full rounded-2xl shadow-lg overflow-hidden relative">

                {/* Banner Image Area */}
                <div className="h-48 bg-blue-600 w-full relative flex items-center justify-center">
                    <Link to="/" className="absolute top-4 left-4 bg-white/20 p-2 rounded-full hover:bg-white/40 text-white backdrop-blur-sm transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <span className="text-white text-4xl font-bold opacity-30">{event.category}</span>
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mt-2">
                                Open for Registration
                            </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 transition">
                            <Share2 size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-gray-100 p-3 rounded-lg"><Calendar className="text-blue-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                <p className="font-medium">{event.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-gray-100 p-3 rounded-lg"><Clock className="text-blue-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Time</p>
                                <p className="font-medium">{event.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                            <div className="bg-gray-100 p-3 rounded-lg"><MapPin className="text-blue-600" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                                <p className="font-medium">{event.location}</p>
                            </div>
                        </div>
                    </div>
                    {/* Announcement Banner - Put this above "About this Event" */}
                    {event.announcement && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded-r">
                            <p className="font-bold flex items-center gap-2">📢 Organizer Update:</p>
                            <p>{event.announcement}</p>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">About this Event</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {event.description || "No description provided."}
                        </p>
                    </div>

                    {/* Registration Action */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Price per ticket</p>
                            <p className="text-2xl font-bold text-green-600">
                                {event.price === '0' || event.price === 'Free' ? 'Free' : `₱${event.price}`}
                            </p>
                        </div>

                        {isLoggedIn ? (
                            checkingRegistration ? (
                                <div className="w-full md:w-auto bg-gray-400 text-white font-bold py-3 px-8 rounded-lg">
                                    Checking registration...
                                </div>
                            ) : isRegistered ? (
                                <div className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-center">
                                    ✓ You've already registered for this event
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-blue-600/30"
                                >
                                    Register Now
                                </button>
                            )
                        ) : (
                            <div className="w-full md:w-auto text-center">
                                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                                    <LogIn className="inline-block w-5 h-5 mr-2" />
                                    <p className="font-semibold">Please log in to register</p>
                                    <p className="text-sm">Create an account or sign in to access registration features.</p>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        to="/auth/login"
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Log In to Register
                                    </Link>
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link to="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                                            Sign up here
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Registration Modal (Passes real event title) */}
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                eventTitle={event.title}
                eventId={event.id}
                userInfo={isLoggedIn ? user : null}
            />

        </div>
    );
}