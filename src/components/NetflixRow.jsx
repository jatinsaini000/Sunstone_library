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
      const scrollAmount = direction === 'left' ? -320 : 320;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="netflix-row">
      <div className="row-header">
        <h3 className="row-title">
          {Icon && <Icon size={20} className="row-icon" />}
          <span className="row-title-text">{title}</span>
          <span className="row-count-badge">
            {books.length}
          </span>
        </h3>

        <div className="row-arrows-wrap">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="row-nav-btn"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="row-nav-btn"
            aria-label="Scroll right"
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
    </section>
  );
}
