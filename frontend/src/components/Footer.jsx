import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-widget-title" id="footer-logo">MyExamPapers</h3>
            <p style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.6' }}>
              Meticulously crafted preparation resources for top UK independent and grammar schools. Boosting confidence through expert-created solutions.
            </p>
          </div>
          <div>
            <h3 className="footer-widget-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" id="footer-link-home">Home</Link></li>
              <li><Link to="/login" id="footer-link-papers">Exam Papers</Link></li>
              <li><Link to="/signup" id="footer-link-register">Register</Link></li>
              <li><Link to="/admin/login" id="footer-link-admin">Admin Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="footer-widget-title">Contact Information</h3>
            <div className="footer-info-item" id="footer-contact-email">
              <span>📧</span> support@myexampapers.co.uk
            </div>
            <div className="footer-info-item" id="footer-contact-phone">
              <span>📞</span> +44 (0) 20 8123 4567
            </div>
            <div className="footer-info-item" id="footer-contact-address">
              <span>📍</span> London, United Kingdom
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MyExamPapers.co.uk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
