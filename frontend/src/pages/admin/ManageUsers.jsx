import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Edit3, UserPlus, Shield, User, X, 
  Search, Filter, CheckCircle2, AlertTriangle, Calendar 
} from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [addUserModal, setAddUserModal] = useState(false);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
  
  const [confirmArchive, setConfirmArchive] = useState({ show: false, userId: null, userName: '', isBulk: false });
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

  // 🌟 NEW: Formats the database timestamp into "Mar 24, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return 'Legacy Account'; // For users created before we added the column
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/users/admin', newUser);
      setAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Organizer' }); 
      fetchUsers(); 
      setModal({ show: true, type: 'success', title: 'User Created', message: 'The new team member has been successfully added.' });
    } catch (error) {
      const backendError = error.response?.data?.message || 'Cannot connect to server.';
      const errorMessage = Array.isArray(backendError) ? backendError[0] : backendError;
      setModal({ show: true, type: 'error', title: 'Backend Error', message: errorMessage });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: editModal.user.name, email: editModal.user.email };
      if (editModal.user.password && editModal.user.password.trim() !== '') {
        payload.password = editModal.user.password;
      }
      await axios.put(`http://localhost:3000/users/${editModal.user.id}`, payload);
      
      fetchUsers(); 
      setEditModal({ show: false, user: null });
      setModal({ show: true, type: 'success', title: 'Updated', message: 'User details updated successfully.' });
    } catch (error) {
      const backendError = error.response?.data?.message || 'Cannot connect to server.';
      const errorMessage = Array.isArray(backendError) ? backendError[0] : backendError;
      setModal({ show: true, type: 'error', title: 'Backend Error', message: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage) });
    }
  };

  const executeArchive = async () => {
    setConfirmArchive({ ...confirmArchive, show: false }); 
    
    try {
      if (confirmArchive.isBulk) {
        await Promise.all(selectedUsers.map(id => axios.patch(`http://localhost:3000/auth/users/${id}/archive`)));
        setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, isArchived: true } : u));
        setSelectedUsers([]);
        setModal({ show: true, type: 'success', title: 'Bulk Archive', message: `${selectedUsers.length} users have been archived.` });
      } else {
        await axios.patch(`http://localhost:3000/auth/users/${confirmArchive.userId}/archive`); 
        setUsers(users.map(u => u.id === confirmArchive.userId ? { ...u, isArchived: true } : u));
        setModal({ show: true, type: 'success', title: 'Archived', message: `${confirmArchive.userName} has been archived.` });
      }
    } catch (error) {
      setModal({ show: true, type: 'error', title: 'Archive Failed', message: 'An error occurred while archiving users.' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedUsers(filteredUsers.map(u => u.id));
    else setSelectedUsers([]);
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    else setSelectedUsers([...selectedUsers, id]);
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Team</h1>
          <p className="text-gray-500 mt-1">Add organizers, manage roles, and monitor team members.</p>
        </div>
        <button 
          onClick={() => setAddUserModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition shadow-sm appearance-none bg-white cursor-pointer font-medium text-gray-700"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admins</option>
            <option value="Organizer">Organizers</option>
            <option value="Attendee">Attendees</option>
          </select>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl mb-6 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
              {selectedUsers.length}
            </span>
            <span className="font-bold text-indigo-900">Users Selected</span>
          </div>
          <button 
            onClick={() => setConfirmArchive({ show: true, isBulk: true })}
            className="text-red-600 hover:text-white border border-red-200 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={16} /> Archive Selected
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  />
                </th>
                <th className="p-4 font-semibold text-gray-600">Name</th>
                <th className="p-4 font-semibold text-gray-600">Role</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Joined</th> {/* 🌟 NEW COLUMN HEADER */}
                <th className="p-4 font-semibold text-gray-600 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((person) => (
                <tr key={person.id} className={`hover:bg-gray-50 transition ${person.isArchived ? 'bg-gray-50' : ''}`}>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      checked={selectedUsers.includes(person.id)}
                      onChange={() => handleSelectUser(person.id)}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${person.isArchived ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <div className={`font-bold ${person.isArchived ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{person.name}</div>
                      <div className="text-sm text-gray-500">{person.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      person.role === 'Admin' ? 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200' :
                      person.role === 'Organizer' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      'bg-blue-50 text-blue-600 border border-blue-200'
                    } ${person.isArchived ? 'opacity-50 grayscale' : ''}`}>
                      {person.role === 'Admin' && <Shield size={12} />}
                      {person.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {person.isArchived ? (
                      <span className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span> Archived
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                      </span>
                    )}
                  </td>

                  {/* 🌟 NEW JOINED DATE DATA */}
                  <td className="p-4 text-sm text-gray-500 font-medium flex items-center gap-2 mt-2">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(person.createdAt)}
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
                          onClick={() => setConfirmArchive({ show: true, userId: person.id, userName: person.name, isBulk: false })}
                          disabled={person.isArchived}
                          className={`transition p-2 border rounded-lg shadow-sm cursor-pointer ${
                            person.isArchived 
                              ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
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
              {filteredUsers.length === 0 && (
                 <tr>
                   <td colSpan="6" className="p-12 text-center text-gray-500">
                     <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="text-gray-300 mb-3" />
                        <p className="font-medium text-gray-600">No users found.</p>
                        <p className="text-sm mt-1">Try adjusting your search or role filter.</p>
                     </div>
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  type="text" required autoComplete="off"
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" required autoComplete="off"
                  placeholder="e.g. jane@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Temporary Password</label>
                <input 
                  type="password" required autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition appearance-none cursor-pointer"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-sm mt-4 cursor-pointer">
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

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
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  value={editModal.user.name}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, name: e.target.value }})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" required autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  value={editModal.user.email}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, email: e.target.value }})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between">
                  <span>New Password</span>
                  <span className="text-gray-400 font-normal text-xs">Leave blank to keep current</span>
                </label>
                <input 
                  type="password" autoComplete="new-password" placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  value={editModal.user.password}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, password: e.target.value }})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <input 
                  type="text" disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed outline-none font-medium"
                  value={editModal.user.role}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-sm mt-4 cursor-pointer">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmArchive.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Archive User?</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              {confirmArchive.isBulk 
                ? `You are about to archive ${selectedUsers.length} users. They will be permanently deleted in 60 days.`
                : `Are you sure you want to archive ${confirmArchive.userName}? They will be permanently deleted in 60 days.`}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmArchive({ show: false, userId: null, userName: '', isBulk: false })}
                className="flex-1 font-bold py-3.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={executeArchive}
                className="flex-1 font-bold py-3.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-md shadow-red-600/20 cursor-pointer"
              >
                Yes, Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center animate-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${modal.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-500'}`}>
              {modal.type === 'error' ? <AlertTriangle size={32} strokeWidth={2.5} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
            </div>
            <h2 className={`text-2xl font-extrabold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-gray-900'}`}>{modal.title}</h2>
            <p className="text-gray-500 font-medium mb-8">{modal.message}</p>
            <button onClick={() => setModal({ show: false, type: '', title: '', message: '' })} className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-bold transition shadow-md cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}