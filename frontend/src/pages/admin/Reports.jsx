import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, Users, Calendar as CalendarIcon, 
  UserCheck, UserX, Activity, Trophy, Ticket
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendees, setAttendees] = useState([]); // 🌟 NEW: Track ticket sales
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 🌟 FETCH ALL 3 TABLES NOW
        const [eventsRes, usersRes, attendeesRes] = await Promise.all([
          axios.get('http://localhost:3000/events'),
          axios.get('http://localhost:3000/users'),
          axios.get('http://localhost:3000/attendees') 
        ]);
        
        setEvents(eventsRes.data);
        setUsers(usersRes.data);
        setAttendees(attendeesRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching report data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- 1. CALCULATE REAL METRICS ---
  const activeEvents = events.filter(e => !e.isArchived);
  const archivedEvents = events.filter(e => e.isArchived);
  const activeUsers = users.filter(u => u.isActive !== false);
  const inactiveUsers = users.filter(u => u.isActive === false);
  const totalOrganizers = users.filter(u => u.role === 'Organizer').length;

  // 🌟 NEW: Calculate Total Revenue from all attendees
  const totalRevenue = attendees
    .filter(a => a.status !== 'Cancelled') // <-- Add this filter!
    .reduce((sum, attendee) => {
      const amount = parseFloat(attendee.amountPaid) || 0;
      return sum + amount;
    }, 0);

  // --- 2. PIE CHART: Events by Category ---
  const categoryCounts = activeEvents.reduce((acc, event) => {
    const cat = event.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const pieChartData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  // --- 3. LINE CHART: Events per Month ---
  const monthCounts = activeEvents.reduce((acc, event) => {
    if (!event.date) return acc;
    const month = new Date(event.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthOrder = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
  
  const lineChartData = Object.keys(monthCounts)
    .map(key => ({ name: key, events: monthCounts[key] }))
    .sort((a, b) => monthOrder[a.name] - monthOrder[b.name]); 

  // --- 4. TABLES: Top Priced Events & Recent Transactions ---
  const topEvents = [...activeEvents]
    .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    .slice(0, 5);

  // 🌟 NEW: Get the 5 most recent ticket purchases
  const recentTransactions = [...attendees]
    .reverse() // Flips the array so the newest are first
    .slice(0, 5)
    .map(att => {
      // Find the event title so we aren't just showing an ID number
      const eventInfo = events.find(e => String(e.id) === String(att.eventId));
      return {
        id: att.id,
        user: att.name,
        event: eventInfo ? eventInfo.title : 'Unknown Event',
        amount: att.amountPaid === '0' || att.amountPaid === 'Free' ? 'Free' : `₱${att.amountPaid}`,
        ticketId: att.ticketId
      };
    });

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Analyzing database...</div>;

  return (
    <div className="pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="text-blue-600" /> Platform Analytics
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Live view of your database.</p>
        </div>
      </div>

      {/* 🌟 KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        {/* 🌟 REAL REVENUE */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-green-100 p-3 md:p-4 rounded-xl text-green-600"><DollarSign size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Total Revenue</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-green-500 mt-1 font-medium">{attendees.length} tickets sold</p>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-100 p-3 md:p-4 rounded-xl text-blue-600"><CalendarIcon size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Active Events</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{activeEvents.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{archivedEvents.length} archived</p>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-purple-100 p-3 md:p-4 rounded-xl text-purple-600"><Users size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Total Users</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{users.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{totalOrganizers} Organizers</p>
          </div>
        </div>

        {/* Health */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-orange-100 p-3 md:p-4 rounded-xl text-orange-600"><UserCheck size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Active Accounts</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{activeUsers.length}</h3>
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <UserX size={12}/> {inactiveUsers.length} Inactive
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Line Chart: Event Schedule */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Upcoming Events by Month</h3>
          <div className="h-60 md:h-72">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Events`, 'Total']}
                  />
                  <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Not enough data to graph.</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Categories */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Events by Category</h3>
          <div className="flex-1 min-h-[200px] md:min-h-[250px]">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No category data yet</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {pieChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600 font-medium">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Highest Priced Events */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col w-full overflow-hidden">
          <div className="p-4 md:p-6 border-b bg-gray-50 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="text-base md:text-lg font-bold text-gray-800">Highest Priced Events</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto w-full">
            {topEvents.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[400px]">
                <thead className="bg-white border-b text-gray-500">
                  <tr>
                    <th className="p-3 md:p-4 font-semibold">Event Name</th>
                    <th className="p-3 md:p-4 font-semibold">Category</th>
                    <th className="p-3 md:p-4 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="p-3 md:p-4 font-medium text-gray-900 truncate max-w-[120px] md:max-w-[150px]">{event.title}</td>
                      <td className="p-3 md:p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">{event.category}</span></td>
                      <td className="p-3 md:p-4 text-right font-bold text-green-600">{event.price === '0' || event.price === 'Free' ? 'Free' : `₱${event.price}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">No active events found.</div>
            )}
          </div>
        </div>

        {/* 🌟 REAL TICKET SALES TABLE */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col w-full overflow-hidden">
          <div className="p-4 md:p-6 border-b bg-gray-50 flex items-center gap-2">
            <Ticket className="text-purple-500" size={20} />
            <h3 className="text-base md:text-lg font-bold text-gray-800">Recent Ticket Sales</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto w-full">
            {recentTransactions.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[400px]">
                <thead className="bg-white border-b text-gray-500">
                  <tr>
                    <th className="p-3 md:p-4 font-semibold">Attendee</th>
                    <th className="p-3 md:p-4 font-semibold">Event</th>
                    <th className="p-3 md:p-4 font-semibold text-right">TIX ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-3 md:p-4">
                        <p className="font-medium text-gray-900">{tx.user}</p>
                        <p className="text-xs text-green-600 font-bold">{tx.amount}</p>
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 truncate max-w-[100px]">{tx.event}</td>
                      <td className="p-3 md:p-4 text-right">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{tx.ticketId}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">No tickets sold yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}