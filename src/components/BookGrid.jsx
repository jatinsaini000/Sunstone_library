import React from 'react';
import BookCard from './BookCard.jsx';
import { BookX, GraduationCap, Code, Server, Briefcase, Sparkles, BookOpenCheck, Layers } from 'lucide-react';

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
    'B.Tech CS': {
      title: 'B.Tech CS • Computer Science & Engineering',
      desc: 'Algorithms, data structures, artificial intelligence, operating systems, and system design textbooks.',
      icon: Code
    },
    'BCA': {
      title: 'BCA • Bachelor of Computer Applications',
      desc: 'Full-stack web engineering, database systems, networking, and modern software development.',
      icon: Server
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Program Banner Header */}
      {currentMeta && (
        <div style={{
          background: 'var(--sunstone-card-bg)',
          border: '1px solid var(--sunstone-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--sunstone-navy-dark)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconComponent size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>
                  {currentMeta.title}
                </h2>
                <span className="status-badge active" style={{ fontSize: '11px' }}>
                  {books.length} {books.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', maxWidth: '650px' }}>
                {currentMeta.desc}
              </p>
            </div>
          </div>

          <div className="student-badge-pill" style={{ fontSize: '12px', padding: '6px 14px' }}>
            ⚡ Prayas Lab Curriculum Mapped
          </div>
        </div>
      )}

      {/* Grid Container for Cards */}
      {books.length === 0 ? (
        <div style={{
          background: 'var(--sunstone-card-bg)',
          border: '1px solid var(--sunstone-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          padding: '60px 20px',
          margin: '20px 0'
        }}>
          <BookX size={48} color="var(--sunstone-text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--sunstone-text-primary)' }}>
            No Books Found in {selectedProgram}
          </h3>
          <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            We couldn't find any books matching this program filter. Try selecting another program tab above or reset search.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          paddingTop: '6px'
        }}>
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
