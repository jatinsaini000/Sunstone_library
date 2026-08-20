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
          <Sparkles size={13} /> FEATURED IN PRAYAS LAB • {book.program}
        </div>
        <h2 className="billboard-title">{book.title}</h2>
        <p className="billboard-desc">
          {book.description || 'Essential academic textbook curated for Sunstone scholars with interactive digital reader and personal study note tools.'}
        </p>

        <div className="billboard-actions">
          <button className="btn-play-netflix" onClick={() => onOpenSnippets(book)}>
            <FileText size={18} /> Read Chapter Snippets
          </button>

          {isBorrowed ? (
            <button className="btn-info-netflix" style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', color: '#ffffff' }} onClick={() => onOpenReader(book)}>
              <BookOpen size={18} /> Read Full Book
            </button>
          ) : (
            <button className="btn-info-netflix" onClick={() => onOpenBorrowModal(book)}>
              <Send size={18} color="var(--accent-gold)" /> Borrow to Unlock Full Book
            </button>
          )}

          <button className="btn-info-netflix" style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.1)' }} onClick={() => onOpenQuickSummary(book)} title="Quick Overview">
            <Zap size={18} color="var(--accent-gold)" /> Summary
          </button>
        </div>
      </div>
    </div>
  );
}
