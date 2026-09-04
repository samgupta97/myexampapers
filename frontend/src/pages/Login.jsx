import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
  var navigate = useNavigate();
  var [email, setEmail] = useState('');
  var [password, setPassword] = useState('');
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    setLoading(true);

    login(email, password)
      .then(function (response) {
        setLoading(false);
        var data = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      })
      .catch(function (err) {
        setLoading(false);
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Login failed. Please check your email and password.';
        setError(msg);
      });
  }

  return (
    <div className="app-container" id="login-page-container">
      <Header />

      <main className="main-content auth-page" id="login-auth-page">
        <div className="auth-card">
          <div className="auth-header-logo" id="login-card-logo">MyExamPapers</div>
          <h2 className="auth-title">User Sign In</h2>
          <p className="auth-subtitle">Sign in with your email and password</p>

          {error && <div className="alert alert-danger" id="login-error-alert">{error}</div>}

          <form onSubmit={handleLogin} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={function (e) { setEmail(e.target.value); }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer-link" id="login-card-footer">
            Don't have an account? <Link to="/signup" id="create-account-link">Create an Account</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
