import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSendOtp, adminVerifyOtp } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminLogin() {
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
      setError('Please enter your admin email address');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    adminSendOtp(email)
      .then(function (response) {
        setLoading(false);
        setOtpSent(true);
        setSuccess('OTP has been sent to your admin email. Please check your inbox (or console log).');
      })
      .catch(function (err) {
        setLoading(false);
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to send OTP. Please ensure you are a registered active Admin.';
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

    adminVerifyOtp(email, otp)
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
          : 'Invalid or expired OTP. Please check the code and try again.';
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
          <p className="auth-subtitle">Verify your administrative account using Email OTP</p>

          {error && <div className="alert alert-danger" id="admin-login-error">{error}</div>}
          {success && <div className="alert alert-success" id="admin-login-success">{success}</div>}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} id="admin-send-otp-form">
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', backgroundColor: 'var(--accent-orange)', boxShadow: '0 4px 6px rgba(241, 112, 52, 0.2)' }}
                disabled={loading}
                id="admin-send-otp-btn"
              >
                {loading ? 'Sending...' : 'Send Admin OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} id="admin-verify-otp-form">
              <div className="form-group">
                <label className="form-label" htmlFor="admin-otp">Verification OTP</label>
                <input
                  type="text"
                  id="admin-otp"
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
                style={{ width: '100%', backgroundColor: 'var(--accent-orange)', boxShadow: '0 4px 6px rgba(241, 112, 52, 0.2)' }}
                disabled={loading}
                id="admin-verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={function () { setOtpSent(false); setSuccess(''); }}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px' }}
                id="admin-change-email-btn"
              >
                Change Email
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminLogin;
