import React, { useState } from 'react';
import { User, Bookmark, BookOpen, Clock, FileText, Send, Trash2, CheckCircle, AlertCircle, Award, GraduationCap, Zap, Play, CheckCircle2 } from 'lucide-react';

export default function StudentProfile({
  user,
  allBooks,
  savedBookIds,
  onToggleSave,
  onOpenReader,
  onOpenSnippets,
  onOpenQuickSummary,
  onOpenBorrowModal,
  borrowRequests = [],
  userNotes = [],
  onDeleteNote,
  activeTab = 'shelf',
  setActiveTab,
  borrowedBookIds = []
}) {
  if (!user) {
    return (
      <div className="student-profile-auth-prompt">
        <User size={48} color="var(--sunstone-navy-dark)" style={{ marginBottom: '16px' }} />
        <h3 className="auth-prompt-title">
          Student Authentication Required
        </h3>
        <p className="auth-prompt-desc">
          Please log in to your official Sunstone student account to access your personal bookshelf, study notes, and borrow history.
        </p>
      </div>
    );
  }

  const savedBooks = allBooks.filter(b => savedBookIds.includes(b.id));
  const myRequests = borrowRequests.filter(r => r.studentId === user.id || r.studentEmail === user.email);
  const myNotes = userNotes.filter(n => n.studentId === user.id);

  return (
    <div className="student-profile-wrap">
      {/* Student Banner Header Card */}
      <div className="student-banner-card">
        <div className="student-banner-info">
          <div className="user-avatar-circle student-avatar-big">
            {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="student-details-box">
            <div className="student-name-row">
              <h2 className="student-name-heading">{user.name}</h2>
              <span className="student-badge-pill">
                <GraduationCap size={13} color="var(--accent-sunstone-red)" />
                <span>{user.program || 'B.Tech CS'}</span>
              </span>
            </div>
            <p className="student-email-tag">
              {user.email} • Sunstone Prayas Lab Scholar
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="student-stats-row">
          <div className="student-stat-pill">
            <div className="stat-num red">{savedBooks.length}</div>
            <div className="stat-label">Saved Books</div>
          </div>

          <div className="student-stat-pill">
            <div className="stat-num blue">{myRequests.length}</div>
            <div className="stat-label">Borrow Requests</div>
          </div>

          <div className="student-stat-pill">
            <div className="stat-num green">{myNotes.length}</div>
            <div className="stat-label">Study Notes</div>
          </div>
        </div>
      </div>

      {/* Sunstone Pill Navigation Tabs (Swiggy/Zomato style horizontal scroller) */}
      <div className="profile-tabs-scroller">
        <button
          type="button"
          onClick={() => setActiveTab('shelf')}
          className={`profile-tab-pill ${activeTab === 'shelf' ? 'active' : ''}`}
        >
          <Bookmark size={15} />
          <span>My Shelf ({savedBooks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`profile-tab-pill ${activeTab === 'requests' ? 'active' : ''}`}
        >
          <Send size={15} />
          <span>Borrow Requests ({myRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`profile-tab-pill ${activeTab === 'notes' ? 'active' : ''}`}
        >
          <FileText size={15} />
          <span>Study Notes & Analytics ({myNotes.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED BOOKS SHELF */}
      {activeTab === 'shelf' && (
        <div className="shelf-tab-content">
          {savedBooks.length === 0 ? (
            <div className="empty-state-card">
              <Bookmark size={44} color="var(--sunstone-text-muted)" style={{ marginBottom: '14px' }} />
              <h4 className="empty-state-title">Your Bookshelf is Empty</h4>
              <p className="empty-state-desc">
                Explore the Sunstone Prayas Lab catalog and tap the bookmark icon on any textbook or journal to save it to your personal shelf.
              </p>
            </div>
          ) : (
            <div className="shelf-books-grid">
              {savedBooks.map((book, idx) => {
                const progressPercent = Math.min(100, 35 + (idx * 25));
                const currentSavedPage = Math.round((progressPercent / 100) * book.pages);

                return (
                  <div key={book.id} className="shelf-book-card">
                    {/* Header info */}
                    <div>
                      <div className="shelf-book-top">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="shelf-book-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="shelf-book-info">
                          <div className="shelf-badge-row">
                            <span className="status-badge active">
                              {book.program}
                            </span>
                            <span className="category-tag-mini">
                              {book.category}
                            </span>
                          </div>

                          <h4 className="shelf-book-title" title={book.title}>
                            {book.title}
                          </h4>
                          <div className="shelf-book-author">
                            By {book.author}
                          </div>

                          <div className="shelf-pages-count">
                            Total Pages: <strong>{book.pages}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Reading Progress Indicator */}
                      <div className="reading-progress-box">
                        <div className="progress-header">
                          <span className="progress-label">
                            <Clock size={12} color="var(--accent-blue)" /> In Progress
                          </span>
                          <span className="progress-value">{progressPercent}% (p. {currentSavedPage})</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Action controls */}
                    <div className="shelf-card-actions">
                      <button
                        type="button"
                        className="btn-primary shelf-action-btn"
                        onClick={() => onOpenSnippets(book)}
                        title="Read Chapter Snippets & Summary"
                      >
                        <FileText size={13} />
                        <span>Snippets</span>
                      </button>

                      {borrowedBookIds.includes(book.id) ? (
                        <button
                          type="button"
                          className="btn-secondary shelf-action-btn unlocked"
                          onClick={() => onOpenReader(book)}
                          title="Read Full Book"
                        >
                          <BookOpen size={13} />
                          <span>Full Book</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-secondary shelf-action-btn borrow"
                          onClick={() => onOpenBorrowModal(book)}
                          title="Request Borrow Copy"
                        >
                          <Send size={13} />
                          <span>Borrow</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="shelf-delete-btn"
                        onClick={() => onToggleSave(book.id)}
                        title="Remove from Shelf"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BORROWING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="requests-tab-content">
          <h3 className="tab-section-heading">
            My Borrowing Requests & Status Tracker
          </h3>
          {myRequests.length === 0 ? (
            <p className="empty-subtext">
              You have not submitted any physical or digital book borrow requests yet.
            </p>
          ) : (
            <div className="requests-cards-list">
              {myRequests.map((req) => (
                <div key={req.id} className="request-status-card">
                  <div className="request-card-header">
                    <h4 className="request-book-title">{req.bookTitle}</h4>
                    <span className={`status-badge ${req.status ? req.status.toLowerCase() : 'pending'}`}>
                      {req.status || 'Pending'}
                    </span>
                  </div>
                  <div className="request-card-meta">
                    Requested on {new Date(req.requestDate).toLocaleDateString()} • Type: <strong>{req.borrowType}</strong>
                  </div>
                  <div className="request-card-message">
                    <strong>Your Message to Admin:</strong> "{req.studentMessage}"
                  </div>
                  {req.adminNote && (
                    <div className="request-admin-response">
                      <strong>Admin Response:</strong> {req.adminNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDY NOTES & ANALYTICS */}
      {activeTab === 'notes' && (
        <div className="notes-tab-content">
          <h3 className="tab-section-heading">
            Saved Personal Study Notes & Reading Analytics
          </h3>
          {myNotes.length === 0 ? (
            <p className="empty-subtext">
              No notes saved yet. Open any book in the Online PDF Reader to add highlights and notes for specific page numbers.
            </p>
          ) : (
            <div className="notes-cards-grid">
              {myNotes.map((note) => (
                <div key={note.id} className="note-card-item">
                  <div>
                    <div className="note-card-tag">
                      {note.bookTitle} (Page {note.pageNumber})
                    </div>
                    <p className="note-card-text">
                      {note.noteText}
                    </p>
                  </div>
                  <div className="note-card-footer">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="note-delete-btn"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
