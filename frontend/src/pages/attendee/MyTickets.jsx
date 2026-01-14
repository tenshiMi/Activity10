import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, Calendar, MapPin, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // Get current user data with error handling
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
    setError('Invalid user session. Please log in again.');
    setLoading(false);
  }

  // 1. Fetch Data
  useEffect(() => {
    // Don't fetch if there's already an error
    if (error) return;

    const fetchData = async () => {
      try {
        const [attendeeRes, eventRes] = await Promise.all([
          axios.get('http://localhost:3000/attendees'),
          axios.get('http://localhost:3000/events')
        ]);

        // Filter for "My" tickets based on logged-in user's email
        if (isLoggedIn && user?.email) {
          const myTickets = attendeeRes.data.filter(ticket => ticket.email === user.email);
          setTickets(myTickets);
        } else {
          // If not logged in, show no tickets
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

  // 2. Handle Cancel
  const handleCancel = async (ticketId, attendeeId) => {
    if (window.confirm(`Are you sure you want to cancel Ticket ${ticketId}?`)) {
      try {
        await axios.delete(`http://localhost:3000/attendees/${attendeeId}`);
        // Remove from UI
        setTickets(tickets.filter(t => t.id !== attendeeId));
        setModal({
          show: true,
          type: 'success',
          title: 'Success',
          message: 'Ticket cancelled successfully.'
        });
      } catch (error) {
        console.error("Error cancelling:", error);
        setModal({
          show: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to cancel ticket.'
        });
      }
    }
  };

  const getEventInfo = (eventId) => {
    return events.find(e => e.id.toString() === eventId) || {};
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <Ticket className="text-blue-600" /> My Tickets
      </h1>

      {error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <Ticket className="text-red-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Tickets</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : !isLoggedIn ? (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
            <Ticket className="text-yellow-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Please Log In</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your tickets.</p>
            <Link
              to="/auth/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="text-gray-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Tickets Found</h2>
          <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => {
            const event = getEventInfo(ticket.eventId);
            return (
              <div key={ticket.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
                
                {/* QR Code Section */}
                <div className="bg-gray-900 p-6 flex justify-center items-center flex-col gap-2 text-white">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG value={ticket.ticketId} size={120} />
                  </div>
                  <p className="font-mono text-sm tracking-widest">{ticket.ticketId}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'Checked In' ? 'bg-green-500' : 'bg-yellow-500 text-black'}`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-6 flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{event.title || 'Unknown Event'}</h3>
                  
                  <div className="space-y-2 text-gray-600 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <button 
                    onClick={() => handleCancel(ticket.ticketId, ticket.id)}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 transition text-sm font-semibold"
                  >
                    <Trash2 size={16} /> Cancel Ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                onClick={() => setModal({ show: false, type: '', title: '', message: '' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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