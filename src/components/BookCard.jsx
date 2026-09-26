import React from 'react';
import { BookOpen, Zap, Bookmark, Star, Send, FileText, Clock } from 'lucide-react';
import { getDriveFileIdForFilename } from '../driveBookMap.js';

export default function BookCard({
  book,
  onOpenReader,
  onOpenSnippets,
  onOpenQuickSummary,
  onOpenBorrowModal,
  isSaved,
  onToggleSave,
  isBorrowed = false,
  activeLoan = null
}) {
  const isLoanedToOther = Boolean(activeLoan && !isBorrowed);

  const localFilename = book?.localPath
    ? book.localPath.split('/').pop()
    : (book?.pdfUrl && book.pdfUrl.includes('/uploads/') ? book.pdfUrl.split('/').pop() : book ? `${book.title}.pdf` : null);

  const driveId = getDriveFileIdForFilename(localFilename || book.title);
  const finalCoverUrl = driveId 
    ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`
    : book.coverUrl;

  return (
    <div className={`netflix-card ${isLoanedToOther ? 'card-on-loan' : ''}`}>
      {/* Poster Image Container */}
      <div
        className="poster-box"
        onClick={() => onOpenSnippets(book)}
        style={{ cursor: 'pointer', position: 'relative' }}
        title="Click image to read chapter snippets"
      >
        <img
          src={finalCoverUrl}
          alt={book.title}
          className="poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="poster-badge">{book.program}</div>

        {/* Live Availability Badge */}
        {isBorrowed ? (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(16, 185, 129, 0.9)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            ✓ Borrowed
          </div>
        ) : isLoanedToOther ? (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Clock size={10} /> On Loan
          </div>
        ) : null}

        {/* Quick Summary Badge Button */}
        <button
          type="button"
          className="poster-summary-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuickSummary(book);
          }}
          title="Click for Quick Summary & Key Takeaways"
        >
          <Zap size={11} />
          <span>Summary</span>
        </button>
      </div>

      {/* Card Info Content */}
      <div className="netflix-card-body">
        <div className="netflix-card-category">
          {book.category}
        </div>
        <h4
          className="netflix-card-title"
          title={book.title}
          onClick={() => onOpenSnippets(book)}
          style={{ cursor: 'pointer' }}
        >
          {book.title}
        </h4>
        <div className="netflix-card-author">
          By {book.author}
        </div>

        <div className="netflix-card-meta">
          <span className="meta-rating">
            <Star size={12} fill="var(--accent-gold)" />
            <span>{book.rating || 4.8}</span>
          </span>
          <span className="meta-pages">{book.pages}p</span>
          <button
            type="button"
            className={`meta-save-btn ${isSaved ? 'saved' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(book.id);
            }}
            title={isSaved ? 'Remove from Shelf' : 'Save to Shelf'}
          >
            <Bookmark size={15} fill={isSaved ? 'var(--accent-sunstone-red)' : 'none'} />
          </button>
        </div>

        {/* Card Action Buttons */}
        <div className="netflix-card-footer">
          {isBorrowed && (
            <button
              type="button"
              className="btn-primary card-action-btn primary"
              onClick={() => onOpenReader(book)}
              title="Open In-App PDF Reader"
            >
              <BookOpen size={13} />
              <span>Read Book</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary card-action-btn secondary"
            onClick={() => onOpenSnippets(book)}
            title="Read Chapter Snippets & Summary"
          >
            <FileText size={13} />
            <span>Snippets</span>
          </button>

          {!isBorrowed && (
            <button
              type="button"
              className={`btn-secondary card-action-btn ${isLoanedToOther ? 'borrowed-other' : 'borrow'}`}
              onClick={() => onOpenBorrowModal(book)}
              title={isLoanedToOther ? 'Currently on loan to another student (1 borrower limit)' : 'Borrow Physical or Digital Copy'}
              style={isLoanedToOther ? { opacity: 0.85, color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' } : {}}
            >
              {isLoanedToOther ? <Clock size={12} /> : <Send size={12} />}
              <span>{isLoanedToOther ? 'On Loan' : 'Borrow'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
