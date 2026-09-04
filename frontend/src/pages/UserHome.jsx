import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPapers } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaperCard from '../components/PaperCard';

function UserHome() {
  var navigate = useNavigate();
  var [papers, setPapers] = useState([]);
  var [filteredPapers, setFilteredPapers] = useState([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  
  // Search and filter states
  var [searchTerm, setSearchTerm] = useState('');
  var [selectedSubject, setSelectedSubject] = useState('All');
  var [subjects, setSubjects] = useState([]);

  useEffect(function () {
    var token = localStorage.getItem('token');
    var userString = localStorage.getItem('user');
    if (!token || !userString) {
      navigate('/login');
      return;
    }

    getPapers(false) // Fetch only active papers
      .then(function (response) {
        setLoading(false);
        var data = response.data;
        if (data.success) {
          setPapers(data.papers);
          setFilteredPapers(data.papers);

          // Extract unique subjects for the filter dropdown
          var uniqueSubjects = ['All'];
          data.papers.forEach(function (paper) {
            if (paper.subject && !uniqueSubjects.includes(paper.subject)) {
              uniqueSubjects.push(paper.subject);
            }
          });
          setSubjects(uniqueSubjects);
        } else {
          setError('Failed to load papers');
        }
      })
      .catch(function (err) {
        setLoading(false);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Error connecting to backend API');
        }
      });
  }, [navigate]);

  // Handle Search and Filter changes
  useEffect(function () {
    var result = papers;

    // Search by title
    if (searchTerm.trim() !== '') {
      result = result.filter(function (paper) {
        return paper.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      result = result.filter(function (paper) {
        return paper.subject === selectedSubject;
      });
    }

    setFilteredPapers(result);
  }, [searchTerm, selectedSubject, papers]);

  return (
    <div className="app-container" id="user-home-container">
      <Header />

      <main className="main-content container section-padding" id="user-home-main">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 className="section-title">Available Exam Papers</h1>
            <p className="section-subtitle">Browse and download high-quality practice papers</p>
          </div>
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }} id="search-filter-bar">
            <input
              type="text"
              placeholder="Search by title..."
              className="form-input"
              style={{ width: '220px', padding: '8px 12px', fontSize: '14px' }}
              value={searchTerm}
              onChange={function (e) { setSearchTerm(e.target.value); }}
              id="search-input"
            />
            
            <select
              className="form-input form-select"
              style={{ width: '180px', padding: '8px 12px', fontSize: '14px' }}
              value={selectedSubject}
              onChange={function (e) { setSelectedSubject(e.target.value); }}
              id="subject-filter"
            >
              {subjects.map(function (sub) {
                return (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="spinner" id="loading-spinner"></div>
        ) : error ? (
          <div className="alert alert-danger" id="user-home-error">{error}</div>
        ) : filteredPapers.length === 0 ? (
          <div className="no-data" id="no-papers-found">
            <h3>No papers found matching your criteria.</h3>
            <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>Check back later or try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-3" id="papers-grid">
            {filteredPapers.map(function (paper) {
              return (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  isAdmin={false}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default UserHome;
