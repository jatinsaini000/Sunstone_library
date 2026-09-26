import React from 'react';
import { BookOpen, Sparkles, FileText, Send, Clock } from 'lucide-react';

export default function HeroBanner({
  book,
  onOpenReader,
  onOpenSnippets,
  onOpenBorrowModal,
  isBorrowed = false,
  activeLoan = null
}) {
  if (!book) return null;

  const isLoanedToOther = Boolean(activeLoan && !isBorrowed);

  return (
    <div className="hero-billboard">
      <img
        src={book.coverUrl}
        alt={book.title}
        className="billboard-bg-img"
        style={{ cursor: 'pointer' }}
        onClick={() => onOpenSnippets(book)}
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80';
        }}
      />
      <div className="billboard-overlay"></div>

      <div className="billboard-content">
        <div className="billboard-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={12} />
          <span>FEATURED IN PRAYAS LAB • {book.program}</span>
          {isLoanedToOther && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '20px',
              marginLeft: '6px'
            }}>
              On Loan (1-Borrower Limit)
            </span>
          )}
        </div>
        <h2
          className="billboard-title"
          style={{ cursor: 'pointer' }}
          onClick={() => onOpenSnippets(book)}
        >
          {book.title}
        </h2>
        <p className="billboard-desc">
          {book.description || 'Essential academic textbook curated for Sunstone scholars with interactive digital reader and personal study note tools.'}
        </p>

        <div className="billboard-actions">
          {isBorrowed && (
            <button
              type="button"
              className="btn-play-netflix"
              onClick={() => onOpenReader(book)}
            >
              <BookOpen size={16} />
              <span>Read Full Book</span>
            </button>
          )}

          <button
            type="button"
            className="btn-info-netflix"
            onClick={() => onOpenSnippets(book)}
          >
            <FileText size={16} />
            <span>Chapter Snippets</span>
          </button>

          {!isBorrowed && (
            <button
              type="button"
              className="btn-info-netflix"
              onClick={() => onOpenBorrowModal(book)}
              style={isLoanedToOther ? { background: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.5)' } : {}}
            >
              {isLoanedToOther ? <Clock size={16} /> : <Send size={16} />}
              <span>{isLoanedToOther ? 'Currently On Loan' : 'Borrow Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
