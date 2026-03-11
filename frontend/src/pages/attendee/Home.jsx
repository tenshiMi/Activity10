import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Search, Ticket, LogIn, CheckCircle } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]); // 🌟 NEW: Track user's tickets
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // 🌟 NEW: Filter state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = user && token;

  // FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch all events
        const eventsRes = await axios.get('http://localhost:3000/events');
        setEvents(eventsRes.data);

        // 🌟 NEW: If logged in, fetch attendees to find out which events this user is going to!
        if (isLoggedIn && user?.email) {
          const attendeesRes = await axios.get('http://localhost:3000/attendees');
          // Filter attendees to just this user's email, then map to an array of event IDs
          const myTix = attendeesRes.data.filter(a => a.email === user.email);
          setMyRegistrations(myTix.map(t => String(t.eventId)));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [isLoggedIn, user?.email]);

  // 🌟 NEW: Extract unique categories for the filter pills
  const categories = ['All', ...new Set(events.filter(e => !e.isArchived).map(e => e.category).filter(Boolean))];

  // 🌟 FIX: Filter Logic now hides archived events AND handles categories!
  const filteredEvents = events.filter(event => {
    if (event.isArchived) return false;
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 🌟 NEW: Helper to assign cool gradient colors based on category keywords
  const getCategoryStyle = (category) => {
    const lowerCat = category?.toLowerCase() || '';
    if (lowerCat.includes('nightlife') || lowerCat.includes('party')) return 'from-purple-600 to-pink-500';
    if (lowerCat.includes('tech') || lowerCat.includes('conference')) return 'from-blue-600 to-cyan-500';
    if (lowerCat.includes('concert') || lowerCat.includes('music')) return 'from-orange-500 to-red-500';
    if (lowerCat.includes('festival') || lowerCat.includes('expo')) return 'from-green-500 to-teal-500';
    if (lowerCat.includes('theater') || lowerCat.includes('comedy')) return 'from-indigo-600 to-purple-600';
    if (lowerCat.includes('sport')) return 'from-yellow-500 to-orange-500';
    return 'from-blue-600 to-blue-800'; // Default fallback
  };

  // 🌟 NEW: Helper to format "2026-08-21 • 20:00" to "Aug 21, 2026 • 8:00 PM"
  const formatDateTime = (dateStr, timeStr) => {
    try {
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      let formattedTime = timeStr;
      if (timeStr) {
          const [hours, minutes] = timeStr.split(':');
          const h = parseInt(hours, 10);
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 || 12;
          formattedTime = `${h12}:${minutes} ${ampm}`;
      }
      return `${formattedDate} • ${formattedTime}`;
    } catch {
      return `${dateStr} • ${timeStr}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Events</h1>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isLoggedIn ? (
              <Link 
                to="/my-tickets"
                className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-bold shadow-sm"
              >
                <Ticket size={20} />
                <span className="hidden md:inline">My Tickets</span>
              </Link>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-bold shadow-sm"
              >
                <Ticket size={20} />
                <span className="hidden md:inline">My Tickets</span>
              </button>
            )}
          </div>
        </div>

        {/* 🌟 NEW: Category Filter Pills */}
        {!loading && categories.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                  selectedCategory === cat 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-gray-400 font-medium text-lg">Loading amazing events...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isGoing = myRegistrations.includes(String(event.id)); // 🌟 CHECK IF USER BOUGHT THIS TICKET

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                  
                  {/* 🌟 NEW: Dynamic Gradient Banner */}
                  <div className={`h-40 bg-gradient-to-br ${getCategoryStyle(event.category)} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                    <span className="text-white text-2xl font-extrabold tracking-widest opacity-30 drop-shadow-md">
                      {event.category?.split('/')[0] || event.category}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2.5 text-gray-500 mb-6">
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Calendar size={16} /></div>
                        {/* 🌟 NEW: Human Readable Date */}
                        <span className="text-gray-700">{formatDateTime(event.date, event.time)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><MapPin size={16} /></div>
                        <span className="text-gray-700 truncate">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100">
                      {isLoggedIn ? (
                        <>
                          {isGoing ? (
                            /* 🌟 NEW: "Already Registered" Badge */
                            <span className="flex items-center gap-1.5 font-bold text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                              <CheckCircle size={16} /> You're Going
                            </span>
                          ) : (
                            <span className="font-extrabold text-xl text-green-600">
                              {event.price === '0' || event.price === 'Free' ? 'Free' : `₱${event.price}`}
                            </span>
                          )}
                          <Link 
                            to={`/event/${event.id}`} 
                            className={`${isGoing ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm`}
                          >
                            View Details
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-500 font-medium italic">Login to register</span>
                          <button 
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                          >
                            <LogIn size={16} /> Login
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredEvents.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center bg-white p-16 rounded-2xl border border-gray-200 shadow-sm mt-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No events found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term to find what you're looking for!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}