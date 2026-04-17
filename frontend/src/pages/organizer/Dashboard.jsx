import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
    Plus, Calendar, MapPin, Settings, Archive, Ticket,
    Image as ImageIcon, TrendingUp, CheckCircle,
    Search, Filter, LayoutGrid, List, Eye, X,
    Users, Wallet, Sparkles, ArrowUpRight, RotateCcw
} from 'lucide-react';

export default function OrganizerDashboard() {
    const [events, setEvents] = useState([]);
    const [allAttendees, setAllAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'Admin';

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [viewMode, setViewMode] = useState('grid');
    const [attendeesModal, setAttendeesModal] = useState({ show: false, eventTitle: '', eventId: null });

    // RESTORED: Advanced date filters
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // 🌟 Fetch data with a silent background polling option
    const fetchEvents = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const endpoint = isAdmin
                ? '/events'
                : `/events/organizer/${user.id}`;

            const [eventsRes, attendeesRes] = await Promise.all([
                api.get(endpoint),
                api.get('/attendees')
            ]);

            setEvents(eventsRes.data);
            setAllAttendees(attendeesRes.data);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // 🌟 Real-time data polling every 15 seconds
    useEffect(() => {
        fetchEvents(true);
        const interval = setInterval(() => fetchEvents(false), 15000);
        return () => clearInterval(interval);
    }, [isAdmin, user?.id]);

    const getTicketsSold = (event) => {
        return allAttendees.filter(a => String(a.eventId) === String(event.id) && a.status !== 'Cancelled').length;
    };

    const getRevenueNumber = (event) => {
        const sold = getTicketsSold(event);
        let price = 0;
        if (typeof event.price === 'number') price = event.price;
        else if (typeof event.price === 'string') {
            const parsed = parseFloat(event.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed)) price = parsed;
        }
        return sold * price;
    };

    const getRevenue = (event) => {
        const total = getRevenueNumber(event);
        return total > 0
            ? `₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '₱0.00';
    };

    const formatDate = (dateString) => {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const isEventDone = (dateString, timeString) => {
        const eventDateTime = new Date(`${dateString}T${timeString || '00:00:00'}`);
        return eventDateTime < new Date();
    };

    const handleArchive = async (event) => {
        const isPast = isEventDone(event.date, event.time);
        const ticketsSold = getTicketsSold(event);
        const actionText = event.isArchived ? "unarchive" : "archive";

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
                await api.delete(`/events/${event.id}`);
                setEvents(events.map(e => e.id === event.id ? { ...e, isArchived: !event.isArchived } : e));
            } catch (error) {
                setModal({ show: true, type: 'error', title: 'Action Failed', message: `Failed to ${actionText} event.` });
            }
        }
    };

    // RESTORED: Date filters cleared
    const clearAllFilters = () => {
        setSearchQuery('');
        setCategoryFilter('All');
        setStatusFilter('All');
        setLocationFilter('');
        setDateFrom('');
        setDateTo('');
        setSortBy('newest');
    };

    const filteredEvents = useMemo(() => {
        const result = events.filter(event => {
            const title = event.title?.toLowerCase() || '';
            const location = event.location?.toLowerCase() || '';
            const category = event.category || '';

            const matchesSearch =
                title.includes(searchQuery.toLowerCase()) ||
                location.includes(searchQuery.toLowerCase());

            const matchesCategory =
                categoryFilter === 'All' || category.includes(categoryFilter);

            const matchesStatus =
                statusFilter === 'All' ||
                (statusFilter === 'Active' && !event.isArchived) ||
                (statusFilter === 'Archived' && event.isArchived);

            const matchesLocation =
                !locationFilter || location.includes(locationFilter.toLowerCase());

            // RESTORED: Date filtering logic
            const eventDate = event.date ? new Date(event.date) : null;
            const fromOk = !dateFrom || (eventDate && eventDate >= new Date(dateFrom));
            const toOk = !dateTo || (eventDate && eventDate <= new Date(dateTo));

            return matchesSearch && matchesCategory && matchesStatus && matchesLocation && fromOk && toOk;
        });

        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'mostTickets') return getTicketsSold(b) - getTicketsSold(a);
            if (sortBy === 'highestRevenue') return getRevenueNumber(b) - getRevenueNumber(a);
            if (sortBy === 'titleAZ') return (a.title || '').localeCompare(b.title || '');
            return 0;
        });

        return result;
    }, [events, searchQuery, categoryFilter, statusFilter, locationFilter, dateFrom, dateTo, sortBy]);

    const currentEventAttendees = allAttendees.filter(a =>
        String(a.eventId) === String(attendeesModal.eventId) && a.status !== 'Cancelled'
    );

    const defaultImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";

    const dashboardStats = useMemo(() => {
        const totalEvents = events.length;
        const activeEvents = events.filter(e => !e.isArchived && !isEventDone(e.date, e.time)).length;
        const totalAttendees = events.reduce((sum, e) => sum + getTicketsSold(e), 0);
        const totalRevenue = events.reduce((sum, e) => sum + getRevenueNumber(e), 0);

        return {
            totalEvents,
            activeEvents,
            totalAttendees,
            totalRevenue: `₱${totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        };
    }, [events, allAttendees]);

    return (
        <div className="w-full pb-24">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isAdmin ? 'All Platform Events' : 'My Events'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        Manage your upcoming events here.
                    </p>
                    <p className="text-gray-500 font-medium text-sm mt-2 max-w-2xl">
                        This dashboard allows organizers to monitor event performance, track attendees, and manage operations in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-200/60 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md flex items-center transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md flex items-center transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <Link
                        to={isAdmin ? '/admin/create' : '/organizer/create'}
                        className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-blue-600/20 whitespace-nowrap"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        Create New Event
                    </Link>
                </div>
            </div>

            {/* TOP ANALYTICS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calendar size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{dashboardStats.totalEvents}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">All created events</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Events</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Sparkles size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{dashboardStats.activeEvents}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Currently running or upcoming</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Attendees</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                            <Users size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{dashboardStats.totalAttendees}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Tickets sold across events</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Wallet size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{dashboardStats.totalRevenue}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Estimated event earnings</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your events by title or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                        />
                    </div>

                    <div className="relative min-w-[180px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition appearance-none cursor-pointer text-sm font-bold text-gray-700"
                        >
                            <option value="All">All Categories</option>
                            <option value="Concert / Summit">Conference / Summit</option>
                            <option value="Concert / Live Music">Concert / Live Music</option>
                            <option value="Nightlife / Party">Nightlife / Party</option>
                            <option value="Sports / E-Sports">Sports / E-Sports</option>
                            <option value="Festival / Expo">Festival / Expo</option>
                            <option value="Theater / Comedy">Theater / Comedy</option>
                        </select>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition appearance-none cursor-pointer text-sm font-bold text-gray-700 min-w-[140px]"
                    >
                        <option value="Active">Active Only</option>
                        <option value="Archived">Archived Only</option>
                        <option value="All">All Statuses</option>
                    </select>
                </div>

                {/* RESTORED: Advanced Filters with 5-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-sm font-medium text-gray-700"
                    />

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-sm font-medium text-gray-700"
                    />

                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-sm font-medium text-gray-700"
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition appearance-none cursor-pointer text-sm font-bold text-gray-700"
                    >
                        <option value="newest">Sort: Newest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="mostTickets">Most Tickets Sold</option>
                        <option value="highestRevenue">Highest Revenue</option>
                        <option value="titleAZ">Title A-Z</option>
                    </select>

                    <button
                        onClick={clearAllFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition shadow-sm"
                    >
                        <RotateCcw size={16} />
                        Reset Filters
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            )}

            {!loading && filteredEvents.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500 max-w-md mx-auto font-medium">
                        No events match your current search or filters. Try adjusting your filters or create a new event to get started.
                    </p>

                    <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                        <button
                            onClick={clearAllFilters}
                            className="px-5 py-2.5 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition"
                        >
                            Clear Filters
                        </button>

                        <Link
                            to={isAdmin ? '/admin/create' : '/organizer/create'}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-600/20"
                        >
                            <Plus size={18} />
                            Create Event
                        </Link>
                    </div>
                </div>
            )}

            {/* GRID VIEW */}
            {!loading && filteredEvents.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const ticketsSold = getTicketsSold(event);
                        const isPast = isEventDone(event.date, event.time);
                        const disableArchive = !event.isArchived && !isPast && ticketsSold > 0;

                        return (
                            <div
                                key={event.id}
                                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 group flex flex-col ${
                                    event.isArchived
                                        ? 'border-gray-200 opacity-75 grayscale-[20%]'
                                        : 'border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
                                }`}
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {event.imageUrl || event.image ? (
                                        <img
                                            src={event.imageUrl || event.image || defaultImage}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <ImageIcon className="text-gray-300 w-12 h-12" />
                                    )}

                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {event.isArchived ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-gray-900/80 text-white uppercase tracking-wider">
                                                Archived
                                            </span>
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
                                                    {ticketsSold} <span className="text-gray-400 font-medium text-xs">/ {event.capacity || '∞'}</span>
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

                                        {/* RESTORED: "Manage Attendees" layout */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <button
                                                onClick={() => setAttendeesModal({ show: true, eventTitle: event.title, eventId: event.id })}
                                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-sm font-bold"
                                                title="View Attendees"
                                            >
                                                <Eye size={16} strokeWidth={2.5} />
                                                View
                                            </button>

                                            <button
                                                onClick={() => navigate(isAdmin ? '/admin/create' : '/organizer/create', { state: { eventToEdit: event } })}
                                                disabled={isPast}
                                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                                                    isPast
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                                                }`}
                                                title={isPast ? 'Locked' : 'Edit Event'}
                                            >
                                                <Settings size={16} />
                                                {isPast ? 'Locked' : 'Edit'}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => setAttendeesModal({ show: true, eventTitle: event.title, eventId: event.id })}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition text-sm font-bold"
                                            >
                                                Manage attendees
                                                <ArrowUpRight size={15} />
                                            </button>

                                            <button
                                                onClick={() => handleArchive(event)}
                                                disabled={disableArchive}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-sm font-bold ${
                                                    disableArchive
                                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : event.isArchived
                                                            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                            : 'bg-white text-orange-500 border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                                                }`}
                                                title={disableArchive ? "Cannot archive active events with attendees" : event.isArchived ? "Restore Event" : "Archive Event"}
                                            >
                                                <Archive size={16} strokeWidth={2.5} />
                                                {event.isArchived ? 'Restore' : 'Archive'}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* LIST VIEW */}
            {!loading && filteredEvents.length > 0 && viewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Event Details</th>
                                    <th className="p-4 font-semibold text-gray-600">Stats</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEvents.map(event => {
                                    const ticketsSold = getTicketsSold(event);
                                    const isPast = isEventDone(event.date, event.time);
                                    const disableArchive = !event.isArchived && !isPast && ticketsSold > 0;

                                    return (
                                        <tr key={event.id} className={`hover:bg-gray-50 transition ${event.isArchived ? 'bg-gray-50/50' : ''}`}>
                                            <td className="p-4">
                                                <p className={`font-bold text-base line-clamp-1 ${event.isArchived ? 'text-gray-500' : 'text-gray-900'}`}>{event.title}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(event.date)}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                                        <Ticket size={12} className="text-blue-500" /> {ticketsSold} / {event.capacity || '∞'} Sold
                                                    </span>
                                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                        <TrendingUp size={12} /> {getRevenue(event)} Rev
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {event.isArchived ? (
                                                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-600">Archived</span>
                                                ) : isPast ? (
                                                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700">Completed</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Active</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setAttendeesModal({ show: true, eventTitle: event.title, eventId: event.id })}
                                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                                                        title="View Attendees"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleArchive(event)}
                                                        disabled={disableArchive}
                                                        title={disableArchive ? "Cannot archive an event that has sold tickets." : "Archive Event"}
                                                        className={`p-2 rounded-lg transition cursor-pointer ${disableArchive ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : event.isArchived ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-orange-500 bg-orange-50 hover:bg-orange-100'}`}
                                                    >
                                                        <Archive size={16} />
                                                    </button>

                                                    {isPast ? (
                                                        <button disabled className="p-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" title="Locked">
                                                            <Settings size={16} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(isAdmin ? '/admin/create' : '/organizer/create', { state: { eventToEdit: event } })}
                                                            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                                                            title="Edit Event"
                                                        >
                                                            <Settings size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* FLOATING CREATE BUTTON */}
            <Link
                to={isAdmin ? '/admin/create' : '/organizer/create'}
                className="sm:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full font-bold shadow-xl shadow-blue-600/30 transition"
            >
                <Plus size={18} strokeWidth={2.5} />
                Create Event
            </Link>

            {/* VIEW ATTENDEES MODAL */}
            {attendeesModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in duration-200">
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Attendee List</h3>
                                <p className="text-slate-400 text-sm truncate max-w-md">{attendeesModal.eventTitle}</p>
                            </div>
                            <button
                                onClick={() => setAttendeesModal({ show: false, eventTitle: '', eventId: null })}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {currentEventAttendees.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-600">Attendee Name</th>
                                            <th className="p-4 font-semibold text-gray-600">Email</th>
                                            <th className="p-4 font-semibold text-gray-600">Amount Paid</th>
                                            <th className="p-4 font-semibold text-gray-600 text-right">Ticket ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentEventAttendees.map(att => (
                                            <tr key={att.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-bold text-gray-900">{att.name}</td>
                                                <td className="p-4 text-gray-600">{att.email || 'Email not provided'}</td>
                                                <td className="p-4 font-bold text-green-600">
                                                    {att.amountPaid === '0' || att.amountPaid === 'Free' ? 'Free' : `₱${att.amountPaid}`}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                                        {att.ticketId}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Ticket size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Tickets Sold Yet</h3>
                                    <p className="text-gray-500 text-sm">When users purchase tickets, they will appear here.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setAttendeesModal({ show: false, eventTitle: '', eventId: null })}
                                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success/Error Modal */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
                        <h2 className={`text-xl font-bold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {modal.title}
                        </h2>
                        <p className="text-gray-600 font-medium mb-6">{modal.message}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setModal({ show: false, type: '', title: '', message: '' })}
                                className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-sm"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}