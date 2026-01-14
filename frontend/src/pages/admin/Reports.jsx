import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch both lists
        const eventsRes = await axios.get('http://localhost:3000/events');
        const attendeesRes = await axios.get('http://localhost:3000/attendees');

        const events = eventsRes.data;
        const attendees = attendeesRes.data;

        // 2. Calculate Real Revenue
        // (This assumes 1 attendee = 1 ticket sale at the event's price)
        let revenue = 0;
        attendees.forEach(person => {
           // Find the event this person registered for
           const event = events.find(e => e.id.toString() === person.eventId);
           if (event && event.price !== 'Free') {
             revenue += parseFloat(event.price) || 0;
           }
        });

        setStats({
          totalEvents: events.length,
          totalAttendees: attendees.length,
          totalRevenue: revenue
        });

      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">System Reports</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">₱{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Attendees</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalAttendees}</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Events</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalEvents}</h3>
            </div>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={20} /></div>
          </div>
        </div>
      </div>
      
      <div className="text-gray-400 text-center mt-10">
        (Charts can be connected to this same data later)
      </div>
    </div>
  );
}