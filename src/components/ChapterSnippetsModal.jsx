import React, { useState } from 'react';
import { X, BookOpen, Send, Lock, Unlock, CheckCircle2, ChevronRight, Sparkles, FileText, Bookmark, Star } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';

export default function ChapterSnippetsModal({
  book,
  onClose,
  onOpenBorrowModal,
  onOpenReader,
  isBorrowed = false
}) {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  if (!book) return null;

  // Fallback chapter snippets if book doesn't have custom chapterSnippets array
  const defaultChapterSnippets = [
    {
      chapterNumber: 1,
      title: 'Chapter 1: Foundational Principles & Core Concepts',
      summary: `This introductory chapter outlines the essential theoretical framework of ${book.title}. It introduces core terminology, fundamental methodologies, and key industry applications relevant to the ${book.program} curriculum.`,
      highlights: book.quickSummary?.highlights || [
        'Fundamental concepts and historical background.',
        'Core methodology used across academic and industrial projects.'
      ]
    },
    {
      chapterNumber: 2,
      title: 'Chapter 2: Advanced Methodologies & Practical Frameworks',
      summary: `Chapter 2 dives into practical problem-solving strategies, step-by-step analytical procedures, and advanced workflows. Students gain insight into how professional teams implement these algorithms and frameworks in real-world environments.`,
      highlights: [
        'Step-by-step operational workflows and execution patterns.',
        'Performance trade-off analysis and optimization techniques.'
      ]
    },
    {
      chapterNumber: 3,
      title: 'Chapter 3: Industry Case Studies & Prayas Lab Application',
      summary: `Focuses on applied case studies, lab experiments, and capstone project references. Includes review questions and practical exercises designed to prepare Sunstone scholars for technical evaluations and semester exams.`,
      highlights: [
        'Real-world enterprise case studies and problem sets.',
        'Exam preparation highlights and lab assignment exercises.'
      ]
    }
  ];

  const snippets = (book.chapterSnippets && book.chapterSnippets.length > 0)
    ? book.chapterSnippets
    : defaultChapterSnippets;

  const currentChapter = snippets[selectedChapterIndex] || snippets[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'var(--sunstone-navy-dark)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={book.coverUrl}
              alt={book.title}
              style={{ width: '42px', height: '56px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span className="status-badge active" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  {book.program}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                  Chapter Snippets & Summary Preview
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>{book.title}</h3>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>By {book.author}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Sidebar Chapters + Main Snippet */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--sunstone-card-bg)' }}>
          {/* Chapter Selector Sidebar */}
          <div
            style={{
              width: '260px',
              borderRight: '1px solid var(--sunstone-border)',
              background: 'var(--sunstone-bg)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 12px',
              gap: '8px',
              overflowY: 'auto'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', padding: '0 8px 4px' }}>
              Available Chapter Snippets ({snippets.length})
            </div>

            {snippets.map((snip, idx) => {
              const isSelected = idx === selectedChapterIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedChapterIndex(idx)}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-sunstone-red)' : '1px solid var(--sunstone-border)',
                    background: isSelected ? 'rgba(255, 77, 90, 0.08)' : 'var(--sunstone-card-bg)',
                    color: isSelected ? 'var(--accent-sunstone-red)' : 'var(--sunstone-text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>
                    Chapter {snip.chapterNumber || idx + 1}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.3 }}>
                    {snip.title || `Chapter ${idx + 1} Summary`}
                  </div>
                </button>
              );
            })}

            {/* Lock Notice in Sidebar */}
            <div
              style={{
                marginTop: 'auto',
                background: 'rgba(37, 99, 235, 0.06)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--sunstone-text-secondary)'
              }}
            >
              <div style={{ fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Snippets Access
              </div>
              Reading chapter snippets is free. Full complete book reading requires borrowing.
            </div>
          </div>

          {/* Snippet Content Area */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-sunstone-red)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Chapter {currentChapter.chapterNumber || selectedChapterIndex + 1} Snippet & Summary
              </div>
              <span style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>
                {book.pages} Pages Complete Book
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sunstone-text-primary)', marginBottom: '16px', lineHeight: 1.3 }}>
              {currentChapter.title || `Chapter ${selectedChapterIndex + 1}`}
            </h2>

            {/* Main Snippet Paragraph */}
            <div
              style={{
                background: 'var(--sunstone-bg)',
                border: '1px solid var(--sunstone-border)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--sunstone-text-primary)',
                marginBottom: '20px'
              }}
            >
              {currentChapter.summary || currentChapter.snippet || book.description}
            </div>

            {/* Highlights list for this snippet */}
            {currentChapter.highlights && currentChapter.highlights.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> Key Takeaways in Chapter {currentChapter.chapterNumber || selectedChapterIndex + 1}:
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentChapter.highlights.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--sunstone-text-secondary)' }}>
                      <CheckCircle2 size={15} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Book Quick Summary */}
            {book.quickSummary?.keyTakeaways && (
              <div style={{ background: 'rgba(255, 77, 90, 0.04)', border: '1px solid rgba(255, 77, 90, 0.15)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-sunstone-red)', marginBottom: '8px' }}>
                  🎯 Core Learning Outcomes for Full Book:
                </h4>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', color: 'var(--sunstone-text-secondary)' }}>
                  {book.quickSummary.keyTakeaways.map((kt, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{kt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer Banner: Restricted Full Access Warning + Action CTA */}
        <div
          style={{
            padding: '16px 24px',
            background: isBorrowed ? 'rgba(16, 185, 129, 0.08)' : 'var(--sunstone-navy-dark)',
            borderTop: '1px solid var(--sunstone-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {isBorrowed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
                <Unlock size={20} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px' }}>Borrow Access Active!</div>
                  <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>You have active borrowing approval for this book.</div>
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ background: '#10b981', padding: '10px 20px', fontSize: '13px' }}
                onClick={() => {
                  onClose();
                  onOpenReader(book);
                }}
              >
                <BookOpen size={16} /> Read Complete Book (PDF)
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 77, 90, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sunstone-red)' }}>
                  <Lock size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#ffffff' }}>Want to read the full complete book?</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Full reading access ({book.pages} pages) requires borrowing approval from Prayas Lab.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => {
                    onClose();
                    onOpenBorrowModal(book);
                  }}
                >
                  <Send size={15} /> Borrow Book to Unlock Full Access
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
