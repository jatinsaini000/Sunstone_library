import React, { useRef, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  if (books.length === 0) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e) => {
    if (!rowRef.current) return;
    // Don't drag if clicking buttons inside
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setStartX(e.pageX - rowRef.current.offsetLeft);
    setScrollLeftState(rowRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    rowRef.current.scrollLeft = scrollLeftState - walk;
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

      <div
        className="row-scroll-container"
        ref={rowRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'auto' }}
      >
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
