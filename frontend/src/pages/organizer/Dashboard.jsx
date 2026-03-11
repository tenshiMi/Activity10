import React, { useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import axios from 'axios'; 
import { Plus, Edit, Archive } from 'lucide-react'; // <-- Changed Trash2 to Archive

export default function OrganizerDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const isAdmin = user?.role === 'Admin';

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const endpoint = isAdmin 
                ? 'http://localhost:3000/events' 
                : `http://localhost:3000/events/organizer/${user.id}`; 
                
            const response = await axios.get(endpoint);
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

    // 🌟 CHANGED: Now handles Archiving instead of Hard Deleting
    const handleArchive = async (id, isArchived) => {
        const actionText = isArchived ? "unarchive" : "archive";
        if (window.confirm(`Are you sure you want to ${actionText} this event?`)) {
            try {
                // We still use the DELETE route, but the backend is now doing a soft-delete!
                await axios.delete(`http://localhost:3000/events/${id}`);
                
                // Update the UI instantly by flipping the isArchived status
                setEvents(events.map(event => 
                    event.id === id ? { ...event, isArchived: !isArchived } : event
                ));
            } catch (error) {
                setModal({
                    show: true,
                    type: 'error',
                    title: 'Action Failed',
                    message: `Failed to ${actionText} event. Please try again.`
                });
                console.error(error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isAdmin ? 'All Platform Events' : 'My Events'}
                    </h1>
                    <p className="text-gray-500">
                        {isAdmin ? 'Manage all events across the entire platform.' : 'Manage your upcoming events here.'}
                    </p>
                </div>
                <Link
                    to={isAdmin ? '/admin/create' : '/organizer/create'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-md"
                >
                    <Plus size={20} />
                    Create New Event
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading && <div className="p-8 text-center text-gray-500">Loading events...</div>}

                {!loading && events.length === 0 && (
                    <div className="p-10 text-center flex flex-col items-center">
                        <p className="text-gray-500 mb-4">
                            {isAdmin ? "There are no events on the platform yet." : "You haven't created any events yet."}
                        </p>
                        <Link to={isAdmin ? '/admin/create' : '/organizer/create'} className="text-blue-600 font-semibold hover:underline">
                            Create the first event
                        </Link>
                    </div>
                )}

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
                                // Fades out the row slightly if it is archived
                                <tr key={event.id} className={`transition ${event.isArchived ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4 font-medium text-gray-900">
                                        {event.title}
                                        {/* Shows an ARCHIVED badge */}
                                        {event.isArchived && (
                                            <span className="ml-3 text-[10px] bg-gray-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                                Archived
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-600">{event.location}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${event.isArchived ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                                            {event.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => navigate(isAdmin ? '/admin/create' : '/organizer/create', { state: { eventToEdit: event } })}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleArchive(event.id, event.isArchived)}
                                            className={`${event.isArchived ? 'text-green-600 hover:text-green-800' : 'text-orange-500 hover:text-orange-700'} p-1`}
                                            title={event.isArchived ? "Unarchive Event" : "Archive Event"}
                                        >
                                            <Archive size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

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