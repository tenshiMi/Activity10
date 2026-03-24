import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Archive, Settings, Calendar, MapPin, Ticket, 
  Search, Filter, Shield, User, LayoutGrid, List, Eye, X 
} from 'lucide-react';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]); 
  const [allAttendees, setAllAttendees] = useState([]); // 🌟 NEW: Track all attendees for the modal
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  // 🌟 NEW STATES for View Toggle and Attendees Modal
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [attendeesModal, setAttendeesModal] = useState({ show: false, eventTitle: '', eventId: null });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // 🌟 FIX: We now fetch attendees too!
      const [eventsRes, usersRes, attendeesRes] = await Promise.all([
        axios.get('http://localhost:3000/events'),
        axios.get('http://localhost:3000/users'),
        axios.get('http://localhost:3000/attendees')
      ]);
      setEvents(eventsRes.data);
      setUsers(usersRes.data);
      setAllAttendees(attendeesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  const handleArchive = async (eventId, title, isCurrentlyArchived) => {
    const action = isCurrentlyArchived ? "unarchive" : "archive";
    if (!window.confirm(`Are you sure you want to ${action} "${title}"?`)) return;

    try {
      await axios.delete(`http://localhost:3000/events/${eventId}`);
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, isArchived: !isCurrentlyArchived } : event
      ));
    } catch (error) {
      console.error(`Error trying to ${action} event:`, error);
      alert(`Failed to ${action} event. Please try again.`);
    }
  };

  const getOrganizerName = (organizerId) => {
    const org = users.find(u => String(u.id) === String(organizerId));
    return org ? org.name : 'Unknown Organizer';
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category?.includes(categoryFilter);
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Active' && !event.isArchived) || 
                          (statusFilter === 'Archived' && event.isArchived);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper to get attendees for the modal
  const currentEventAttendees = allAttendees.filter(a => 
    String(a.eventId) === String(attendeesModal.eventId) && a.status !== 'Cancelled'
  );

  if (loading) {
    return <div className="text-gray-500 animate-pulse text-lg font-medium p-8">Loading platform events...</div>;
  }

  return (
    <div className="pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            All Platform Events <Shield className="text-blue-500 w-6 h-6" />
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and monitor all events across the entire platform.</p>
        </div>
        <div className="flex items-center gap-4">
          
          {/* 🌟 NEW: View Toggle Switch */}
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

          <button
            onClick={() => navigate('/admin/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus size={20} /> Create Event
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search events by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition appearance-none cursor-pointer text-sm font-bold text-gray-700"
            >
              <option value="All">All Categories</option>
              <option value="Concert">Concerts</option>
              <option value="Party">Nightlife / Party</option>
              <option value="Sports">Sports / E-Sports</option>
              <option value="Festival">Festival / Expo</option>
              <option value="Theater">Theater / Comedy</option>
            </select>
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition appearance-none cursor-pointer text-sm font-bold text-gray-700 min-w-[120px]"
          >
            <option value="Active">Active Only</option>
            <option value="Archived">Archived Only</option>
            <option value="All">All Statuses</option>
          </select>
        </div>
      </div>

      {/* 🌟 CONDITIONAL RENDER: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            // 🌟 SECURITY FIX: Don't allow archiving if tickets are sold!
            const hasTicketsSold = Number(event.ticketsSold) > 0;
            const cannotArchive = hasTicketsSold && !event.isArchived;

            return (
            <div key={event.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 ${event.isArchived ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}>
              
              <div className="h-48 bg-gray-200 relative overflow-hidden group">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                )}
                
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${event.isArchived ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                    {event.isArchived ? 'Archived' : 'Published'}
                  </span>
                </div>
                
                {event.category && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-bold bg-white/90 text-blue-900 rounded-full shadow-sm backdrop-blur-md">
                      {event.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-extrabold text-gray-900 mb-4 line-clamp-1" title={event.title}>{event.title}</h3>
                
                <div className="space-y-2.5 mb-6 text-sm">
                  <div className="flex items-center text-gray-600 font-medium">
                    <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-gray-600 font-medium">
                    <MapPin className="w-4 h-4 mr-3 text-red-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 font-medium bg-gray-50 py-1.5 px-2 -ml-2 rounded-lg">
                    <User className="w-4 h-4 mr-3 text-purple-500" />
                    <span className="truncate">Hosted by <span className="font-bold text-gray-800">{getOrganizerName(event.organizerId)}</span></span>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tickets Sold</p>
                    <p className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-blue-500" />
                      {event.ticketsSold || 0} <span className="text-gray-400 font-medium">/ {event.capacity || '∞'}</span>
                    </p>
                  </div>
                  <div className="flex-1 bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Est. Revenue</p>
                    <p className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5">
                      ₱{(event.ticketsSold * event.price) || '0.00'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleArchive(event.id, event.title, event.isArchived)}
                      disabled={cannotArchive}
                      title={cannotArchive ? "Cannot archive an event that has sold tickets." : ""}
                      className={`flex items-center text-sm font-bold transition px-3 py-1.5 rounded-lg ${
                        cannotArchive
                          ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                          : event.isArchived 
                            ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                      }`}
                    >
                      <Archive className="w-4 h-4 mr-1.5" />
                      {event.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    
                    {/* 🌟 NEW: View Attendees Button */}
                    <button
                      onClick={() => setAttendeesModal({ show: true, eventTitle: event.title, eventId: event.id })}
                      className="flex items-center text-sm font-bold text-blue-600 hover:bg-blue-50 transition px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View
                    </button>
                  </div>

                  <button
                    onClick={() => navigate('/admin/create', { state: { eventToEdit: event } })}
                    className="flex items-center text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer shadow-sm"
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Edit
                  </button>
                </div>

              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* 🌟 CONDITIONAL RENDER: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Event Details</th>
                  <th className="p-4 font-semibold text-gray-600">Host</th>
                  <th className="p-4 font-semibold text-gray-600">Stats</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map(event => {
                  const hasTicketsSold = Number(event.ticketsSold) > 0;
                  const cannotArchive = hasTicketsSold && !event.isArchived;

                  return (
                    <tr key={event.id} className={`hover:bg-gray-50 transition ${event.isArchived ? 'bg-gray-50/50' : ''}`}>
                      <td className="p-4">
                        <p className={`font-bold text-base line-clamp-1 ${event.isArchived ? 'text-gray-500' : 'text-gray-900'}`}>{event.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(event.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin size={12}/> {event.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                          <User size={12} /> {getOrganizerName(event.organizerId)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <Ticket size={12} className="text-blue-500"/> {event.ticketsSold || 0} / {event.capacity || '∞'} Sold
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            ₱{(event.ticketsSold * event.price) || '0.00'} Rev
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${event.isArchived ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                          {event.isArchived ? 'Archived' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setAttendeesModal({ show: true, eventTitle: event.title, eventId: event.id })}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="View Attendees"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleArchive(event.id, event.title, event.isArchived)}
                            disabled={cannotArchive}
                            title={cannotArchive ? "Cannot archive an event that has sold tickets." : "Archive Event"}
                            className={`p-2 rounded-lg transition ${cannotArchive ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : event.isArchived ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                          >
                            <Archive size={16} />
                          </button>
                          <button
                            onClick={() => navigate('/admin/create', { state: { eventToEdit: event } })}
                            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition" title="Edit Event"
                          >
                            <Settings size={16} />
                          </button>
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

      {/* Empty State (Works for both views) */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm mt-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We couldn't find any events matching your current search or filter criteria. 
          </p>
        </div>
      )}

      {/* 🌟 NEW: VIEW ATTENDEES MODAL */}
      {attendeesModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in duration-200">
            
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Attendee List</h3>
                <p className="text-slate-400 text-sm truncate max-w-md">{attendeesModal.eventTitle}</p>
              </div>
              <button onClick={() => setAttendeesModal({ show: false, eventTitle: '', eventId: null })} className="text-slate-400 hover:text-white transition">
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
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}