import React, { useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import axios from 'axios'; // <--- Import Axios
import { Plus, Edit, Trash2 } from 'lucide-react';



export default function OrganizerDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    

    // 1. Fetch Events from Database
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/events/organizer/${user.id}`);
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading events:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // 2. Bonus: Handle Delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await axios.delete(`http://localhost:3000/events/${id}`);
                // Remove from UI instantly without refreshing
                setEvents(events.filter(event => event.id !== id));
            } catch (error) {
                setModal({
                    show: true,
                    type: 'error',
                    title: 'Delete Failed',
                    message: 'Failed to delete event. Please try again.'
                });
                console.error(error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
                    <p className="text-gray-500">Manage your upcoming events here.</p>
                </div>
                <Link
                    to={user?.role === 'Admin' ? '/admin/create' : '/organizer/create'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
                >
                    <Plus size={20} />
                    Create New Event
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

                {/* Loading State */}
                {loading && <div className="p-8 text-center text-gray-500">Loading your events...</div>}

                {/* Empty State */}
                {!loading && events.length === 0 && (
                    <div className="p-10 text-center flex flex-col items-center">
                        <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                        <Link to={user?.role === 'Admin' ? '/admin/create' : '/organizer/create'} className="text-blue-600 font-semibold hover:underline">
                            Create your first event
                        </Link>
                    </div>
                )}

                {/* Real Data Table */}
                {!loading && events.length > 0 && (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Event Name</th>
                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-gray-600">Location</th>
                                <th className="p-4 font-semibold text-gray-600">Category</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{event.title}</td>
                                    <td className="p-4 text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-600">{event.location}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                            {event.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => navigate(user?.role === 'Admin' ? '/admin/create' : '/organizer/create', { state: { eventToEdit: event } })}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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