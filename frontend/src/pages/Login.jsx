import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
  var navigate = useNavigate();
  var [email, setEmail] = useState('');
  var [otp, setOtp] = useState('');
  var [otpSent, setOtpSent] = useState(false);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [success, setSuccess] = useState('');

  function handleSendOtp(e) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    sendOtp(email)
      .then(function (response) {
        setLoading(false);
        setOtpSent(true);
        setSuccess('OTP has been sent to your email. Please check your inbox (or console log).');
      })
      .catch(function (err) {
        setLoading(false);
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to send OTP. Please ensure your account is active and registered as a User.';
        setError(msg);
      });
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    verifyOtp(email, otp)
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
          : 'Invalid or expired OTP. Please try again.';
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
          <p className="auth-subtitle">We will send a one-time password (OTP) to your email</p>

          {error && <div className="alert alert-danger" id="login-error-alert">{error}</div>}
          {success && <div className="alert alert-success" id="login-success-alert">{success}</div>}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} id="send-otp-form">
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
                id="send-otp-btn"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} id="verify-otp-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-otp">OTP Verification Code</label>
                <input
                  type="text"
                  id="login-otp"
                  className="form-input"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={function (e) { setOtp(e.target.value); }}
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
                id="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={function () { setOtpSent(false); setSuccess(''); }}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px' }}
                id="change-email-btn"
              >
                Change Email
              </button>
            </form>
          )}

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
