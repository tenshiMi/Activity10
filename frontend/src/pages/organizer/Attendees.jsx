import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Mail, CheckCircle, Download, 
  Users, UserCheck, DollarSign, Calendar, XCircle 
} from 'lucide-react'; // 🌟 Added XCircle for cancelled badge

export default function Attendees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendees, setAttendees] = useState([]); 
  const [events, setEvents] = useState([]); 
  const [selectedEventId, setSelectedEventId] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

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

  const eventAttendees = attendees.filter(a => String(a.eventId) === String(selectedEventId));
  
  const filteredList = eventAttendees.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🌟 CRITICAL FIX: Only count ACTIVE tickets for stats!
  const activeAttendees = eventAttendees.filter(a => a.status !== 'Cancelled');
  const cancelledCount = eventAttendees.filter(a => a.status === 'Cancelled').length;
  
  const totalRegistered = activeAttendees.length;
  const checkedInCount = activeAttendees.filter(a => a.status === 'Checked In').length;
  const totalRevenue = activeAttendees.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);

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

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading attendee data...</div>;

  return (
    <div className="pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendee Manager</h1>
          <p className="text-gray-500">View, manage, and check in your guests.</p>
        </div>

        <button 
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm"      
          onClick={downloadCSV}
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {events.length > 0 ? (
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600"/> Select Event
          </label>
          <select 
            className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800 font-medium"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({new Date(event.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-8">
          You haven't created any events yet! Create one first to start managing attendees.
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Users size={28} /></div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Active Registrations</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalRegistered}</h3>
              {cancelledCount > 0 && <p className="text-xs text-red-400 mt-1">{cancelledCount} Cancelled</p>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-xl text-green-600"><UserCheck size={28} /></div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Checked In</p>
              <h3 className="text-2xl font-bold text-gray-900">{checkedInCount} <span className="text-sm text-gray-400 font-normal">/ {totalRegistered}</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl text-purple-600"><DollarSign size={28} /></div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase">Revenue Collected</p>
              <h3 className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-t-2xl border-b border-gray-200 flex items-center gap-3 shadow-sm">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, or ticket ID..." 
          className="flex-1 outline-none text-gray-700 bg-transparent"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Ticket ID</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredList.map((person) => {
              const isCancelled = person.status === 'Cancelled';
              
              return (
                <tr key={person.id} className={`transition group ${isCancelled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                  <td className="p-4">
                    <div className={`font-medium ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{person.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} /> {person.email}
                    </div>
                  </td>
                  
                  <td className="p-4 font-mono text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">{person.ticketId}</span>
                  </td>
                  
                  {/* 🌟 UPGRADED: Dynamic Status Badge */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      person.status === 'Checked In' ? 'bg-green-100 text-green-700' : 
                      person.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {person.status === 'Checked In' && <CheckCircle size={14} />}
                      {person.status === 'Cancelled' && <XCircle size={14} />}
                      {person.status}
                    </span>
                  </td>

                  {/* 🌟 UPGRADED: Hide Check In button for cancelled tickets */}
                  <td className="p-4 text-right">
                    {isCancelled ? (
                      <span className="text-sm font-semibold text-red-400 px-4 py-2">Void</span>
                    ) : person.status !== 'Checked In' ? (
                      <button 
                        onClick={() => handleManualCheckIn(person.ticketId)}
                        className="text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition"
                      >
                        Check In
                      </button>
                    ) : (
                      <span className="text-sm font-semibold text-gray-400 px-4 py-2">Done</span>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {filteredList.length === 0 && events.length > 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">
                    No attendees match your search.
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h2 className={`text-xl font-bold mb-4 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {modal.title}
            </h2>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setModal({ show: false, type: '', title: '', message: '' })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}