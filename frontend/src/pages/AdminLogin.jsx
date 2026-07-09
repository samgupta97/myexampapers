import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminLogin() {
  var navigate = useNavigate();
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    adminLogin(email, password)
      .then(function (response) {
        setLoading(false);
        var data = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/home');
      })
      .catch(function (err) {
        setLoading(false);
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Invalid credentials. Please check your email and password.';
        setError(msg);
      });
  }

  return (
    <div className="app-container" id="admin-login-container">
      <Header />

      <main className="main-content auth-page" id="admin-auth-page">
        <div className="auth-card" style={{ borderTop: '4px solid var(--accent-orange)' }}>
          <div className="auth-header-logo" style={{ color: 'var(--accent-orange)' }} id="admin-card-logo">
            MyExamPapers Admin
          </div>
          <h2 className="auth-title">Admin Portal Login</h2>
          <p className="auth-subtitle">Verify your administrative account</p>

          {error && <div className="alert alert-danger" id="admin-login-error">{error}</div>}
          {success && <div className="alert alert-success" id="admin-login-success">{success}</div>}

          <form onSubmit={handleLogin} id="admin-login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Admin Email Address</label>
              <input
                type="email"
                id="admin-email"
                className="form-input"
                placeholder="admin@myexampapers.co.uk"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                className="form-input"
                placeholder="Enter password (same as email)"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', backgroundColor: 'var(--accent-orange)', boxShadow: '0 4px 6px rgba(241, 112, 52, 0.2)' }}
              disabled={loading}
              id="admin-login-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminLogin;
