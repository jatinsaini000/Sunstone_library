import React from 'react';
import BookCard from './BookCard.jsx';
import { BookX, GraduationCap, Code, Briefcase, Sparkles, BookOpenCheck, Layers } from 'lucide-react';

export default function BookGrid({
  selectedProgram = 'All Programs',
  books = [],
  onOpenReader,
  onOpenSnippets,
  onOpenQuickSummary,
  onOpenBorrowModal,
  savedBookIds = [],
  onToggleSave,
  borrowedBookIds = []
}) {
  const programDetails = {
    'MBA': {
      title: 'MBA • Master of Business Administration',
      desc: 'Curated corporate finance, strategic management, consumer analytics, and leadership case studies.',
      icon: GraduationCap
    },
    'B.Tech & BCA': {
      title: 'B.Tech & BCA • Computer Science & Engineering',
      desc: 'Algorithms, data structures, artificial intelligence, operating systems, and system design textbooks.',
      icon: Code
    },
    'BBA': {
      title: 'BBA • Business Administration',
      desc: 'Marketing strategy, accounting principles, entrepreneurship, and digital campaign analytics.',
      icon: Briefcase
    },
    'Special Collections': {
      title: 'Special Collections • Prayas Lab Innovation',
      desc: 'Exclusive research papers, lab experiment manuals, and industry AI deployment blueprints.',
      icon: Sparkles
    },
    'Journals': {
      title: 'Journals • Peer-Reviewed Academic Publications',
      desc: 'Sunstone academic research review papers, empirical studies, and faculty publications.',
      icon: BookOpenCheck
    }
  };

  const currentMeta = programDetails[selectedProgram] || null;
  const IconComponent = currentMeta ? currentMeta.icon : Layers;

  return (
    <div className="book-grid-page">
      {/* Program Banner Header */}
      {currentMeta && (
        <div className="program-banner-card">
          <div className="program-banner-main">
            <div className="program-banner-icon-box">
              <IconComponent size={26} />
            </div>
            <div>
              <div className="program-banner-title-row">
                <h2 className="program-banner-title">{currentMeta.title}</h2>
                <span className="status-badge active">
                  {books.length} {books.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>
              <p className="program-banner-desc">
                {currentMeta.desc}
              </p>
            </div>
          </div>

          <div className="program-banner-badge-pill">
            ⚡ Prayas Lab Curriculum Mapped
          </div>
        </div>
      )}

      {/* Grid Container for Cards */}
      {books.length === 0 ? (
        <div className="empty-catalog-card">
          <BookX size={44} color="var(--sunstone-text-muted)" style={{ marginBottom: '14px' }} />
          <h3 className="empty-catalog-title">
            No Books Found in {selectedProgram}
          </h3>
          <p className="empty-catalog-desc">
            We couldn't find any books matching this program filter. Try selecting another program tab above or clear your search.
          </p>
        </div>
      ) : (
        <div className="book-grid-container">
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
      )}
    </div>
  );
}
