import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookCard from './BookCard.jsx';

export default function NetflixRow({
  title,
  icon: Icon,
  books = [],
  onOpenReader,
  onOpenSnippets,
  onOpenQuickSummary,
  onOpenBorrowModal,
  savedBookIds = [],
  onToggleSave,
  borrowedBookIds = []
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
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onOpenReader={onOpenReader}
            onOpenSnippets={onOpenSnippets}
            onOpenQuickSummary={onOpenQuickSummary}
            onOpenBorrowModal={onOpenBorrowModal}
            isSaved={savedBookIds.includes(book.id)}
            onToggleSave={onToggleSave}
            isBorrowed={borrowedBookIds.includes(book.id)}
          />
        ))}
      </div>
    </div>
  );
}
