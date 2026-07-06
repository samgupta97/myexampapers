import React from 'react';

function PaperCard(props) {
  var paper = props.paper;
  var isAdmin = props.isAdmin;
  var onEdit = props.onEdit;
  var onDelete = props.onDelete;

  // Build URLs pointing to the backend uploads server
  var backendBaseUrl = 'http://localhost:5000/';
  var thumbnailUrl = paper.thumbnail ? backendBaseUrl + paper.thumbnail : null;
  var fileUrl = paper.paper_file ? backendBaseUrl + paper.paper_file : null;

  var isFree = !paper.price || paper.price === 'Free' || parseFloat(paper.price) === 0;
  var formattedPrice = isFree ? 'Free' : '£' + parseFloat(paper.price).toFixed(2);

  return (
    <div className="card paper-card" id={'paper-card-' + paper.id}>
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

      <span className={`paper-badge ${isFree ? 'paper-badge-free' : 'paper-badge-price'}`} id={'paper-price-badge-' + paper.id}>
        {formattedPrice}
      </span>

      {isAdmin && (
        <span className={`status-indicator ${paper.status === 'Active' ? 'status-active' : 'status-inactive'}`} style={{ position: 'absolute', top: '15px', right: '15px' }} id={'paper-status-badge-' + paper.id}>
          {paper.status}
        </span>
      )}

      <h3 className="paper-title" id={'paper-title-' + paper.id}>{paper.title}</h3>
      
      <div className="paper-meta" id={'paper-meta-' + paper.id}>
        <span><strong>Subject:</strong> {paper.subject || 'N/A'}</span>
        <span><strong>Board:</strong> {paper.exam_board || 'N/A'}</span>
      </div>

      <div className="paper-meta" id={'paper-class-type-' + paper.id}>
        <span><strong>Class:</strong> {paper.class_year || 'N/A'}</span>
        <span><strong>Type:</strong> {paper.paper_type || 'N/A'}</span>
      </div>

      <p className="paper-description" id={'paper-desc-' + paper.id}>
        {paper.description || 'No description available.'}
      </p>

      {!isAdmin ? (
        <div className="paper-actions">
          {fileUrl ? (
            <>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" id={'paper-view-btn-' + paper.id}>
                View
              </a>
              <a href={fileUrl} download={paper.title + '.pdf'} className="btn btn-primary btn-sm" id={'paper-download-btn-' + paper.id}>
                Download
              </a>
            </>
          ) : (
            <span style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
              No PDF file attached
            </span>
          )}
        </div>
      ) : (
        <div className="paper-actions">
          <button onClick={function() { onEdit(paper); }} className="btn btn-secondary btn-sm" id={'paper-edit-btn-' + paper.id}>
            Edit
          </button>
          <button onClick={function() { onDelete(paper.id); }} className="btn btn-danger btn-sm" id={'paper-delete-btn-' + paper.id}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default PaperCard;
