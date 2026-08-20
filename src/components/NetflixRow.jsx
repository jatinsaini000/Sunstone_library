import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Zap, BookOpen, Send, Star, Bookmark } from 'lucide-react';

export default function NetflixRow({
  title,
  icon: Icon,
  books = [],
  onOpenReader,
  onOpenQuickSummary,
  onOpenBorrowModal,
  savedBookIds = [],
  onToggleSave
}) {
  const rowRef = useRef(null);

  if (books.length === 0) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="netflix-row">
      <div className="row-header">
        <h3 className="row-title">
          {Icon && <Icon size={20} color="var(--accent-sunstone-red)" />}
          <span>{title}</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sunstone-text-muted)', background: 'var(--sunstone-border)', padding: '2px 8px', borderRadius: '10px' }}>
            {books.length}
          </span>
        </h3>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => handleScroll('left')}
            className="btn-secondary"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="btn-secondary"
            style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="row-scroll-container" ref={rowRef}>
        {books.map((book) => {
          const isSaved = savedBookIds.includes(book.id);

          return (
            <div key={book.id} className="netflix-card">
              <div className="poster-box">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="poster-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="poster-badge">{book.program}</div>
                <div
                  className="poster-summary-btn"
                  onClick={() => onOpenQuickSummary(book)}
                  title="Click for Quick Summary & Takeaways"
                >
                  <Zap size={11} /> Summary
                </div>
              </div>

              <div className="netflix-card-body">
                <h4 className="netflix-card-title" title={book.title}>{book.title}</h4>
                <div className="netflix-card-author">By {book.author}</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--sunstone-text-muted)', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                    <Star size={12} fill="var(--accent-gold)" /> {book.rating || 4.8}
                  </span>
                  <span>{book.pages} Pages</span>
                  <button
                    onClick={() => onToggleSave(book.id)}
                    style={{ background: 'none', border: 'none', color: isSaved ? 'var(--accent-sunstone-red)' : 'var(--sunstone-text-muted)', cursor: 'pointer' }}
                  >
                    <Bookmark size={14} fill={isSaved ? 'var(--accent-sunstone-red)' : 'none'} />
                  </button>
                </div>

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
                    title="Borrow copy"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
