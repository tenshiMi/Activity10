import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Calendar, MapPin, Search, Ticket, CheckCircle2, Sparkles, Flame, ArrowRight } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [allAttendees, setAllAttendees] = useState([]); // 🌟 NEW: Fetch all attendees to calculate capacity
  const [myRegistrations, setMyRegistrations] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); 
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = !!(user && token);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [eventsRes, attendeesRes] = await Promise.all([
          api.get('/events'),
          api.get('/attendees')
        ]);
        
        setEvents(eventsRes.data);
        setAllAttendees(attendeesRes.data);

        if (isLoggedIn && user?.email) {
          const myTix = attendeesRes.data.filter(a => a.email === user.email && a.status !== 'Cancelled');
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

  const categories = ['All', ...new Set(events.filter(e => !e.isArchived && e.status === 'Published').map(e => e.category).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    if (event.isArchived || event.status !== 'Published') return false;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 🌟 NEW: Separate the user's upcoming events for the quick-access section
  const myUpcomingEvents = filteredEvents.filter(event => myRegistrations.includes(String(event.id)));

  const getCategoryStyle = (category) => {
    const lowerCat = category?.toLowerCase() || '';
    if (lowerCat.includes('nightlife') || lowerCat.includes('party')) return 'from-slate-900 to-indigo-950';
    if (lowerCat.includes('tech') || lowerCat.includes('conference')) return 'from-gray-900 to-slate-800';
    if (lowerCat.includes('concert') || lowerCat.includes('music')) return 'from-zinc-900 to-stone-800';
    if (lowerCat.includes('festival') || lowerCat.includes('expo')) return 'from-emerald-950 to-teal-900';
    if (lowerCat.includes('theater') || lowerCat.includes('comedy')) return 'from-slate-800 to-gray-900';
    if (lowerCat.includes('sport')) return 'from-orange-950 to-amber-950';
    return 'from-slate-800 to-slate-900'; 
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
          formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;
      }
      return `${formattedDate} • ${formattedTime}`;
    } catch { return `${dateStr} • ${timeStr}`; }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200/80 pt-16 pb-20 px-6 mb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles size={14} /> Discover What's Next
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">experience.</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-5 top-4 text-gray-400" size={22} />
              <input 
                type="text" 
                placeholder="Search for events, artists, or venues..." 
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-lg shadow-gray-200/50 transition-all text-gray-900 font-medium text-lg"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* 🌟 NEW: UP NEXT SECTION (Quick Access) */}
        {isLoggedIn && myUpcomingEvents.length > 0 && searchTerm === '' && selectedCategory === 'All' && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Upcoming Events</h2>
            <Link to="/my-tickets" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-extrabold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 group">
            <Ticket size={18} strokeWidth={2.5} className="group-hover:-rotate-12 transition-transform" />
              View My Tickets
            </Link>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myUpcomingEvents.slice(0, 3).map(event => (
                <Link to={`/event/${event.id}`} key={`upcoming-${event.id}`} className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-blue-200 transition-all group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                    {event.imageUrl || event.bannerUrl ? (
                      <img src={event.imageUrl || event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(event.category)}`}></div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h4 className="font-extrabold text-slate-900 truncate">{event.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                      <Calendar size={12} className="text-blue-500" /> {formatDateTime(event.date, event.time)}
                    </div>
                    <span className="mt-2 inline-flex w-fit items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest rounded-md border border-emerald-100">
                      <CheckCircle2 size={12} /> Registered
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explore Platform</h2>
        </div>

        {/* Category Filter Pills */}
        {!loading && categories.length > 1 && (
          <div className="flex overflow-x-auto gap-3 pb-6 mb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const isGoing = myRegistrations.includes(String(event.id)); 
              
              // 🌟 NEW: CALCULATE TICKETS SOLD AND CAPACITY
              const soldCount = allAttendees.filter(a => String(a.eventId) === String(event.id) && a.status !== 'Cancelled').length;
              const capacity = Number(event.capacity) || 0;
              const percentSold = capacity > 0 ? Math.min(100, Math.round((soldCount / capacity) * 100)) : 0;
              const isSoldOut = capacity > 0 && soldCount >= capacity;
              const isSellingFast = capacity > 0 && (capacity - soldCount) <= 10 && !isSoldOut;

              return (
                <div key={event.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1">
                  
                  {/* Image Banner */}
                  <div className="h-56 relative overflow-hidden shrink-0 bg-slate-100">
                    {event.imageUrl || event.bannerUrl ? (
                      <img src={event.imageUrl || event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(event.category)}`}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] uppercase tracking-widest font-extrabold rounded-lg shadow-sm">
                        {event.category?.split('/')[0] || 'General'}
                      </span>
                      {isSoldOut && (
                        <span className="px-3 py-1.5 bg-red-600/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-extrabold rounded-lg shadow-sm">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-slate-950 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors tracking-tight">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 text-slate-500 mb-6 flex-1">
                      <div className="flex items-start gap-3 text-sm font-medium">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500 mt-0.5"><Calendar size={16} /></div>
                        <span className="text-slate-700 leading-snug">{formatDateTime(event.date, event.time)}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm font-medium">
                        <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500 mt-0.5"><MapPin size={16} /></div>
                        <span className="text-slate-700 leading-snug line-clamp-2">{event.location}</span>
                      </div>
                    </div>

                    {/* 🌟 NEW: TICKETS SOLD PROGRESS BAR */}
                    <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration</span>
                         <span className="text-xs font-extrabold text-slate-700">{soldCount} {capacity > 0 ? `/ ${capacity}` : ' registered'}</span>
                      </div>
                      {capacity > 0 && (
                         <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${percentSold > 85 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${percentSold}%` }}></div>
                         </div>
                      )}
                      {isSellingFast && (
                          <p className="text-[10px] font-black text-rose-600 mt-2 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                            <Flame size={14} /> Only {capacity - soldCount} spots left!
                          </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-2">
                      {isLoggedIn && isGoing ? (
                        <span className="flex items-center gap-1.5 font-extrabold text-sm bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-100 tracking-wide">
                          <CheckCircle2 size={18} strokeWidth={2.5} /> You're Going!
                        </span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts at</span>
                          <span className="font-black text-2xl text-slate-950 tracking-tight leading-none">
                            {event.price === '0' || event.price === 'Free' ? 'FREE' : `₱${event.price}`}
                          </span>
                        </div>
                      )}
                      
                      <Link 
                        to={`/event/${event.id}`} 
                        className={`px-6 py-3 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm ${
                          isLoggedIn && isGoing 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'
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
              <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center bg-white p-16 rounded-3xl border border-slate-200 shadow-sm mt-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950 mb-2 tracking-tight">No events found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters or search term to find what you're looking for!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
