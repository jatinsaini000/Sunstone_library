import React from 'react';
import { BookOpen, Zap, Bookmark, Star, Send } from 'lucide-react';

export default function BookCard({
  book,
  onOpenReader,
  onOpenQuickSummary,
  onOpenBorrowModal,
  isSaved,
  onToggleSave
}) {
  return (
    <div className="netflix-card" style={{ width: '250px', flex: '0 0 250px' }}>
      {/* Poster Image Container */}
      <div className="poster-box" style={{ height: '220px' }}>
        <img
          src={book.coverUrl}
          alt={book.title}
          className="poster-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="poster-badge">{book.program}</div>

        {/* Quick Summary Badge Button */}
        <div
          className="poster-summary-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenQuickSummary(book);
          }}
          title="Click for Quick Summary & Takeaways"
        >
          <Zap size={11} /> Summary
        </div>
      </div>

      {/* Card Info Content */}
      <div className="netflix-card-body">
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
          {book.category}
        </div>
        <h4 className="netflix-card-title" title={book.title}>{book.title}</h4>
        <div className="netflix-card-author">By {book.author}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--sunstone-text-muted)', marginBottom: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold)', fontWeight: '700' }}>
            <Star size={12} fill="var(--accent-gold)" /> {book.rating || 4.8}
          </span>
          <span>{book.pages} Pages</span>
          <button
            onClick={() => onToggleSave(book.id)}
            style={{ background: 'none', border: 'none', color: isSaved ? 'var(--accent-sunstone-red)' : 'var(--sunstone-text-muted)', cursor: 'pointer' }}
            title={isSaved ? 'Remove from Shelf' : 'Save to Shelf'}
          >
            <Bookmark size={14} fill={isSaved ? 'var(--accent-sunstone-red)' : 'none'} />
          </button>
        </div>

        {/* Card Action Buttons */}
        <div className="netflix-card-footer">
          <button
            className="btn-primary"
            style={{ flex: 1, padding: '6px', fontSize: '12px', justifyContent: 'center' }}
            onClick={() => onOpenReader(book)}
          >
            <BookOpen size={13} /> Read
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px', justifyContent: 'center' }}
            onClick={() => onOpenBorrowModal(book)}
            title="Borrow Copy"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
