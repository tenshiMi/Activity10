import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Archive, User, Shield, User as UserIcon, Mail, Lock } from 'lucide-react'; // <-- Changed Trash2 to Archive

export default function ManageUsers() {
  const [users, setUsers] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '',
    role: 'Organizer' 
  });
  const [notificationModal, setNotificationModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // 1. Fetch Users from Database
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Add New User
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (newUser.password.length < 6) {
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    try {
      const payload = {
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      };

      const response = await axios.post('http://localhost:3000/users', payload);
      // Add to list immediately
      setUsers([...users, response.data]);
      setIsModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'Organizer' }); // Reset form
      setNotificationModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'User added successfully!'
      });
    } catch (error) {
      console.error("Error adding user:", error);
      setNotificationModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add user. They might already exist.'
      });
    }
  };

  // 🌟 3. CHANGED: Soft Delete / Archive User
  const handleArchive = async (id, currentStatus) => {
    // If currentStatus is undefined, assume they are active
    const isActive = currentStatus !== false; 
    const actionText = isActive ? "deactivate" : "reactivate";

    if (window.confirm(`Are you sure you want to ${actionText} this user?`)) {
      try {
        // Calls the backend which now TOGGLES the status instead of deleting
        await axios.delete(`http://localhost:3000/users/${id}`);
        
        // Update the UI instantly by flipping the isActive status
        setUsers(users.map(user => 
          user.id === id ? { ...user, isActive: !isActive } : user
        ));
      } catch (error) {
        console.error("Error archiving user:", error);
        setNotificationModal({
          show: true,
          type: 'error',
          title: 'Error',
          message: `Failed to ${actionText} user.`
        });
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Team</h1>
          <p className="text-gray-500">Add organizers and team members.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add User
        </button>
      </div>

      {/* User List Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Role</th>
              <th className="p-4 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => {
              // Default to true if isActive is missing from old records
              const isUserActive = user.isActive !== false; 
              
              return (
                // 🌟 Fade out row if inactive
                <tr key={user.id} className={`transition ${!isUserActive ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full"><User size={16} /></div>
                    {user.name}
                    
                    {/* 🌟 Inactive Badge */}
                    {!isUserActive && (
                      <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Shield size={12} /> {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {/* 🌟 Dynamic Archive Button */}
                    <button 
                      onClick={() => handleArchive(user.id, user.isActive)}
                      title={isUserActive ? "Deactivate User" : "Reactivate User"}
                      className={`p-2 rounded-lg transition ${
                        isUserActive 
                          ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                    >
                      <Archive size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan="3" className="p-8 text-center text-gray-400">No users found. Add one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      autoFocus
                      required name="firstName" type="text" placeholder="John"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newUser.firstName}
                      onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                      onKeyPress={(e) => {
                        if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault();
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
                  <input 
                    required name="lastName" type="text" placeholder="Doe"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newUser.lastName}
                    onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                    onKeyPress={(e) => {
                      if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault();
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input 
                    required name="email" type="email" placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input 
                    required name="password" type="password" placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 text-gray-400" size={16} />
                  <select 
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Organizer">Organizer</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notificationModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className={`text-xl font-bold mb-4 ${notificationModal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {notificationModal.title}
            </h2>
            <p className="text-gray-600 mb-6">{notificationModal.message}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setNotificationModal({ show: false, type: '', title: '', message: '' })}
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