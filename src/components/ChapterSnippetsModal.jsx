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
        className="modal-card bottom-sheet-modal snippets-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag/Pull Handle */}
        <div className="sheet-drag-handle"></div>

        {/* Header */}
        <div className="snippets-modal-header">
          <div className="snippets-header-left">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="snippets-header-thumb"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div className="snippets-header-text">
              <div className="snippets-header-badge-row">
                <span className="status-badge active">
                  {book.program}
                </span>
                <span className="snippets-header-sub">
                  Snippets & Summary Preview
                </span>
              </div>
              <h3 className="snippets-header-title">{book.title}</h3>
              <div className="snippets-header-author">By {book.author}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="snippets-close-btn"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile Horizontal Chapter Tabs Bar */}
        <div className="snippets-mobile-tabs-bar">
          {snippets.map((snip, idx) => {
            const isSelected = idx === selectedChapterIndex;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setSelectedChapterIndex(idx)}
                className={`snippets-chapter-tab ${isSelected ? 'active' : ''}`}
              >
                <FileText size={13} />
                <span>Chapter {snip.chapterNumber || idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Sidebar Chapters (Desktop) + Main Snippet */}
        <div className="snippets-modal-body">
          {/* Desktop Chapter Selector Sidebar */}
          <aside className="snippets-desktop-sidebar">
            <div className="snippets-sidebar-heading">
              Available Chapters ({snippets.length})
            </div>

            {snippets.map((snip, idx) => {
              const isSelected = idx === selectedChapterIndex;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedChapterIndex(idx)}
                  className={`snippets-sidebar-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="snippets-item-number">
                    Chapter {snip.chapterNumber || idx + 1}
                  </div>
                  <div className="snippets-item-title">
                    {snip.title || `Chapter ${idx + 1} Summary`}
                  </div>
                </button>
              );
            })}

            {/* Lock Notice in Sidebar */}
            <div className="snippets-sidebar-notice">
              <div className="notice-title">
                <FileText size={14} /> Snippets Access
              </div>
              Reading chapter snippets is free. Full complete book reading requires borrowing.
            </div>
          </aside>

          {/* Snippet Content Area */}
          <main className="snippets-main-content">
            <div className="snippets-content-header">
              <div className="snippets-content-tag">
                Chapter {currentChapter.chapterNumber || selectedChapterIndex + 1} Summary
              </div>
              <span className="snippets-content-pages">
                {book.pages} Pages Complete Book
              </span>
            </div>

            <h2 className="snippets-content-title">
              {currentChapter.title || `Chapter ${selectedChapterIndex + 1}`}
            </h2>

            {/* Main Snippet Paragraph */}
            <div className="snippets-paragraph-box">
              {currentChapter.summary || currentChapter.snippet || book.description}
            </div>

            {/* Highlights list for this snippet */}
            {currentChapter.highlights && currentChapter.highlights.length > 0 && (
              <div className="snippets-highlights-box">
                <h4 className="highlights-heading">
                  <Sparkles size={16} /> Key Takeaways in Chapter {currentChapter.chapterNumber || selectedChapterIndex + 1}:
                </h4>
                <ul className="highlights-list">
                  {currentChapter.highlights.map((item, i) => (
                    <li key={i} className="highlights-item">
                      <CheckCircle2 size={15} color="var(--accent-blue)" className="highlights-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Book Quick Summary */}
            {book.quickSummary?.keyTakeaways && (
              <div className="snippets-outcomes-box">
                <h4 className="outcomes-heading">
                  🎯 Core Learning Outcomes for Full Book:
                </h4>
                <ul className="outcomes-list">
                  {book.quickSummary.keyTakeaways.map((kt, i) => (
                    <li key={i}>{kt}</li>
                  ))}
                </ul>
              </div>
            )}
          </main>
        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="snippets-modal-footer">
          <div className="snippets-footer-note">
            {isBorrowed ? (
              <span className="footer-status unlocked">
                <Unlock size={14} /> You have active borrowed access to this book.
              </span>
            ) : (
              <span className="footer-status locked">
                <Lock size={14} /> Borrow this textbook to unlock complete {book.pages} pages.
              </span>
            )}
          </div>

          <div className="snippets-footer-buttons">
            {isBorrowed ? (
              <button
                type="button"
                className="btn-primary footer-btn"
                style={{ background: 'var(--accent-emerald)' }}
                onClick={() => {
                  onClose();
                  onOpenReader(book);
                }}
              >
                <BookOpen size={16} /> Read Complete Full Book
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary footer-btn"
                onClick={() => {
                  onClose();
                  onOpenBorrowModal(book);
                }}
              >
                <Send size={16} /> Submit Borrow Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
