import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, Users, Calendar as CalendarIcon, 
  UserCheck, UserX, Activity, Trophy, Ticket, Award, Filter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 FEATURE 3: DATE RANGE FILTER STATE
  const [timeFilter, setTimeFilter] = useState('All Time');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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
      }
    };

    fetchDashboardData(); 
    const intervalId = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(intervalId); 
  }, []);

  // ==========================================
  // 🌟 DATA PROCESSING & FILTERING
  // ==========================================
  
  // 1. Filter Events by Date Range
  const getFilteredEvents = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return events.filter(event => {
      if (event.isArchived) return false;
      if (timeFilter === 'All Time') return true;
      
      const eventDate = new Date(event.date);
      if (timeFilter === 'This Month') return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      if (timeFilter === 'Upcoming') return eventDate >= now;
      if (timeFilter === 'Past') return eventDate < now;
      return true;
    });
  };

  const activeFilteredEvents = getFilteredEvents();
  const activeFilteredEventIds = activeFilteredEvents.map(e => String(e.id));
  
  // Filter attendees that belong to the filtered events
  const filteredAttendees = attendees.filter(a => 
    a.status !== 'Cancelled' && activeFilteredEventIds.includes(String(a.eventId))
  );

  // --- KPI METRICS ---
  const activeUsers = users.filter(u => u.isActive !== false);
  const inactiveUsers = users.filter(u => u.isActive === false);
  const totalOrganizers = users.filter(u => u.role === 'Organizer').length;
  
  const totalRevenue = filteredAttendees.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);

  // --- 🌟 FEATURE 1: REVENUE AREA CHART ---
  const revenueByMonth = events.filter(e => !e.isArchived).reduce((acc, event) => {
    if (!event.date) return acc;
    const month = new Date(event.date).toLocaleString('default', { month: 'short' });
    
    // Find all revenue for this specific event
    const eventRevenue = attendees
      .filter(a => String(a.eventId) === String(event.id) && a.status !== 'Cancelled')
      .reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);
    
    acc[month] = (acc[month] || 0) + eventRevenue;
    return acc;
  }, {});

  const monthOrder = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
  
  const areaChartData = Object.keys(revenueByMonth)
    .map(key => ({ name: key, revenue: revenueByMonth[key] }))
    .sort((a, b) => monthOrder[a.name] - monthOrder[b.name]); 

  // --- PIE CHART: Events by Category ---
  const categoryCounts = activeFilteredEvents.reduce((acc, event) => {
    const cat = event.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const pieChartData = Object.keys(categoryCounts).map(key => ({ name: key, value: categoryCounts[key] }));

  // --- 🌟 FEATURE 4: PERFORMANCE COLUMNS FOR TOP EVENTS ---
  const topEvents = [...activeFilteredEvents]
    .map(event => {
      const eventAttendees = attendees.filter(a => String(a.eventId) === String(event.id) && a.status !== 'Cancelled');
      const rev = eventAttendees.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);
      return { ...event, ticketsSold: eventAttendees.length, revenueGenerated: rev };
    })
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated) // Sort by actual revenue instead of just ticket price!
    .slice(0, 5);

  // --- 🌟 FEATURE 2: TOP ORGANIZERS LEADERBOARD ---
  const topOrganizers = users
    .filter(u => u.role === 'Organizer')
    .map(org => {
      const orgEvents = events.filter(e => String(e.organizerId) === String(org.id));
      const orgEventIds = orgEvents.map(e => String(e.id));
      const orgAttendees = attendees.filter(a => orgEventIds.includes(String(a.eventId)) && a.status !== 'Cancelled');
      
      const rev = orgAttendees.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);
      return { name: org.name, revenue: rev, ticketsSold: orgAttendees.length };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4); // Get top 4

  const recentTransactions = [...attendees]
    .reverse() 
    .slice(0, 5)
    .map(att => {
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
      
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="text-blue-600" /> Platform Analytics
            <span className="ml-2 text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Real-time view of your database.</p>
        </div>

        {/* 🌟 DATE RANGE DROPDOWN */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
          >
            <option value="All Time">All Time</option>
            <option value="This Month">This Month</option>
            <option value="Upcoming">Upcoming Events</option>
            <option value="Past">Past Events</option>
          </select>
        </div>
      </div>

      {/* 🌟 KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-green-100 p-3 md:p-4 rounded-xl text-green-600"><DollarSign size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Revenue {timeFilter !== 'All Time' && `(${timeFilter})`}</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-green-500 mt-1 font-medium">{filteredAttendees.length} tickets sold</p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-blue-100 p-3 md:p-4 rounded-xl text-blue-600"><CalendarIcon size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Filtered Events</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{activeFilteredEvents.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Based on selection</p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="bg-purple-100 p-3 md:p-4 rounded-xl text-purple-600"><Users size={24} className="md:w-7 md:h-7" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Total Users</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{users.length}</h3>
            <p className="text-xs text-gray-400 mt-1">{totalOrganizers} Organizers</p>
          </div>
        </div>

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
        
        {/* 🌟 REVENUE AREA CHART */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trajectory by Event Month</h3>
          <div className="h-60 md:h-72">
            {areaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₱${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🌟 TOP EVENTS (With Performance Columns) */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col w-full overflow-hidden lg:col-span-2">
          <div className="p-4 md:p-6 border-b bg-gray-50 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="text-base md:text-lg font-bold text-gray-800">Top Performing Events</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto w-full">
            {topEvents.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-white border-b text-gray-500">
                  <tr>
                    <th className="p-4 font-semibold">Event Name</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold text-center">Tickets Sold</th>
                    <th className="p-4 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900 truncate max-w-[150px]">{event.title}</td>
                      <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">{event.category}</span></td>
                      <td className="p-4 text-center font-bold text-gray-700">{event.ticketsSold}</td>
                      <td className="p-4 text-right font-bold text-green-600">₱{event.revenueGenerated.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">No active events found.</div>
            )}
          </div>
        </div>

        {/* 🌟 TOP ORGANIZERS LEADERBOARD */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col w-full overflow-hidden">
          <div className="p-4 md:p-6 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="text-fuchsia-500" size={20} />
              <h3 className="text-base md:text-lg font-bold text-gray-800">Top Organizers</h3>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4">
            {topOrganizers.length > 0 ? topOrganizers.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-600 font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.ticketsSold} tickets sold</p>
                  </div>
                </div>
                <div className="text-right font-bold text-green-600 text-sm">
                  ₱{org.revenue.toLocaleString()}
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-sm text-gray-500">No organizer data available.</div>
            )}
          </div>
        </div>

        {/* Recent Ticket Sales (Full Width at Bottom) */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col w-full overflow-hidden lg:col-span-3 mt-2">
          <div className="p-4 md:p-6 border-b bg-gray-50 flex items-center gap-2">
            <Ticket className="text-purple-500" size={20} />
            <h3 className="text-base md:text-lg font-bold text-gray-800">Recent Ticket Sales</h3>
          </div>
          <div className="p-0 flex-1 overflow-x-auto w-full">
            {recentTransactions.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-white border-b text-gray-500">
                  <tr>
                    <th className="p-4 font-semibold">Attendee</th>
                    <th className="p-4 font-semibold">Event</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                    <th className="p-4 font-semibold text-right">TIX ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y transition-all">
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900 transition-all">{tx.user}</td>
                      <td className="p-4 text-gray-600 truncate max-w-[200px]">{tx.event}</td>
                      <td className="p-4 text-right text-green-600 font-bold">{tx.amount}</td>
                      <td className="p-4 text-right">
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