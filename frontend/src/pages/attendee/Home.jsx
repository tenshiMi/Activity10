import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import { Calendar, MapPin, Search, Ticket, LogIn } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState([]); // State for real events
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const isLoggedIn = user && token;

  // FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/events'); // Call NestJS
        setEvents(response.data); // Save data to state
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter Logic
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Discover Events</h1>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isLoggedIn ? (
              <Link 
                to="/my-tickets"
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-medium shadow-sm"
              >
                <Ticket size={20} />
                <span className="hidden md:inline">My Tickets</span>
              </Link>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition font-medium shadow-sm"
              >
                <Ticket size={20} />
                <span className="hidden md:inline">My Tickets</span>
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center p-10 text-gray-500">Loading upcoming events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-32 bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold opacity-50">{event.category}</span>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  
                  <div className="space-y-2 text-gray-600 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-blue-500" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-blue-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 border-t pt-4">
                    {isLoggedIn ? (
                      <>
                        <span className="font-bold text-lg text-green-600">
                          {event.price === '0' || event.price === 'Free' ? 'Free' : `₱${event.price}`}
                        </span>
                        <Link 
                          to={`/event/${event.id}`} 
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
                        >
                          View Details
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500 italic">
                          Login to see pricing
                        </span>
                        <button 
                          onClick={() => navigate('/login')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <LogIn size={16} />
                          Login to Register
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 mt-10">
                No events found. Go create one in the Organizer Dashboard!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}