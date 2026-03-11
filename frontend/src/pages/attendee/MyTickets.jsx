import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, Calendar, MapPin, Trash2, AlertCircle, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  let user = null;
  let token = null;
  let isLoggedIn = false;

  try {
    const userData = localStorage.getItem('user');
    user = userData ? JSON.parse(userData) : null;
    token = localStorage.getItem('token');
    isLoggedIn = user && token;
  } catch (err) {
    console.error('Error parsing user data from localStorage:', err);
    if (!error) setError('Invalid user session. Please log in again.');
  }

  useEffect(() => {
    if (error) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [attendeeRes, eventRes] = await Promise.all([
          axios.get('http://localhost:3000/attendees'),
          axios.get('http://localhost:3000/events')
        ]);

        if (isLoggedIn && user?.email) {
          const myTickets = attendeeRes.data.filter(ticket => ticket.email === user.email);
          setTickets(myTickets);
        } else {
          setTickets([]);
        }
        setEvents(eventRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading tickets:", err);
        setError('Failed to load tickets. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, user?.email, error]);

  const formatDateTime = (dateStr, timeStr) => {
    try {
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      let formattedTime = timeStr;
      if (timeStr) {
          const [hours, minutes] = timeStr.split(':');
          const h = parseInt(hours, 10);
          const ampm = h >= 12 ? 'PM' : 'AM';
          formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;
      }
      return `${formattedDate} • ${formattedTime}`;
    } catch {
      return `${dateStr} • ${timeStr}`;
    }
  };

  const handleCancel = async (ticketId, attendeeId) => {
    if (window.confirm(`Are you sure you want to cancel Ticket ${ticketId}?`)) {
      try {
        await axios.delete(`http://localhost:3000/attendees/${attendeeId}`);
        
        // 🌟 UPGRADED: Update the status in the UI instead of removing the ticket!
        setTickets(tickets.map(t => 
          t.id === attendeeId ? { ...t, status: 'Cancelled' } : t
        ));

        setModal({ show: true, type: 'success', title: 'Success', message: 'Ticket cancelled successfully.' });
      } catch (error) {
        console.error("Error cancelling:", error);
        setModal({ show: true, type: 'error', title: 'Error', message: 'Failed to cancel ticket.' });
      }
    }
  };

  const getEventInfo = (eventId) => {
    return events.find(e => e.id.toString() === String(eventId)) || {};
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3 tracking-tight">
          <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
            <Ticket size={28} />
          </div>
          My Tickets
        </h1>

        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
              <Ticket className="text-red-600 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Tickets</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button onClick={() => { setError(null); setLoading(true); window.location.reload(); }} className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md">
                Try Again
              </button>
            </div>
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
              <Ticket className="text-yellow-600 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Please Log In</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to view your tickets.</p>
              <Link to="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                Log In
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto mt-10">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No tickets found</h2>
            <p className="text-gray-500 mb-8">It looks like you haven't registered for any events yet. Start exploring to find your next experience!</p>
            <Link to="/" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
              Discover Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map(ticket => {
              const event = getEventInfo(ticket.eventId);
              const isCheckedIn = ticket.status === 'Checked In';
              const isCancelled = ticket.status === 'Cancelled'; // 🌟 Check for Cancelled status

              return (
                <div key={ticket.id} className={`flex flex-col drop-shadow-lg transition-all duration-300 transform ${isCancelled ? 'opacity-60 grayscale-[0.5]' : 'hover:drop-shadow-xl hover:-translate-y-1'}`}>
                  
                  {/* Top Ticket Stub */}
                  <div className={`rounded-t-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden ${isCancelled ? 'bg-gray-700' : 'bg-gray-900'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
                    
                    <div className={`bg-white p-3 rounded-2xl shadow-inner relative z-10 mb-4 ${isCancelled ? 'opacity-50 blur-[1px]' : ''}`}>
                      <QRCodeSVG value={ticket.ticketId} size={140} level="H" />
                    </div>
                    
                    <p className={`font-mono tracking-widest text-lg font-medium relative z-10 ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                      {ticket.ticketId}
                    </p>
                    
                    <span className={`mt-3 relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isCheckedIn 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : isCancelled
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' // 🌟 Red badge for cancelled
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  {/* Perforated Divider */}
                  <div className="bg-white relative h-8 -my-4 z-20 flex items-center overflow-hidden">
                    <div className="absolute -left-4 w-8 h-8 bg-gray-50 rounded-full border-r border-gray-100"></div>
                    <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                    <div className="absolute -right-4 w-8 h-8 bg-gray-50 rounded-full border-l border-gray-100"></div>
                  </div>

                  {/* Bottom Ticket Stub */}
                  <div className="bg-white rounded-b-3xl border border-t-0 border-gray-100 p-6 pt-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-xl font-bold mb-4 leading-tight line-clamp-2 ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {event.title || 'Unknown Event'}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className={`flex items-start gap-3 text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Calendar size={18} className={`${isCancelled ? 'text-gray-400' : 'text-blue-500'} shrink-0`} />
                          <span>{formatDateTime(event.date, event.time)}</span>
                        </div>
                        <div className={`flex items-start gap-3 text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin size={18} className={`${isCancelled ? 'text-gray-400' : 'text-blue-500'} shrink-0`} />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Button Logic */}
                    {isCheckedIn ? (
                      <div className="w-full py-3 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
                         <AlertCircle size={16} /> Ticket Used
                      </div>
                    ) : isCancelled ? (
                      <div className="w-full py-3 bg-red-50 text-red-400 border border-red-100 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
                         <XCircle size={16} /> Cancelled
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCancel(ticket.ticketId, ticket.id)}
                        className="w-full py-3 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 group"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Cancel Ticket
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h2 className={`text-xl font-bold mb-3 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {modal.title}
            </h2>
            <p className="text-gray-600 mb-6 font-medium">{modal.message}</p>
            <div className="flex justify-end">
              <button onClick={() => setModal({ show: false, type: '', title: '', message: '' })} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-bold transition shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}