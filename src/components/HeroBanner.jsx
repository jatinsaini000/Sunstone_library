import React from 'react';
import { Play, Zap, Sparkles, BookOpen, FileText, Send, Unlock, Lock } from 'lucide-react';

export default function HeroBanner({
  book,
  onOpenReader,
  onOpenSnippets,
  onOpenQuickSummary,
  onOpenBorrowModal,
  isBorrowed = false
}) {
  if (!book) return null;

  return (
    <div className="hero-billboard">
      <img
        src={book.coverUrl}
        alt={book.title}
        className="billboard-bg-img"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80';
        }}
      />
      <div className="billboard-overlay"></div>

      <div className="billboard-content">
        <div className="billboard-tag">
          <Sparkles size={12} />
          <span>FEATURED IN PRAYAS LAB • {book.program}</span>
        </div>
        <h2 className="billboard-title">{book.title}</h2>
        <p className="billboard-desc">
          {book.description || 'Essential academic textbook curated for Sunstone scholars with interactive digital reader and personal study note tools.'}
        </p>

        <div className="billboard-actions">
          <button
            type="button"
            className="btn-play-netflix"
            onClick={() => onOpenSnippets(book)}
          >
            <FileText size={16} />
            <span>Read Snippets</span>
          </button>

          {isBorrowed ? (
            <button
              type="button"
              className="btn-info-netflix borrowed-btn"
              onClick={() => onOpenReader(book)}
            >
              <BookOpen size={16} />
              <span>Full Book</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-info-netflix"
              onClick={() => onOpenBorrowModal(book)}
            >
              <Send size={16} color="var(--accent-gold)" />
              <span>Borrow Book</span>
            </button>
          )}

          <button
            type="button"
            className="btn-info-netflix summary-btn"
            onClick={() => onOpenQuickSummary(book)}
            title="Quick Overview & Key Takeaways"
          >
            <Zap size={16} color="var(--accent-gold)" />
            <span>Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
