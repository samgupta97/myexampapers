import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPapers, deletePaper, updatePaper } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaperCard from '../components/PaperCard';

function AdminDashboard() {
  var navigate = useNavigate();
  var [papers, setPapers] = useState([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [message, setMessage] = useState('');

  // Edit Modal States
  var [editingPaper, setEditingPaper] = useState(null);
  var [editTitle, setEditTitle] = useState('');
  var [editSubject, setEditSubject] = useState('');
  var [editClassYear, setEditClassYear] = useState('');
  var [editExamBoard, setEditExamBoard] = useState('');
  var [editPaperType, setEditPaperType] = useState('');
  var [editDescription, setEditDescription] = useState('');
  var [editPrice, setEditPrice] = useState('');
  var [editStatus, setEditStatus] = useState('Active');
  var [editPaperFile, setEditPaperFile] = useState(null);
  var [editThumbnail, setEditThumbnail] = useState(null);
  var [saving, setSaving] = useState(false);

  useEffect(function () {
    var token = localStorage.getItem('token');
    var userString = localStorage.getItem('user');
    var user = userString ? JSON.parse(userString) : null;
    
    if (!token || !user || user.role !== 'Admin') {
      navigate('/admin/login');
      return;
    }

    loadPapers();
  }, [navigate]);

  function loadPapers() {
    setLoading(true);
    getPapers(true) // Get all papers, including inactive ones
      .then(function (response) {
        setLoading(false);
        if (response.data.success) {
          setPapers(response.data.papers);
        } else {
          setError('Failed to fetch uploaded papers');
        }
      })
      .catch(function (err) {
        setLoading(false);
        setError('Error fetching papers from backend API');
      });
  }

  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this paper?')) {
      deletePaper(id)
        .then(function (response) {
          setMessage('Paper deleted successfully.');
          loadPapers();
          setTimeout(function() { setMessage(''); }, 3000);
        })
        .catch(function (err) {
          setError('Failed to delete paper.');
          setTimeout(function() { setError(''); }, 3000);
        });
    }
  }

  function handleOpenEditModal(paper) {
    setEditingPaper(paper);
    setEditTitle(paper.title || '');
    setEditSubject(paper.subject || '');
    setEditClassYear(paper.class_year || '');
    setEditExamBoard(paper.exam_board || '');
    setEditPaperType(paper.paper_type || '');
    setEditDescription(paper.description || '');
    setEditPrice(paper.price || '');
    setEditStatus(paper.status || 'Active');
    setEditPaperFile(null);
    setEditThumbnail(null);
  }

  function handleCloseEditModal() {
    setEditingPaper(null);
  }

  function handleUpdatePaper(e) {
    e.preventDefault();
    if (!editTitle) {
      alert('Paper Title is required');
      return;
    }

    setSaving(true);
    var formData = new FormData();
    formData.append('title', editTitle);
    formData.append('subject', editSubject);
    formData.append('class_year', editClassYear);
    formData.append('exam_board', editExamBoard);
    formData.append('paper_type', editPaperType);
    formData.append('description', editDescription);
    formData.append('price', editPrice);
    formData.append('status', editStatus);

    if (editPaperFile) {
      formData.append('paper_file', editPaperFile);
    }
    if (editThumbnail) {
      formData.append('thumbnail', editThumbnail);
    }

    updatePaper(editingPaper.id, formData)
      .then(function (response) {
        setSaving(false);
        setEditingPaper(null);
        setMessage('Paper updated successfully.');
        loadPapers();
        setTimeout(function() { setMessage(''); }, 3000);
      })
      .catch(function (err) {
        setSaving(false);
        alert('Failed to update paper details.');
      });
  }

  return (
    <div className="app-container" id="admin-dashboard-container">
      <Header />

      <div className="admin-layout" id="admin-dashboard-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar" id="admin-sidebar">
          <ul className="admin-nav-list">
            <li>
              <Link to="/admin/home" className="admin-nav-link active" id="admin-sidebar-papers">
                📂 Uploaded Papers
              </Link>
            </li>
            <li>
              <Link to="/admin/upload-paper" className="admin-nav-link" id="admin-sidebar-upload">
                ➕ Upload Paper
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="admin-nav-link" id="admin-sidebar-users">
                👥 Manage Users
              </Link>
            </li>
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-content" id="admin-dashboard-main">
          <div className="admin-header">
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700 }} id="admin-dashboard-title">Uploaded Exam Papers</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>View, edit, and delete exam paper listings</p>
            </div>
            <Link to="/admin/upload-paper" className="btn btn-primary" id="admin-dashboard-add-btn">
              Upload New Paper
            </Link>
          </div>

          {message && <div className="alert alert-success" id="admin-dashboard-success">{message}</div>}
          {error && <div className="alert alert-danger" id="admin-dashboard-error">{error}</div>}

          {loading ? (
            <div className="spinner"></div>
          ) : papers.length === 0 ? (
            <div className="no-data" id="admin-dashboard-empty">
              <h3>No papers uploaded yet</h3>
              <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>Click "Upload New Paper" to add to the store.</p>
            </div>
          ) : (
            <div className="grid grid-3" id="admin-papers-grid">
              {papers.map(function (paper) {
                return (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isAdmin={true}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* EDIT MODAL */}
      {editingPaper && (
        <div className="modal-overlay" id="edit-paper-modal">
          <div className="modal-content" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Exam Paper</h3>
              <button onClick={handleCloseEditModal} className="modal-close">×</button>
            </div>

            <form onSubmit={handleUpdatePaper} id="edit-paper-form">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">Paper Title *</label>
                <input
                  type="text"
                  id="edit-title"
                  className="form-input"
                  value={editTitle}
                  onChange={function(e) { setEditTitle(e.target.value); }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-subject">Subject</label>
                  <input
                    type="text"
                    id="edit-subject"
                    className="form-input"
                    value={editSubject}
                    onChange={function(e) { setEditSubject(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-class">Class / Year</label>
                  <input
                    type="text"
                    id="edit-class"
                    className="form-input"
                    value={editClassYear}
                    onChange={function(e) { setEditClassYear(e.target.value); }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-board">Exam Board</label>
                  <input
                    type="text"
                    id="edit-board"
                    className="form-input"
                    value={editExamBoard}
                    onChange={function(e) { setEditExamBoard(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-type">Paper Type</label>
                  <input
                    type="text"
                    id="edit-type"
                    className="form-input"
                    placeholder="e.g. Practice, Mock, Past Paper"
                    value={editPaperType}
                    onChange={function(e) { setEditPaperType(e.target.value); }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  className="form-input form-textarea"
                  value={editDescription}
                  onChange={function(e) { setEditDescription(e.target.value); }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-price">Price / Free</label>
                  <input
                    type="text"
                    id="edit-price"
                    className="form-input"
                    placeholder="e.g. Free or 29.99"
                    value={editPrice}
                    onChange={function(e) { setEditPrice(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    className="form-input form-select"
                    value={editStatus}
                    onChange={function(e) { setEditStatus(e.target.value); }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-file">PDF Upload (Optional - Leaves existing file unchanged)</label>
                <input
                  type="file"
                  id="edit-file"
                  accept=".pdf"
                  className="form-input"
                  onChange={function(e) { setEditPaperFile(e.target.files[0]); }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-thumbnail">Thumbnail Upload (Optional - Leaves existing image unchanged)</label>
                <input
                  type="file"
                  id="edit-thumbnail"
                  accept="image/*"
                  className="form-input"
                  onChange={function(e) { setEditThumbnail(e.target.files[0]); }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseEditModal} className="btn btn-secondary btn-sm" id="edit-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving} id="edit-modal-save">
                  {saving ? 'Saving...' : 'Save Changes'}
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

export default AdminDashboard;
