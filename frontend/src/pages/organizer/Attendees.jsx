import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Mail, CheckCircle2, Download, 
  Users, UserCheck, DollarSign, Calendar, XCircle, Filter, MoreVertical, Ban, RefreshCcw
} from 'lucide-react';

export default function Attendees() {
  // Database & UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [attendees, setAttendees] = useState([]); 
  const [events, setEvents] = useState([]); 
  const [selectedEventId, setSelectedEventId] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
  
  // 🌟 NEW: State to track which 3-dot menu is open
  const [activeDropdown, setActiveDropdown] = useState(null);

  // 🌟 NEW: Close the dropdown if the user clicks anywhere else on the screen
  useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user?.role === 'Admin';
        
        const eventEndpoint = isAdmin 
          ? 'http://localhost:3000/events' 
          : `http://localhost:3000/events/organizer/${user.id}`;

        const [eventsRes, attendeesRes] = await Promise.all([
          axios.get(eventEndpoint),
          axios.get('http://localhost:3000/attendees')
        ]);

        setEvents(eventsRes.data);
        setAttendees(attendeesRes.data);

        if (eventsRes.data.length > 0) {
          setSelectedEventId(eventsRes.data[0].id.toString());
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper Functions
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Data Processing & Filtering
  const eventAttendees = attendees.filter(a => String(a.eventId) === String(selectedEventId));
  
  const filteredList = eventAttendees.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          person.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || person.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeAttendees = eventAttendees.filter(a => a.status !== 'Cancelled');
  const cancelledCount = eventAttendees.filter(a => a.status === 'Cancelled').length;
  
  const totalRegistered = activeAttendees.length;
  const checkedInCount = activeAttendees.filter(a => a.status === 'Checked In').length;
  const totalRevenue = activeAttendees.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);

  // Actions
  const handleManualCheckIn = async (ticketId) => {
    try {
      await axios.post('http://localhost:3000/attendees/scan', { ticketId });
      
      setAttendees(prev => prev.map(a => 
        a.ticketId === ticketId ? { ...a, status: 'Checked In' } : a
      ));
      
      setModal({ show: true, type: 'success', title: 'Checked In', message: 'Attendee manually checked in!' });
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Error', message: 'Failed to check in attendee.' });
    }
  };

  // 🌟 NEW: Function to handle extra actions from the 3-dot menu
  const handleUpdateStatus = async (ticketId, newStatus) => {
    setActiveDropdown(null); // Close menu
    try {
      // Note: You will need to create this endpoint in your backend eventually!
      // await axios.patch(`http://localhost:3000/attendees/${ticketId}/status`, { status: newStatus });
      
      setAttendees(prev => prev.map(a => 
        a.ticketId === ticketId ? { ...a, status: newStatus } : a
      ));
      
      setModal({ show: true, type: 'success', title: 'Status Updated', message: `Ticket is now marked as ${newStatus}.` });
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Error', message: 'Failed to update ticket status.' });
    }
  };

  const downloadCSV = () => {
    if (filteredList.length === 0) {
      setModal({ show: true, type: 'error', title: 'No Data', message: 'No data to export for this event!' });
      return;
    }

    const headers = ["ID", "Name", "Email", "Ticket ID", "Status", "Amount Paid"];
    const csvRows = [
      headers.join(','),
      ...filteredList.map(row => [
        row.id,
        `"${row.name}"`, 
        row.email,
        row.ticketId,
        row.status,
        row.amountPaid || '0'
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees_event_${selectedEventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="w-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendee Manager</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">View, manage, and check in your guests.</p>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
        >
          <Download size={18} strokeWidth={2.5} />
          Export CSV
        </button>
      </div>

      {events.length > 0 ? (
        <>
          <div className="mb-8 max-w-md">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Calendar size={14} /> Select Event
            </label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition-all cursor-pointer"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({new Date(event.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Users size={28} strokeWidth={2} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Registrations</span>
                <span className="block text-3xl font-extrabold text-gray-900">{totalRegistered}</span>
                {cancelledCount > 0 && <span className="text-xs font-bold text-red-400 mt-1 block">{cancelledCount} Cancelled</span>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <UserCheck size={28} strokeWidth={2} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Checked In</span>
                <div className="flex items-baseline gap-2">
                  <span className="block text-3xl font-extrabold text-gray-900">{checkedInCount}</span>
                  <span className="text-gray-400 font-bold text-sm">/ {totalRegistered}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                <DollarSign size={28} strokeWidth={2} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue Collected</span>
                <span className="block text-3xl font-extrabold text-gray-900">₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or ticket ID..."
                  className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm font-medium transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Filter size={18} className="text-gray-400 hidden sm:block" />
                <select
                  className="bg-white border border-gray-200 text-gray-700 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 shadow-sm appearance-none cursor-pointer w-full sm:w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Attendee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                        No attendees found matching your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((person) => {
                      const isCancelled = person.status === 'Cancelled';
                      
                      return (
                        <tr key={person.id} className={`transition-colors group ${isCancelled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50/80'}`}>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                                isCancelled ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {getInitials(person.name)}
                              </div>
                              <div>
                                <div className={`font-extrabold ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {person.name}
                                </div>
                                <div className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                                  <Mail size={12} /> {person.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                              {person.ticketId}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${
                              person.status === 'Checked In' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              person.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {person.status === 'Checked In' && <CheckCircle2 size={14} />}
                              {person.status === 'Cancelled' && <XCircle size={14} />}
                              {person.status === 'Pending' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                              {person.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              
                              {isCancelled ? (
                                <span className="text-xs font-bold text-red-400 px-3 py-1.5">Voided</span>
                              ) : person.status !== 'Checked In' ? (
                                <button 
                                  onClick={() => handleManualCheckIn(person.ticketId)}
                                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-transparent rounded-lg text-xs font-bold transition-all shadow-sm"
                                >
                                  <CheckCircle2 size={14} /> Check In
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-gray-400 px-3 py-1.5 flex items-center gap-1">
                                  <CheckCircle2 size={14} /> Done
                                </span>
                              )}

                              {/* 🌟 NEW: Functional 3-Dot Menu */}
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setActiveDropdown(activeDropdown === person.id ? null : person.id)}
                                  className={`p-1.5 rounded-lg transition ${activeDropdown === person.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                                >
                                  <MoreVertical size={18} />
                                </button>

                                {/* Dropdown Container */}
                                {activeDropdown === person.id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                                    <div className="py-1">
                                      
                                      {person.status === 'Checked In' && (
                                        <button 
                                          onClick={() => handleUpdateStatus(person.ticketId, 'Pending')}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                          <RefreshCcw size={14} /> Undo Check-in
                                        </button>
                                      )}
                                      
                                      {person.status === 'Cancelled' ? (
                                        <button 
                                          onClick={() => handleUpdateStatus(person.ticketId, 'Pending')}
                                          className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                                        >
                                          <CheckCircle2 size={14} /> Restore Ticket
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            if (window.confirm(`Are you sure you want to cancel ${person.name}'s ticket?`)) {
                                              handleUpdateStatus(person.ticketId, 'Cancelled');
                                            }
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium border-t border-gray-50"
                                        >
                                          <Ban size={14} /> Cancel Ticket
                                        </button>
                                      )}
                                      
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center shadow-sm mt-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
          <p className="text-gray-500 max-w-sm mb-0">
            You haven't created any events yet! Create one first to start managing attendees.
          </p>
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