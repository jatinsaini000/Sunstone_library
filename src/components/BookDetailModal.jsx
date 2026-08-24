import React, { useState } from 'react';
import { X, Zap, BookOpen, Clock, BarChart2, CheckCircle2, Send, Star, ShieldCheck, FileText, Lock, Unlock } from 'lucide-react';

export default function BookDetailModal({
  book,
  onClose,
  onOpenReader,
  onOpenSnippets,
  onOpenBorrowModal,
  initialTab = 'summary',
  isBorrowed = false
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!book) return null;

  const quickSummary = book.quickSummary || {
    highlights: [
      'Comprehensive textbook mapped to Sunstone Prayas Lab curriculum.',
      'Includes core theoretical concepts and practical problem sets.'
    ],
    keyTakeaways: [
      'Master key course competencies for academic and industrial success.',
      'Prepare for Sunstone semester exams and lab assessments.'
    ],
    estimatedReadingTime: '8 Hours',
    difficultyLevel: 'Intermediate'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bottom-sheet-modal" onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag/Pull Handle */}
        <div className="sheet-drag-handle"></div>

        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="modal-header-box">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="modal-cover-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="modal-header-meta">
            <div className="modal-badges-row">
              <span className="status-badge active">
                {book.program}
              </span>
              <span className="status-badge category-badge">
                {book.category}
              </span>
              {isBorrowed ? (
                <span className="status-badge borrowed-status">
                  <Unlock size={11} /> Unlocked
                </span>
              ) : (
                <span className="status-badge locked-status">
                  <Lock size={11} /> Snippets Only
                </span>
              )}
            </div>
            <h2 className="modal-book-title">{book.title}</h2>
            <p className="modal-book-author">
              By <strong>{book.author}</strong>
            </p>

            <div className="modal-specs-row">
              <span className="meta-rating-pill">
                <Star size={13} fill="var(--accent-gold)" />
                <span>{book.rating || 4.8}</span>
              </span>
              <span>• {book.pages} Pages</span>
              <span>• {book.publishedYear || 2026}</span>
            </div>

            {/* Desktop Action Buttons in Header */}
            <div className="modal-header-desktop-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onClose();
                  onOpenSnippets(book);
                }}
              >
                <FileText size={16} /> Read Chapter Snippets
              </button>

              {isBorrowed ? (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                >
                  <BookOpen size={16} /> Read Full Book
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    onClose();
                    onOpenBorrowModal(book);
                  }}
                >
                  <Send size={16} /> Borrow Full Book
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs-bar">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <Zap size={15} />
            <span>Quick Summary</span>
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <span>Full Details & Specs</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body-content">
          {activeTab === 'summary' ? (
            <div>
              <div className="summary-stats-grid">
                <div className="summary-stat-box">
                  <Clock size={22} color="var(--accent-blue)" />
                  <div>
                    <div className="stat-label">Estimated Read Time</div>
                    <div className="stat-value">{quickSummary.estimatedReadingTime || '6 Hours'}</div>
                  </div>
                </div>

                <div className="summary-stat-box">
                  <BarChart2 size={22} color="var(--accent-sunstone-red)" />
                  <div>
                    <div className="stat-label">Target Level</div>
                    <div className="stat-value">{quickSummary.difficultyLevel || 'Standard Academic'}</div>
                  </div>
                </div>
              </div>

              {/* Highlights Box */}
              <div className="modal-callout blue-callout">
                <h4 className="callout-title blue">
                  <Zap size={16} /> Key Book Highlights (Why Read This?)
                </h4>
                <ul className="callout-list">
                  {quickSummary.highlights.map((item, idx) => (
                    <li key={idx} className="callout-item">
                      <CheckCircle2 size={16} color="var(--accent-blue)" className="callout-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Outcomes Box */}
              <div className="modal-callout red-callout">
                <h4 className="callout-title red">
                  <ShieldCheck size={16} /> Core Learning Outcomes
                </h4>
                <ul className="callout-list">
                  {quickSummary.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="callout-item">
                      <CheckCircle2 size={16} color="var(--accent-sunstone-red)" className="callout-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="details-section-heading">Book Overview</h4>
              <p className="details-description">
                {book.description || 'No detailed synopsis available for this textbook.'}
              </p>

              <div className="details-specs-grid">
                <div className="spec-item">
                  <div className="spec-label">ISBN / Ref Code</div>
                  <div className="spec-value">{book.isbn || 'N/A'}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Institute Program</div>
                  <div className="spec-value">{book.program}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Format & Rights</div>
                  <div className="spec-value">
                    {book.fileType === 'file' ? 'Uploaded PDF' : 'Cloud Reader Stream'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Action Bar (Swiggy/Zomato style) */}
        <div className="modal-mobile-bottom-bar">
          <button
            type="button"
            className="btn-primary mobile-action-main"
            onClick={() => {
              onClose();
              onOpenSnippets(book);
            }}
          >
            <FileText size={16} />
            <span>Read Snippets</span>
          </button>

          {isBorrowed ? (
            <button
              type="button"
              className="btn-secondary mobile-action-sub unlocked"
              onClick={() => {
                onClose();
                onOpenReader(book);
              }}
            >
              <BookOpen size={16} />
              <span>Full Book</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary mobile-action-sub borrow"
              onClick={() => {
                onClose();
                onOpenBorrowModal(book);
              }}
            >
              <Send size={16} />
              <span>Borrow</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
