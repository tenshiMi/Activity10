import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit3, UserPlus, Shield, User, X } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [addUserModal, setAddUserModal] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // State for the new user form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Organizer' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/users'); 
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/users', newUser);
      
      setAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Organizer' }); // Reset form
      fetchUsers(); // Refresh the table
      setModal({ show: true, type: 'success', title: 'User Created', message: 'The new team member has been successfully added.' });
    } catch (error) {
      // 🌟 EXTRACT EXACT BACKEND ERROR
      const backendError = error.response?.data?.message || 'Cannot connect to server.';
      const errorMessage = Array.isArray(backendError) ? backendError[0] : backendError;
      setModal({ show: true, type: 'error', title: 'Backend Error', message: errorMessage });
    }
  };

  const handleArchive = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to archive ${userName}? They will be permanently deleted in 60 days if they do not log back in.`)) return;
    
    try {
      await axios.patch(`http://localhost:3000/auth/users/${userId}/archive`); 
      setUsers(users.map(u => u.id === userId ? { ...u, isArchived: true } : u));
      setModal({ show: true, type: 'success', title: 'Archived', message: `${userName} has been archived. The 60-day deletion countdown has started.` });
    } catch (error) {
      const backendError = error.response?.data?.message || 'Failed to archive user.';
      const errorMessage = Array.isArray(backendError) ? backendError[0] : backendError;
      setModal({ show: true, type: 'error', title: 'Backend Error', message: errorMessage });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send the fields we want to update
      const payload = {
        name: editModal.user.name,
        email: editModal.user.email,
      };

      // Only include password if the admin actually typed a new one
      if (editModal.user.password && editModal.user.password.trim() !== '') {
        payload.password = editModal.user.password;
      }

      // 🌟 FIX: Changed .patch to .put 
      await axios.put(`http://localhost:3000/users/${editModal.user.id}`, payload);
      
      fetchUsers(); // Refresh to get clean data from backend
      setEditModal({ show: false, user: null });
      setModal({ show: true, type: 'success', title: 'Updated', message: 'User details updated successfully.' });
    } catch (error) {
      // EXTRACT EXACT BACKEND ERROR
      const backendError = error.response?.data?.message || 'Cannot connect to server.';
      const errorMessage = Array.isArray(backendError) ? backendError[0] : backendError;
      
      setModal({ 
        show: true, 
        type: 'error', 
        title: 'Backend Error', 
        message: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      });
      
      console.error("Full Error Details:", error.response);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Team</h1>
          <p className="text-gray-500 mt-1">Add organizers, manage roles, and monitor team members.</p>
        </div>
        
        <button 
          onClick={() => setAddUserModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 w-1/2">Name</th>
              <th className="p-4 font-semibold text-gray-600 w-1/4">Role</th>
              <th className="p-4 font-semibold text-gray-600 text-right w-1/4 pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((person) => (
              <tr key={person.id} className={`hover:bg-gray-50 transition ${person.isArchived ? 'opacity-50 grayscale' : ''}`}>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    person.role === 'Admin' ? 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200' :
                    person.role === 'Organizer' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                    'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {person.role === 'Admin' && <Shield size={12} />}
                    {person.role}
                  </span>
                </td>
                <td className="p-4 text-right pr-8">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setEditModal({ show: true, user: { ...person, password: '' } })}
                      className="text-gray-400 hover:text-blue-600 transition p-2 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer"
                      title="Edit User"
                    >
                      <Edit3 size={16} />
                    </button>
                    
                    {person.role !== 'Admin' && (
                      <button 
                        onClick={() => handleArchive(person.id, person.name)}
                        disabled={person.isArchived}
                        className={`transition p-2 border rounded-lg shadow-sm cursor-pointer ${
                          person.isArchived 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                            : 'bg-white text-gray-400 hover:text-red-600 border-gray-200 hover:border-red-200 hover:bg-red-50'
                        }`}
                        title={person.isArchived ? "User Archived" : "Archive User"}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
               <tr>
                 <td colSpan="3" className="p-8 text-center text-gray-500">No users found. Try adding one!</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Add New Team Member</h3>
              <button onClick={() => setAddUserModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" required
                  placeholder="jane@example.com"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Temporary Password</label>
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-4 cursor-pointer">
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditModal({ show: false, user: null })} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editModal.user.name}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, name: e.target.value }})}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" required
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editModal.user.email}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, email: e.target.value }})}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between">
                  <span>New Password</span>
                  <span className="text-gray-400 font-normal text-xs">Leave blank to keep current</span>
                </label>
                <input 
                  type="password"
                  placeholder="- - - - - - - -"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editModal.user.password}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, password: e.target.value }})}
                />
              </div>

              {/* Disabled Role Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <input 
                  type="text"
                  disabled
                  className="w-full px-4 py-2 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none font-medium"
                  value={editModal.user.role}
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-4 cursor-pointer">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm text-center">
            <h2 className={`text-xl font-bold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{modal.title}</h2>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <button onClick={() => setModal({ show: false, type: '', title: '', message: '' })} className="w-full py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-bold transition cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}