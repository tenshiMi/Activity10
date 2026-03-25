import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, Calendar, MapPin, Trash2, AlertCircle, XCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🌟 NEW: Custom Modals
  const [cancelModal, setCancelModal] = useState({ show: false, ticketId: null, attendeeId: null, eventTitle: '', organizerId: null });
  const [statusModal, setStatusModal] = useState({ show: false, type: 'success', title: '', message: '' });

  let user = null;
  let token = null;
  let isLoggedIn = false;

  try {
    const userData = localStorage.getItem('user');
    user = userData ? JSON.parse(userData) : null;
    token = localStorage.getItem('token');
    isLoggedIn = user && token;
  } catch (err) {
    console.error('Error parsing user data:', err);
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
          // Show newest tickets first
          setTickets(myTickets.reverse());
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

  const getEventInfo = (eventId) => {
    return events.find(e => e.id.toString() === String(eventId)) || {};
  };

  // 🌟 NEW: Advanced Cancellation Logic
  const handleCancel = async () => {
    try {
      // 🌟 FIX 1: Changed back to DELETE so your backend accepts it and allows re-purchasing!
      await axios.delete(`http://localhost:3000/attendees/${cancelModal.attendeeId}`);

      // 🌟 FIX 2: Still send the notification to the Organizer!
      if (cancelModal.organizerId) {
        await axios.post('http://localhost:3000/notifications', {
          userId: cancelModal.organizerId,
          title: 'Ticket Cancelled ⚠️',
          message: `${user.name || 'An attendee'} cancelled their ticket for "${cancelModal.eventTitle}".`,
          type: 'SYSTEM'
        });
      }

      // 🌟 FIX 3: Update the UI to show the cool "Cancelled" stamp until they refresh the page
      setTickets(tickets.map(t => 
        t.id === cancelModal.attendeeId ? { ...t, status: 'Cancelled' } : t
      ));

      setCancelModal({ show: false, ticketId: null, attendeeId: null, eventTitle: '', organizerId: null });
      setStatusModal({ show: true, type: 'success', title: 'Ticket Cancelled', message: 'Your registration has been successfully cancelled.' });
    } catch (error) {
      console.error("Error cancelling:", error);
      setCancelModal({ show: false, ticketId: null, attendeeId: null, eventTitle: '', organizerId: null });
      setStatusModal({ show: true, type: 'error', title: 'Error', message: 'Failed to cancel ticket.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* 🌟 PREMIUM BREADCRUMB & HEADER */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors mb-6 group">
            <div className="bg-white border border-gray-200 p-1.5 rounded-lg group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors shadow-sm">
              <ArrowLeft size={16} strokeWidth={2.5} />
            </div>
            Back to Events
          </Link>
          
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <Ticket className="text-blue-600 w-10 h-10" /> My Digital Wallet
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Manage your event tickets and QR passes.</p>
        </div>

        {/* ERROR STATE */}
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-10 max-w-md mx-auto shadow-sm">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Error Loading Wallet</h2>
              <p className="text-gray-600 mb-8 font-medium">{error}</p>
              <button onClick={() => { setError(null); setLoading(true); window.location.reload(); }} className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">
                Try Again
              </button>
            </div>
          </div>

        /* LOGGED OUT STATE */
        ) : !isLoggedIn ? (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md mx-auto shadow-sm">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="text-blue-600" size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Please Log In</h2>
              <p className="text-gray-500 mb-8 font-medium">You need to be logged in to view your tickets.</p>
              <Link to="/login" className="flex items-center justify-center w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95">
                Log In
              </Link>
            </div>
          </div>

        /* LOADING STATE */
        ) : loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold text-lg tracking-tight">Retrieving your wallet...</p>
            </div>
          </div>

        /* EMPTY WALLET STATE */
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto mt-4">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket size={40} strokeWidth={2} />
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Your wallet is empty</h3>
            <p className="text-gray-500 font-medium mb-8 text-lg">You haven't registered for any events yet. Discover amazing experiences happening near you!</p>
            <Link to="/" className="inline-flex items-center justify-center bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 text-lg">
              Browse Events
            </Link>
          </div>

        /* 🌟 TICKETS GRID */
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map(ticket => {
              const event = getEventInfo(ticket.eventId);
              const isCheckedIn = ticket.status === 'Checked In';
              const isCancelled = ticket.status === 'Cancelled';

              return (
                <div key={ticket.id} className={`flex flex-col drop-shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-300 transform ${isCancelled ? 'opacity-60 grayscale-[0.6]' : 'hover:drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1'}`}>
                  
                  {/* TOP STUB (QR Code) */}
                  <div className={`rounded-t-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden ${isCancelled ? 'bg-slate-800' : 'bg-slate-950'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
                    
                    <div className={`bg-white p-3 rounded-2xl shadow-inner relative z-10 mb-5 ${isCancelled ? 'opacity-50 blur-[2px]' : ''}`}>
                      {/* 🌟 ACTUAL QR CODE COMPONENT */}
                      <QRCodeSVG value={ticket.ticketId} size={150} level="H" />
                    </div>
                    
                    <p className={`font-mono tracking-[0.25em] text-sm font-bold relative z-10 ${isCancelled ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {ticket.ticketId}
                    </p>
                    
                    <span className={`mt-4 relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                      isCheckedIn 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : isCancelled
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  {/* 🌟 PERFORATED DIVIDER WITH CUTOUTS */}
                  <div className="bg-white relative h-10 -my-5 z-20 flex items-center overflow-hidden">
                    <div className="absolute -left-5 w-10 h-10 bg-gray-50/50 rounded-full border-r border-gray-200 shadow-inner"></div>
                    <div className="w-full border-t-[3px] border-dashed border-gray-200"></div>
                    <div className="absolute -right-5 w-10 h-10 bg-gray-50/50 rounded-full border-l border-gray-200 shadow-inner"></div>
                  </div>

                  {/* BOTTOM STUB (Details) */}
                  <div className="bg-white rounded-b-[2rem] border border-t-0 border-gray-100 p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-2xl font-extrabold mb-6 leading-tight line-clamp-2 tracking-tight ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {event.title || 'Unknown Event'}
                      </h3>
                      
                      <div className="space-y-4 mb-8">
                        <div className={`flex items-start gap-3 text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Calendar size={20} className={`${isCancelled ? 'text-gray-300' : 'text-blue-500'} shrink-0`} strokeWidth={2.5} />
                          <span className="leading-snug">{formatDateTime(event.date, event.time)}</span>
                        </div>
                        <div className={`flex items-start gap-3 text-sm font-medium ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin size={20} className={`${isCancelled ? 'text-gray-300' : 'text-red-500'} shrink-0`} strokeWidth={2.5} />
                          <span className="truncate leading-snug">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Button Logic */}
                    {isCheckedIn ? (
                      <div className="w-full py-3.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl text-sm font-extrabold text-center flex items-center justify-center gap-2 cursor-not-allowed">
                         <CheckCircle2 size={18} strokeWidth={2.5} /> TICKET USED
                      </div>
                    ) : isCancelled ? (
                      <div className="w-full py-3.5 bg-red-50 text-red-400 border border-red-100 rounded-xl text-sm font-extrabold text-center flex items-center justify-center gap-2 cursor-not-allowed">
                         <XCircle size={18} strokeWidth={2.5} /> CANCELLED
                      </div>
                    ) : (
                      <button 
                        onClick={() => setCancelModal({ show: true, ticketId: ticket.ticketId, attendeeId: ticket.id, eventTitle: event.title, organizerId: event.organizerId })}
                        className="w-full py-3.5 bg-white border-2 border-red-100 text-red-500 rounded-xl text-sm font-extrabold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Trash2 size={18} strokeWidth={2.5} /> CANCEL TICKET
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌟 PREMIUM CONFIRM CANCELLATION MODAL */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center animate-in zoom-in duration-200 scale-100">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 border-8 border-red-100/50 text-red-600">
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold mb-3 text-gray-900 tracking-tight">Cancel Ticket?</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Are you sure you want to cancel your registration for <strong className="text-gray-900">{cancelModal.eventTitle}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCancelModal({ show: false, ticketId: null, attendeeId: null, eventTitle: '', organizerId: null })} 
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Keep It
              </button>
              <button 
                onClick={handleCancel} 
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm text-center animate-in zoom-in duration-200 scale-100">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-8 ${statusModal.type === 'error' ? 'bg-red-50 border-red-100/50 text-red-600' : 'bg-emerald-50 border-emerald-100/50 text-emerald-500'}`}>
              {statusModal.type === 'error' ? <AlertCircle size={32} strokeWidth={2.5} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
            </div>
            <h2 className={`text-2xl font-extrabold mb-2 tracking-tight ${statusModal.type === 'error' ? 'text-red-600' : 'text-gray-900'}`}>{statusModal.title}</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">{statusModal.message}</p>
            <button onClick={() => setStatusModal({ show: false, type: '', title: '', message: '' })} className="w-full py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold transition-all shadow-md active:scale-95 cursor-pointer">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}