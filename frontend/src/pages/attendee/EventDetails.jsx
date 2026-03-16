import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Share2, Calendar, Clock, MapPin, BellRing, CheckCircle } from 'lucide-react';
import RegistrationModal from '../../components/RegistrationModal'; 

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); 

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/events/${id}`);
        setEvent(response.data);

        if (isLoggedIn && user?.email) {
          const checkResponse = await axios.get(`http://localhost:3000/attendees/check-registration?email=${user.email}&eventId=${id}`);
          setIsRegistered(checkResponse.data.isRegistered);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id, isLoggedIn, user?.email]);

  const getCategoryStyle = (category) => {
    const lowerCat = category?.toLowerCase() || '';
    if (lowerCat.includes('nightlife') || lowerCat.includes('party')) return 'from-slate-900 to-indigo-950';
    if (lowerCat.includes('tech') || lowerCat.includes('conference')) return 'from-gray-900 to-slate-800';
    if (lowerCat.includes('concert') || lowerCat.includes('music')) return 'from-zinc-900 to-stone-800';
    if (lowerCat.includes('festival') || lowerCat.includes('expo')) return 'from-emerald-950 to-teal-900';
    if (lowerCat.includes('theater') || lowerCat.includes('comedy')) return 'from-slate-800 to-gray-900';
    if (lowerCat.includes('sport')) return 'from-orange-950 to-amber-950';
    return 'from-gray-800 to-gray-900'; 
  };

  const formatDate = (dateStr) => {
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } 
    catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${minutes} ${ampm}`;
    } catch { return timeStr; }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading event details...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Event not found.</div>;

  // 🌟 FIX: Check for BOTH bannerUrl and imageUrl so old events still show their pictures!
  const displayImage = event.bannerUrl || event.imageUrl;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-4xl mx-auto pt-6 px-4 sm:px-6">
        
        {/* Header Banner */}
        <div className={`relative h-64 md:h-80 rounded-t-3xl flex items-center justify-center overflow-hidden shadow-md ${!displayImage ? `bg-gradient-to-br ${getCategoryStyle(event.category)}` : 'bg-gray-100'}`}>
          
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 z-50 bg-black/30 hover:bg-black/50 border border-white/20 backdrop-blur-md text-white p-2.5 rounded-full transition cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          
          {displayImage ? (
            <>
              <img src={displayImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent h-24 pointer-events-none"></div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none"></div>
              <span className="text-white text-4xl md:text-6xl font-extrabold tracking-widest opacity-40 drop-shadow-lg uppercase text-center px-4 relative z-10 pointer-events-none">
                {event.category?.split('/')[0] || event.category}
              </span>
            </>
          )}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-b-3xl shadow-lg border-x border-b border-gray-100 p-6 md:p-10 -mt-2 relative z-10">
          
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {event.title}
            </h1>
            <button onClick={handleShare} className="text-gray-400 hover:text-gray-900 transition p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200 cursor-pointer">
              <Share2 size={24} />
            </button>
          </div>

          <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold tracking-wide mb-8 border border-gray-200">
            Registration Open
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-600"><Calendar size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-600"><Clock size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Time</p>
                <p className="text-lg font-medium text-gray-900">{formatTime(event.time)}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 md:col-span-2">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-600"><MapPin size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-lg font-medium text-gray-900">{event.location}</p>
              </div>
            </div>
          </div>

          {event.announcement && (
            <div className="mb-10 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                <BellRing size={20} className="text-yellow-600" />
                Special Announcement
              </h3>
              <p className="text-yellow-900 font-medium whitespace-pre-wrap leading-relaxed">
                {event.announcement}
              </p>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">About this Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
              {event.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)] p-4 md:p-6 z-40">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500 font-medium">Price per ticket</p>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {event.price === '0' || event.price === 'Free' ? 'Free' : `₱${event.price}`}
            </p>
          </div>
          
          <div className="w-full md:w-auto flex-1 md:flex-none flex justify-end">
            {!isLoggedIn ? (
               <button 
                 onClick={() => navigate('/login')}
                 className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-md cursor-pointer"
               >
                 Login to Register
               </button>
            ) : isRegistered ? (
               <Link 
                 to="/my-tickets"
                 className="w-full md:w-auto bg-green-50 text-green-700 border border-green-200 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-100 transition shadow-sm flex items-center justify-center gap-2"
               >
                 <CheckCircle size={22} /> You're Going
               </Link>
            ) : (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
               >
                 Register Now
               </button>
            )}
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          window.location.reload(); 
        }}
        eventTitle={event.title}
        eventId={event.id}
        eventPrice={event.price} 
        userInfo={isLoggedIn ? user : null}
      />
    </div>
  );
}