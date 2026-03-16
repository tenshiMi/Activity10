import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Calendar, MapPin, Settings, Archive, Ticket, Image as ImageIcon, TrendingUp, CheckCircle } from 'lucide-react';

export default function OrganizerDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'Admin';

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const endpoint = isAdmin 
                ? 'http://localhost:3000/events' 
                : `http://localhost:3000/events/organizer/${user.id}`; 
                
            const response = await axios.get(endpoint);
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading events:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getTicketsSold = (event) => {
        if (Array.isArray(event.attendees)) return event.attendees.length;
        if (event._count && event._count.attendees !== undefined) return event._count.attendees;
        return event.ticketsSold || event.attendeeCount || (typeof event.attendees === 'number' ? event.attendees : 0);
    };

    const getRevenue = (event) => {
        const sold = getTicketsSold(event);
        let price = 0;
        if (typeof event.price === 'number') price = event.price;
        else if (typeof event.price === 'string') {
            const parsed = parseFloat(event.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed)) price = parsed;
        }
        const total = sold * price;
        return total > 0 ? `₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₱0.00';
    };

    // 🌟 1. FORMAT DATE TO "April 15, 2026"
    const formatDate = (dateString) => {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // 🌟 2. CHECK IF EVENT HAS PASSED
    const isEventDone = (dateString, timeString) => {
        // Creates a date object from the DB date. If time exists, append it.
        const eventDateTime = new Date(`${dateString}T${timeString || '00:00:00'}`);
        return eventDateTime < new Date(); 
    };

    const handleArchive = async (event) => {
        const isPast = isEventDone(event.date, event.time);
        const ticketsSold = getTicketsSold(event);
        const actionText = event.isArchived ? "unarchive" : "archive";

        // 🌟 RULE: Block archiving if active with attendees
        if (!event.isArchived && !isPast && ticketsSold > 0) {
            setModal({
                show: true,
                type: 'error',
                title: 'Cannot Archive Active Event',
                message: `You currently have ${ticketsSold} attendee(s) registered for this event. You cannot archive it until it is completed or attendees are refunded.`
            });
            return;
        }

        if (window.confirm(`Are you sure you want to ${actionText} this event?`)) {
            try {
                await axios.delete(`http://localhost:3000/events/${event.id}`);
                setEvents(events.map(e => e.id === event.id ? { ...e, isArchived: !event.isArchived } : e));
            } catch (error) {
                setModal({ show: true, type: 'error', title: 'Action Failed', message: `Failed to ${actionText} event.` });
            }
        }
    };

    const defaultImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";

    return (
        <div className="w-full">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isAdmin ? 'All Platform Events' : 'My Events'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Manage your upcoming events here.</p>
                </div>
                
                <Link to={isAdmin ? '/admin/create' : '/organizer/create'} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-blue-600/20">
                    <Plus size={20} strokeWidth={2.5} />
                    Create New Event
                </Link>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            )}

            {!loading && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const ticketsSold = getTicketsSold(event);
                        const isPast = isEventDone(event.date, event.time);
                        // Disable archive if it's an active, future event with attendees
                        const disableArchive = !event.isArchived && !isPast && ticketsSold > 0;
                        
                        return (
                            <div key={event.id} className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 group flex flex-col ${event.isArchived ? 'border-gray-200 opacity-75 grayscale-[30%]' : 'border-gray-200 shadow-sm hover:shadow-xl'}`}>
                                
                                <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {event.imageUrl || event.image ? (
                                        <img src={event.imageUrl || event.image || defaultImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <ImageIcon className="text-gray-300 w-12 h-12" />
                                    )}
                                    
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {event.isArchived ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-gray-900/80 text-white uppercase tracking-wider">Archived</span>
                                        ) : isPast ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-purple-600/90 text-white flex items-center gap-1.5">
                                                <CheckCircle size={14} /> Completed
                                            </span>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${event.status === 'Draft' ? 'bg-amber-500/90' : 'bg-emerald-500/90'} text-white`}>
                                                {event.status || 'Published'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 text-blue-700">
                                            {event.category || 'General'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className={`text-lg font-extrabold mb-4 line-clamp-1 transition-colors ${event.isArchived ? 'text-gray-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                            <Calendar size={18} className="text-gray-400" />
                                            {/* 🌟 APPLIED DATE FORMATTER HERE */}
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                            <MapPin size={18} className="text-gray-400" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tickets Sold</span>
                                                <div className="flex items-center gap-1.5 text-sm font-extrabold text-gray-900">
                                                    <Ticket size={14} className={event.isArchived ? 'text-gray-400' : 'text-blue-500'} />
                                                    {ticketsSold} <span className="text-gray-400 font-medium text-xs">/ {event.capacity || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                                                <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Est. Revenue</span>
                                                <div className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-600">
                                                    <TrendingUp size={14} />
                                                    {getRevenue(event)}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100 mb-4" />
                                        
                                        <div className="flex items-center justify-end gap-2">
                                            {/* 🌟 3. ARCHIVE BUTTON PROTECTIONS */}
                                            <button
                                                onClick={() => handleArchive(event)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-bold ${
                                                    disableArchive ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                    : event.isArchived ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                                                    : 'bg-white text-orange-500 border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                                                }`}
                                                title={disableArchive ? "Cannot archive active events with attendees" : event.isArchived ? "Restore Event" : "Archive Event"}
                                            >
                                                <Archive size={16} strokeWidth={2.5} />
                                                {event.isArchived ? 'Restore' : 'Archive'}
                                            </button>
                                            
                                            {/* 🌟 4. EDIT BUTTON PROTECTIONS */}
                                            {isPast ? (
                                                <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 border border-transparent px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">
                                                    <Settings size={16} />
                                                    Locked
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => navigate(isAdmin ? '/admin/create' : '/organizer/create', { state: { eventToEdit: event } })}
                                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white border border-transparent px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
                                                >
                                                    <Settings size={16} />
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
                        <h2 className={`text-xl font-bold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {modal.title}
                        </h2>
                        <p className="text-gray-600 font-medium mb-6">{modal.message}</p>
                        <div className="flex justify-end">
                            <button onClick={() => setModal({ show: false, type: '', title: '', message: '' })} className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-sm">
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}