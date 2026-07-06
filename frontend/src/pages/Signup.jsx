import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Signup() {
  var navigate = useNavigate();
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [mobile, setMobile] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');

  function handleRegister(e) {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required fields');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    var payload = {
      name: name,
      email: email,
      mobile: mobile
    };

    signup(payload)
      .then(function (response) {
        setLoading(false);
        setSuccess('Registration successful! Redirecting you to the sign-in page...');
        setTimeout(function () {
          navigate('/login');
        }, 2000);
      })
      .catch(function (err) {
        setLoading(false);
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Registration failed. The email address might already be registered.';
        setError(msg);
      });
  }

  return (
    <div className="app-container" id="signup-page-container">
      <Header />

      <main className="main-content auth-page" id="signup-auth-page">
        <div className="auth-card">
          <div className="auth-header-logo" id="signup-card-logo">MyExamPapers</div>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Register to access active entrance exam papers</p>

          {error && <div className="alert alert-danger" id="signup-error-alert">{error}</div>}
          {success && <div className="alert alert-success" id="signup-success-alert">{success}</div>}

          <form onSubmit={handleRegister} id="signup-form">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={function (e) { setName(e.target.value); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <input
                type="email"
                id="signup-email"
                className="form-input"
                placeholder="john@example.com"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-mobile">Mobile Number</label>
              <input
                type="tel"
                id="signup-mobile"
                className="form-input"
                placeholder="e.g. +44 7123 456789"
                value={mobile}
                onChange={function (e) { setMobile(e.target.value); }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
              id="signup-submit-btn"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer-link" id="signup-card-footer">
            Already have an account? <Link to="/login" id="signin-link">Sign In</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Signup;
