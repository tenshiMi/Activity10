import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Mail, CheckCircle, Download, Briefcase } from 'lucide-react';

export default function Attendees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendees, setAttendees] = useState([]); // <--- Real Data
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 1. Fetch Real Attendees from Database
  const fetchAttendees = async () => {
    try {
      const response = await axios.get('http://localhost:3000/attendees');
      setAttendees(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  // Filter logic
  const filteredList = attendees.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.ticketId.includes(searchTerm)
  );
  // Function to download CSV
  const downloadCSV = () => {
    if (attendees.length === 0) {
      setModal({
        show: true,
        type: 'error',
        title: 'No Data',
        message: 'No data to export!'
      });
      return;
    }

    // 1. Create CSV Headers
    const headers = ["ID", "Name", "Email", "Company", "Ticket ID", "Status", "Event ID"];
    
    // 2. Convert Data to CSV Format
    const csvRows = [
      headers.join(','), // Header Row
      ...attendees.map(row => [
        row.id,
        `"${row.name}"`, // Quote strings to handle commas in names
        row.email,
        `"${row.company}"`,
        row.ticketId,
        row.status,
        row.eventId
      ].join(','))
    ];

    // 3. Create a Blob and Download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendee_list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Attendee Manager</h1>
          <p className="text-gray-500">View and manage all registered guests.</p>
        </div>

        <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm"      
            onClick={downloadCSV}>
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-t-xl border-b flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, email, or ticket ID..." 
          className="flex-1 outline-none text-gray-700"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading attendees...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Name</th>
                <th className="p-4 font-semibold text-gray-600">Company</th>
                <th className="p-4 font-semibold text-gray-600">Ticket ID</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredList.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition group">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{person.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} /> {person.email}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2">
                       <Briefcase size={14} className="text-gray-400"/>
                       {person.company || '-'}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-500">{person.ticketId}</td>
                  
                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      person.status === 'Checked In' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {person.status === 'Checked In' ? <CheckCircle size={12} /> : null}
                      {person.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {filteredList.length === 0 && (
                 <tr>
                   <td colSpan="5" className="p-8 text-center text-gray-500">
                     No attendees found.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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