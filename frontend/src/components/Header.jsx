import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from "../assests/myimg.png"

function Header() {
  var navigate = useNavigate();
  var location = useLocation();

  var token = localStorage.getItem('token');
  var userString = localStorage.getItem('user');
  var user = userString ? JSON.parse(userString) : null;
  var role = user ? user.role : null;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <header className="site-header" id="site-header">
      <div className="container header-container">
        <Link to="/" className="logo-link" id="logo-link">
          {/* <span className="logo-text">
            MyExam<span className="logo-accent">Papers</span>
          </span> */}
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "180px",
              height: "60px",
              objectFit: "contain"
            }}
          />
        </Link>

        <nav>
          <ul className="nav-menu" id="nav-menu">
            {/* PUBLIC ROUTES */}
            {!token && (
              <>
                <li>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} id="nav-home">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="btn btn-primary btn-sm" id="nav-login">
                    Sign In
                  </Link>
                </li>
              </>
            )}

            {/* LOGGED IN USER ROUTES */}
            {token && role === 'User' && (
              <>
                <li>
                  <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`} id="nav-user-home">
                    Browse Papers
                  </Link>
                </li>
                <li style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 500 }} id="nav-user-welcome">
                  Hi, {user.name}
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-outline btn-sm" id="nav-logout-user">
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* ADMIN ROUTES */}
            {token && role === 'Admin' && (
              <>
                <li>
                  <Link to="/admin/home" className={`nav-link ${location.pathname === '/admin/home' ? 'active' : ''}`} id="nav-admin-dashboard">
                    Papers Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/upload-paper" className={`nav-link ${location.pathname === '/admin/upload-paper' ? 'active' : ''}`} id="nav-admin-upload">
                    Upload Paper
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`} id="nav-admin-users">
                    Manage Users
                  </Link>
                </li>
                <li style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 500 }} id="nav-admin-welcome">
                  Admin Portal
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-danger btn-sm" id="nav-logout-admin">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
