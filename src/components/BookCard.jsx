import React from 'react';
import { BookOpen, Zap, Bookmark, Star, Send, FileText, Lock, Unlock } from 'lucide-react';

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

        {/* Borrow Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: isBorrowed ? '#10b981' : 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        >
          {isBorrowed ? <><Unlock size={10} /> Borrowed</> : <><Lock size={10} /> Snippets Only</>}
        </div>

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
        <div className="netflix-card-footer" style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn-primary"
            style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center' }}
            onClick={() => onOpenSnippets(book)}
            title="Read Chapter Snippets & Summary"
          >
            <FileText size={12} /> Read Snippets
          </button>

          {isBorrowed ? (
            <button
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
              onClick={() => onOpenReader(book)}
              title="Read Complete Full Book"
            >
              <BookOpen size={12} /> Full Book
            </button>
          ) : (
            <button
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'center' }}
              onClick={() => onOpenBorrowModal(book)}
              title="Borrow Book to Unlock Full Access"
            >
              <Send size={12} /> Borrow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
