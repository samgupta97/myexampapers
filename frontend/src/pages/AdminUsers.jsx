import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminUsers() {
  var navigate = useNavigate();
  var [users, setUsers] = useState([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [message, setMessage] = useState('');

  // Add/Edit User Modal States
  var [modalOpen, setModalOpen] = useState(false);
  var [editingUser, setEditingUser] = useState(null); // null if creating, user object if editing

  var [userName, setUserName] = useState('');
  var [userEmail, setUserEmail] = useState('');
  var [userMobile, setUserMobile] = useState('');
  var [userRole, setUserRole] = useState('User');
  var [userStatus, setUserStatus] = useState('Active');
  var [modalSaving, setModalSaving] = useState(false);

  useEffect(function () {
    var token = localStorage.getItem('token');
    var userString = localStorage.getItem('user');
    var loggedInUser = userString ? JSON.parse(userString) : null;

    if (!token || !loggedInUser || loggedInUser.role !== 'Admin') {
      navigate('/admin/login');
      return;
    }

    loadUsers();
  }, [navigate]);

  function loadUsers() {
    setLoading(true);
    getUsers()
      .then(function (response) {
        setLoading(false);
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          setError('Failed to fetch users');
        }
      })
      .catch(function (err) {
        setLoading(false);
        setError('Error fetching users from backend API');
      });
  }

  function handleOpenCreateModal() {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserMobile('');
    setUserRole('User');
    setUserStatus('Active');
    setError('');
    setModalOpen(true);
  }

  function handleOpenEditModal(user) {
    setEditingUser(user);
    setUserName(user.name || '');
    setUserEmail(user.email || '');
    setUserMobile(user.mobile || '');
    setUserRole(user.role || 'User');
    setUserStatus(user.status || 'Active');
    setError('');
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingUser(null);
  }

  function handleSaveUser(e) {
    e.preventDefault();
    if (!userName || !userEmail) {
      alert('Name and Email are required fields');
      return;
    }

    setModalSaving(true);
    var payload = {
      name: userName,
      email: userEmail,
      mobile: userMobile,
      role: userRole,
      status: userStatus
    };

    if (editingUser) {
      // Update User
      updateUser(editingUser.id, payload)
        .then(function (response) {
          setModalSaving(false);
          setModalOpen(false);
          setMessage('User updated successfully.');
          loadUsers();
          setTimeout(function () { setMessage(''); }, 3000);
        })
        .catch(function (err) {
          setModalSaving(false);
          var msg = err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Failed to update user.';
          alert(msg);
        });
    } else {
      // Create User
      createUser(payload)
        .then(function (response) {
          setModalSaving(false);
          setModalOpen(false);
          setMessage('User created successfully.');
          loadUsers();
          setTimeout(function () { setMessage(''); }, 3000);
        })
        .catch(function (err) {
          setModalSaving(false);
          var msg = err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Failed to create user.';
          alert(msg);
        });
    }
  }

  function handleDeleteUser(id) {
    var userString = localStorage.getItem('user');
    var loggedInUser = userString ? JSON.parse(userString) : null;

    if (loggedInUser && loggedInUser.id === id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id)
        .then(function (response) {
          setMessage('User deleted successfully.');
          loadUsers();
          setTimeout(function () { setMessage(''); }, 3000);
        })
        .catch(function (err) {
          setError('Failed to delete user.');
          setTimeout(function () { setError(''); }, 3000);
        });
    }
  }

  return (
    <div className="app-container" id="admin-users-container">
      <Header />

      <div className="admin-layout" id="admin-users-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar" id="admin-sidebar">
          <ul className="admin-nav-list">
            <li>
              <Link to="/admin/home" className="admin-nav-link" id="admin-sidebar-papers">
                📂 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/upload-paper" className="admin-nav-link" id="admin-sidebar-upload">
                ➕ Upload Paper
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="admin-nav-link active" id="admin-sidebar-users">
                👥 Manage Users
              </Link>
            </li>
          </ul>
        </aside>

        {/* MAIN PANEL */}
        <main className="admin-content" id="admin-users-main">
          <div className="admin-header">
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700 }} id="admin-users-title">User Management</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Add, update, and manage portal users and admins</p>
            </div>
            <button onClick={handleOpenCreateModal} className="btn btn-primary" id="admin-users-add-btn">
              Add New User
            </button>
          </div>

          {message && <div className="alert alert-success" id="admin-users-success">{message}</div>}
          {error && <div className="alert alert-danger" id="admin-users-error">{error}</div>}

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="table-container">
              <table className="data-table" id="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(function (user) {
                    return (
                      <tr key={user.id} id={'user-row-' + user.id}>
                        <td style={{ fontWeight: 600 }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.mobile || '—'}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '4px',
                            backgroundColor: user.role === 'Admin' ? 'rgba(241, 112, 52, 0.1)' : 'rgba(185, 37, 134, 0.1)',
                            color: user.role === 'Admin' ? 'var(--accent-orange)' : 'var(--primary-color)'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-indicator ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={function () { handleOpenEditModal(user); }}
                              className="btn btn-secondary btn-sm"
                              id={'edit-user-btn-' + user.id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={function () { handleDeleteUser(user.id); }}
                              className="btn btn-danger btn-sm"
                              id={'delete-user-btn-' + user.id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ADD/EDIT USER MODAL */}
      {modalOpen && (
        <div className="modal-overlay" id="user-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Edit User details' : 'Add New User'}</h3>
              <button onClick={handleCloseModal} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSaveUser} id="user-form">
              <div className="form-group">
                <label className="form-label" htmlFor="user-modal-name">Full Name *</label>
                <input
                  type="text"
                  id="user-modal-name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={userName}
                  onChange={function (e) { setUserName(e.target.value); }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-modal-email">Email Address *</label>
                <input
                  type="email"
                  id="user-modal-email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={userEmail}
                  onChange={function (e) { setUserEmail(e.target.value); }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-modal-mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="user-modal-mobile"
                  className="form-input"
                  placeholder="e.g. +44 7123 456789"
                  value={userMobile}
                  onChange={function (e) { setUserMobile(e.target.value); }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="user-modal-role">Role</label>
                  <select
                    id="user-modal-role"
                    className="form-input form-select"
                    value={userRole}
                    onChange={function (e) { setUserRole(e.target.value); }}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="user-modal-status">Status</label>
                  <select
                    id="user-modal-status"
                    className="form-input form-select"
                    value={userStatus}
                    onChange={function (e) { setUserStatus(e.target.value); }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary btn-sm" id="user-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={modalSaving} id="user-modal-save">
                  {modalSaving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminUsers;
