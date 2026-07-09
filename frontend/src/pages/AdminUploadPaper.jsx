import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPaper } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminUploadPaper() {
  var navigate = useNavigate();
  var [title, setTitle] = useState('');
  var [subject, setSubject] = useState('');
  var [classYear, setClassYear] = useState('');
  var [examBoard, setExamBoard] = useState('');
  var [paperType, setPaperType] = useState('');
  var [description, setDescription] = useState('');
  var [price, setPrice] = useState('');
  var [status, setStatus] = useState('Active');
  var [paperFile, setPaperFile] = useState(null);
  var [thumbnail, setThumbnail] = useState(null);

  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');

  useEffect(function () {
    var token = localStorage.getItem('token');
    var userString = localStorage.getItem('user');
    var user = userString ? JSON.parse(userString) : null;

    if (!token || !user || user.role !== 'Admin') {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  function handleReset() {
    setTitle('');
    setSubject('');
    setClassYear('');
    setExamBoard('');
    setPaperType('');
    setDescription('');
    setPrice('');
    setStatus('Active');
    setPaperFile(null);
    setThumbnail(null);
    setError('');
    setSuccess('');

    // Reset file input values
    var fileInput = document.getElementById('paper-file');
    var thumbInput = document.getElementById('paper-thumbnail');
    if (fileInput) fileInput.value = '';
    if (thumbInput) thumbInput.value = '';
  }

  function handleUpload(e) {
    e.preventDefault();
    if (!title) {
      setError('Paper Title is required');
      return;
    }
    if (!paperFile) {
      setError('Please select a PDF file to upload');
      return;
    }
    if (!thumbnail) {
      setError('Please select a thumbnail image to upload');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    var formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('class_year', classYear);
    formData.append('exam_board', examBoard);
    formData.append('paper_type', paperType);
    formData.append('description', description);
    formData.append('price', price || 'Free');
    formData.append('status', status);
    formData.append('paper_file', paperFile);
    formData.append('thumbnail', thumbnail);

    createPaper(formData)
      .then(function (response) {
        setLoading(false);
        setSuccess('Paper uploaded and created successfully!');
        handleReset();
      })
      .catch(function (err) {
        setLoading(false);
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to upload paper. Please check the files and try again.';
        setError(msg);
      });
  }

  return (
    <div className="app-container" id="admin-upload-container">
      <Header />

      <div className="admin-layout" id="admin-upload-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar" id="admin-sidebar">
          <ul className="admin-nav-list">
            <li>
              <Link to="/admin/home" className="admin-nav-link" id="admin-sidebar-papers">
                📂 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/upload-paper" className="admin-nav-link active" id="admin-sidebar-upload">
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

        {/* FORM PANEL */}
        <main className="admin-content" id="admin-upload-main">
          <div className="admin-header">
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 700 }} id="admin-upload-title">Upload New Practice Paper</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Add a new exam paper to the online catalogue</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--card-border)', maxWidth: '800px' }}>
            {error && <div className="alert alert-danger" id="upload-error-alert">{error}</div>}
            {success && <div className="alert alert-success" id="upload-success-alert">{success}</div>}

            <form onSubmit={handleUpload} id="upload-paper-form">
              <div className="form-group">
                <label className="form-label" htmlFor="paper-title">Paper Title *</label>
                <input
                  type="text"
                  id="paper-title"
                  className="form-input"
                  placeholder="e.g. 11+ Mathematics Practice Paper Set A"
                  value={title}
                  onChange={function (e) { setTitle(e.target.value); }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-subject">Subject</label>
                  <input
                    type="text"
                    id="paper-subject"
                    className="form-input"
                    placeholder="e.g. Mathematics, English, VR"
                    value={subject}
                    onChange={function (e) { setSubject(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-class">Class / Year</label>
                  <input
                    type="text"
                    id="paper-class"
                    className="form-input"
                    placeholder="e.g. Year 6, 11+, 13+"
                    value={classYear}
                    onChange={function (e) { setClassYear(e.target.value); }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-board">Exam Board</label>
                  <input
                    type="text"
                    id="paper-board"
                    className="form-input"
                    placeholder="e.g. GL Assessment, CEM, ISEB"
                    value={examBoard}
                    onChange={function (e) { setExamBoard(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-type">Paper Type</label>
                  <input
                    type="text"
                    id="paper-type"
                    className="form-input"
                    placeholder="e.g. Practice Pack, Past Paper"
                    value={paperType}
                    onChange={function (e) { setPaperType(e.target.value); }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="paper-description">Description</label>
                <textarea
                  id="paper-description"
                  className="form-input form-textarea"
                  placeholder="Provide a description of what is included in the paper package..."
                  value={description}
                  onChange={function (e) { setDescription(e.target.value); }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-price">Price / Free</label>
                  <input
                    type="text"
                    id="paper-price"
                    className="form-input"
                    placeholder="e.g. Free or 14.99"
                    value={price}
                    onChange={function (e) { setPrice(e.target.value); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-status">Status</label>
                  <select
                    id="paper-status"
                    className="form-input form-select"
                    value={status}
                    onChange={function (e) { setStatus(e.target.value); }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-file">PDF Upload * (Select PDF paper file)</label>
                  <input
                    type="file"
                    id="paper-file"
                    accept=".pdf"
                    className="form-input"
                    onChange={function (e) { setPaperFile(e.target.files[0]); }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="paper-thumbnail">Thumbnail Image * (Select thumbnail cover)</label>
                  <input
                    type="file"
                    id="paper-thumbnail"
                    accept="image/*"
                    className="form-input"
                    onChange={function (e) { setThumbnail(e.target.files[0]); }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  id="upload-submit-btn"
                >
                  {loading ? 'Uploading...' : 'Save Paper'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                  id="upload-reset-btn"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default AdminUploadPaper;
