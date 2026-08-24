import React from 'react';
import { BookOpen, Zap, Bookmark, Star, Send, FileText, Lock, Unlock, Eye } from 'lucide-react';

export default function BookCard({
  book,
  onOpenReader,
  onOpenSnippets,
  onOpenQuickSummary,
  onOpenBorrowModal,
  isSaved,
  onToggleSave,
  isBorrowed = false
}) {
  return (
    <div className="netflix-card">
      {/* Poster Image Container - Clicking directly opens Reader */}
      <div
        className="poster-box"
        onClick={() => onOpenReader(book)}
        style={{ cursor: 'pointer' }}
        title={isBorrowed ? 'Click image to read full book' : 'Click image to open free preview (Pages 1–5)'}
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          className="poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="poster-badge">{book.program}</div>

        {/* Borrow Status / Free Preview Badge */}
        <div className={`poster-borrow-badge ${isBorrowed ? 'unlocked' : 'locked'}`}>
          {isBorrowed ? (
            <>
              <Unlock size={10} />
              <span>Full Book</span>
            </>
          ) : (
            <>
              <Eye size={10} />
              <span>1–5p Preview</span>
            </>
          )}
        </div>

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
          onClick={() => onOpenReader(book)}
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
              className="btn-secondary card-action-btn borrow"
              onClick={() => onOpenBorrowModal(book)}
              title="Borrow Physical or Digital Copy"
            >
              <Send size={12} />
              <span>Borrow</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
