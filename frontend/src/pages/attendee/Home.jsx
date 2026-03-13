import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Search, Ticket, CheckCircle } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); 
  const [loading, setLoading] = useState(true);

  // Check authentication
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!(user && token);

  // FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const eventsRes = await axios.get('http://localhost:3000/events');
        setEvents(eventsRes.data);

        if (isLoggedIn && user?.email) {
          const attendeesRes = await axios.get('http://localhost:3000/attendees');
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

  const categories = ['All', ...new Set(events.filter(e => !e.isArchived).map(e => e.category).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    if (event.isArchived) return false;
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Premium Minimalist Gradients (Used as a fallback!)
  const getCategoryStyle = (category) => {
    const lowerCat = category?.toLowerCase() || '';
    if (lowerCat.includes('nightlife') || lowerCat.includes('party')) return 'from-slate-900 to-indigo-950';
    if (lowerCat.includes('tech') || lowerCat.includes('conference')) return 'from-gray-900 to-slate-800';
    if (lowerCat.includes('concert') || lowerCat.includes('music')) return 'from-zinc-900 to-stone-800';
    if (lowerCat.includes('festival') || lowerCat.includes('expo')) return 'from-emerald-950 to-teal-900';
    if (lowerCat.includes('theater') || lowerCat.includes('comedy')) return 'from-slate-800 to-gray-900';
    if (lowerCat.includes('sport')) return 'from-orange-950 to-amber-950';
    return 'from-gray-800 to-gray-900'; // Sleek dark default
  };

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
        
        {/* Minimalist Hero & Search Area */}
        <div className="mb-10 text-center md:text-left pt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find your next experience.
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search for events, artists, or venues..." 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:outline-none shadow-sm transition text-gray-800 font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* ONLY show My Tickets if logged in! */}
            {isLoggedIn && (
              <Link 
                to="/my-tickets"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-6 py-3.5 rounded-2xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition font-bold shadow-sm w-full md:w-auto shrink-0"
              >
                <Ticket size={20} />
                <span>My Tickets</span>
              </Link>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        {!loading && categories.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
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
              const isGoing = myRegistrations.includes(String(event.id)); 

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col">
                  
                  {/* 🌟 UPGRADED: Real Image Banner with Gradient Fallback */}
                  <div className="h-40 relative overflow-hidden shrink-0 bg-gray-100">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(event.category)} flex items-center justify-center`}>
                        <span className="text-white text-2xl font-extrabold tracking-widest opacity-30 drop-shadow-md">
                          {event.category?.split('/')[0] || event.category}
                        </span>
                      </div>
                    )}
                    {/* Shadow overlay applied to BOTH images and gradients */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 pointer-events-none"></div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 text-gray-500 mb-6 flex-1">
                      <div className="flex items-start gap-3 text-sm font-medium">
                        <div className="p-1.5 bg-gray-50 rounded-md text-gray-400 mt-0.5"><Calendar size={16} /></div>
                        <span className="text-gray-700 leading-snug">{formatDateTime(event.date, event.time)}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm font-medium">
                        <div className="p-1.5 bg-gray-50 rounded-md text-gray-400 mt-0.5"><MapPin size={16} /></div>
                        <span className="text-gray-700 leading-snug line-clamp-2">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-5 border-t border-gray-100">
                      
                      {isLoggedIn && isGoing ? (
                        <span className="flex items-center gap-1.5 font-bold text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                          <CheckCircle size={16} /> You're Going
                        </span>
                      ) : (
                        <span className="font-extrabold text-xl text-gray-900 tracking-tight">
                          {event.price === '0' || event.price === 'Free' ? 'Free' : `₱${event.price}`}
                        </span>
                      )}
                      
                      <Link 
                        to={`/event/${event.id}`} 
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                          isLoggedIn && isGoing 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        View Event
                      </Link>

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