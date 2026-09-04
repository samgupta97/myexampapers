import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPapers } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function LandingPage() {
  var [uploadedPapers, setUploadedPapers] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    getPapers(false) // Fetch only Active papers
      .then(function (response) {
        setLoading(false);
        if (response.data.success) {
          setUploadedPapers(response.data.papers);
        }
      })
      .catch(function (err) {
        setLoading(false);
        console.error('Failed to load papers on landing page:', err);
      });
  }, []);

  // Static exam categories data
  var categories = [
    {
      id: 'cat-7',
      title: '7+ Papers',
      desc: 'Comprehensive preparation for 7+ school entrance exams.',
      bullets: ['English & Mathematics', 'Practice Tests', 'Detailed Solutions']
    },
    {
      id: 'cat-8',
      title: '8+ Papers',
      desc: 'Everything needed for 8+ entrance exam success.',
      bullets: ['English, Maths & Reasoning', 'Timed Test Papers', 'Answer Explanations']
    },
    {
      id: 'cat-9',
      title: '9+ Papers',
      desc: 'Comprehensive 9+ exam preparation resources.',
      bullets: ['Full Subject Coverage', 'School-Specific Papers', 'Examiner Tips']
    },
    {
      id: 'cat-10',
      title: '10+ Papers',
      desc: 'Complete 10+ exam preparation package.',
      bullets: ['All Core Subjects', 'Mock Exams', 'Parent Guides']
    },
    {
      id: 'cat-11',
      title: '11+ Papers',
      desc: 'Premier 11+ exam papers for grammar & independent schools.',
      bullets: ['CEM & GL Assessment', 'School-Specific Papers', 'Detailed Answer Guides']
    },
    {
      id: 'cat-13',
      title: '13+ Papers',
      desc: 'Comprehensive preparation for 13+ Common Entrance exams.',
      bullets: ['All CE Subjects', 'Past Papers', 'Expert Solutions']
    }
  ];

  return (
    <div className="app-container" id="landing-page-container">
      <Header />
      
      <main className="main-content">
        {/* HERO SECTION */}
        <section className="hero-section" id="hero-section" style={{ padding: '100px 0 80px' }}>
          <div className="container">
            <h1 className="hero-title" id="hero-title">
              Unlock your Child's Potential with <span style={{ color: 'var(--primary-color)' }}>Premium Exam Papers</span>
            </h1>
            <p className="hero-subtitle" id="hero-subtitle">
              Tailored preparation resources for 7+, 8+, 9+, 10+, 11+, 13+, and beyond. Expert-led courses to boost exam confidence.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link to="/signup" className="btn btn-primary" id="hero-signup-btn">
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline" id="hero-login-btn">
                Browse Papers
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="section-padding" id="about-section" style={{ backgroundColor: '#ffffff' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            <div>
              <div className="section-header" style={{ marginBottom: '25px' }}>
                <h2 className="section-title">About MyExamPapers</h2>
                <p className="section-subtitle">The entrance exam preparation specialists</p>
              </div>
              <p style={{ color: 'var(--text-light)', marginBottom: '20px', fontSize: '15px' }}>
                MyExamPapers.co.uk is the UK's leading provider of school entrance exam materials. Our papers are designed by premier educators who understand the syllabus and nuances of competitive entrance assessments.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontWeight: 500 }} id="about-item-1">
                  <span style={{ color: 'var(--green-success)', fontSize: '18px' }}>✓</span> 100% curriculum aligned content
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontWeight: 500 }} id="about-item-2">
                  <span style={{ color: 'var(--green-success)', fontSize: '18px' }}>✓</span> Highly structured explanations
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontWeight: 500 }} id="about-item-3">
                  <span style={{ color: 'var(--green-success)', fontSize: '18px' }}>✓</span> Hand-crafted by independent school specialists
                </li>
              </ul>
            </div>
            <div style={{ padding: '30px', backgroundColor: 'rgba(185, 37, 134, 0.03)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--card-border)' }} id="about-highlight-box">
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px', fontSize: '20px', fontWeight: 700 }}>Synthesis Courses</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '15px' }}>
                Alongside papers, we offer specialized online and hybrid courses for 7+, 8+, and 11+ entrance exams to boost your child's confidence.
              </p>
              <a href="https://myexampapers.co.uk/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" id="about-enquire-btn">Enquire Now</a>
            </div>
          </div>
        </section>

        {/* EXAM PAPERS CATEGORIES SECTION */}
        <section className="section-padding" id="papers-overview-section" style={{ backgroundColor: '#fafafa' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', borderLeft: 'none', paddingLeft: 0 }}>
              <h2 className="section-title">Entrance Exam Papers</h2>
              <p className="section-subtitle">Exemplary practice packs with step-by-step guidance</p>
            </div>
            
            <div className="grid grid-3" style={{ marginTop: '40px' }} id="exam-categories-grid">
              {categories.map(function (cat) {
                return (
                  <div className="card" key={cat.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }} id={cat.id}>
                    <div style={{ color: '#f1c40f', fontSize: '13px', marginBottom: '10px', fontWeight: 600 }}>
                      ⭐ 4.9/5 <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{'{42 Review}'}</span>
                    </div>
                    <h3 className="paper-title" style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '8px' }}>
                      {cat.title}
                    </h3>
                    <p className="paper-description" style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '20px' }}>
                      {cat.desc}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '25px', flexGrow: 1 }}>
                      {cat.bullets.map(function (bullet, idx) {
                        return (
                          <li key={idx} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 500 }}>
                            <span style={{ color: 'var(--green-success)' }}>✓</span> {bullet}
                          </li>
                        );
                      })}
                    </ul>
                    <a
                      href="https://myexampapers.co.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', textAlign: 'center' }}
                      id={'view-more-' + cat.id}
                    >
                      View More
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* UPLOADED EXAM PAPERS DYNAMIC SECTION */}
        <section className="section-padding" id="uploaded-papers-section" style={{ backgroundColor: '#ffffff' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Uploaded Practice Papers</h2>
              <p className="section-subtitle">Real-time uploads available in our database</p>
            </div>

            {loading ? (
              <div className="spinner"></div>
            ) : uploadedPapers.length === 0 ? (
              <div className="no-data" id="no-uploaded-papers">
                <p style={{ color: 'var(--text-light)' }}>No practice papers uploaded to the database yet.</p>
                <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop: '15px' }}>
                  Log In to Upload
                </Link>
              </div>
            ) : (
              <div className="grid grid-3" style={{ marginTop: '40px' }} id="landing-uploaded-grid">
                {uploadedPapers.slice(0, 6).map(function (paper) {
                  var isFree = !paper.price || paper.price === 'Free' || parseFloat(paper.price) === 0;
                  var formattedPrice = isFree ? 'Free' : '£' + parseFloat(paper.price).toFixed(2);
                  var thumbnailUrl = paper.thumbnail ? 'http://localhost:5000/' + paper.thumbnail : null;

                  return (
                    <div className="card paper-card" key={paper.id} id={'landing-paper-' + paper.id}>
                      <div className="paper-img-container">
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={paper.title} className="paper-img" onError={function(e) {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<span class="paper-placeholder-img">📄</span>';
                          }} />
                        ) : (
                          <span className="paper-placeholder-img">📄</span>
                        )}
                      </div>
                      
                      <span className={`paper-badge ${isFree ? 'paper-badge-free' : 'paper-badge-price'}`}>
                        {formattedPrice}
                      </span>
                      
                      <h3 className="paper-title" style={{ fontSize: '18px' }}>{paper.title}</h3>
                      
                      <div className="paper-meta">
                        <span><strong>Subject:</strong> {paper.subject || 'N/A'}</span>
                        <span><strong>Board:</strong> {paper.exam_board || 'N/A'}</span>
                      </div>

                      <div className="paper-meta" style={{ marginBottom: '15px' }}>
                        <span><strong>Class:</strong> {paper.class_year || 'N/A'}</span>
                        <span><strong>Type:</strong> {paper.paper_type || 'N/A'}</span>
                      </div>

                      <a
                        href="https://myexampapers.co.uk/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginTop: 'auto', textAlign: 'center' }}
                        id={'view-more-uploaded-' + paper.id}
                      >
                        View More
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="section-padding" id="why-choose-us" style={{ backgroundColor: '#fafafa' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', borderLeft: 'none', paddingLeft: 0, marginBottom: '60px' }}>
              <h2 className="section-title">Why Choose Our Exam Papers?</h2>
              <p className="section-subtitle">Designed to replicate top grammar and independent school exams</p>
            </div>

            <div className="grid grid-3">
              <div className="card" style={{ textAlign: 'center', padding: '35px 25px' }} id="feature-1">
                <div style={{ fontSize: '36px', marginBottom: '15px' }}>🎓</div>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Expert-Created</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                  Written by school masters and experienced tutors from premier London institutions.
                </p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '35px 25px' }} id="feature-2">
                <div style={{ fontSize: '36px', marginBottom: '15px' }}>💡</div>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Detailed Solutions</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                  Step-by-step explanations, model responses, and clear scoring guidance.
                </p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '35px 25px' }} id="feature-3">
                <div style={{ fontSize: '36px', marginBottom: '15px' }}>📈</div>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Progress Tracking</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                  Designed to highlight gaps in subject knowledge and support targeted remediation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
