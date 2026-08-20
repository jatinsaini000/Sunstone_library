import React, { useState } from 'react';
import { User, Bookmark, BookOpen, Clock, FileText, Send, Trash2, CheckCircle, AlertCircle, Award, GraduationCap, Zap, Play, CheckCircle2 } from 'lucide-react';

export default function StudentProfile({
  user,
  allBooks,
  savedBookIds,
  onToggleSave,
  onOpenReader,
  onOpenQuickSummary,
  onOpenBorrowModal,
  borrowRequests = [],
  userNotes = [],
  onDeleteNote,
  activeTab = 'shelf',
  setActiveTab
}) {
  if (!user) {
    return (
      <div style={{
        background: 'var(--sunstone-card-bg)',
        border: '1px solid var(--sunstone-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '500px',
        margin: '40px auto'
      }}>
        <User size={48} color="var(--sunstone-navy-dark)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--sunstone-text-primary)' }}>
          Student Authentication Required
        </h3>
        <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px' }}>
          Please log in to your official Sunstone student account to access your personal bookshelf, study notes, and borrow history.
        </p>
      </div>
    );
  }

  const savedBooks = allBooks.filter(b => savedBookIds.includes(b.id));
  const myRequests = borrowRequests.filter(r => r.studentId === user.id || r.studentEmail === user.email);
  const myNotes = userNotes.filter(n => n.studentId === user.id);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Student Banner Header Card */}
      <div style={{
        background: 'var(--sunstone-card-bg)',
        border: '1px solid var(--sunstone-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="user-avatar-circle" style={{ width: '64px', height: '64px', fontSize: '26px' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{user.name}</h2>
              <span className="student-badge-pill" style={{ padding: '4px 12px', fontSize: '12px' }}>
                <GraduationCap size={14} color="var(--accent-sunstone-red)" />
                {user.program || 'B.Tech CS'}
              </span>
            </div>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px' }}>
              {user.email} • Sunstone Prayas Lab Scholar
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{
            background: 'var(--sunstone-bg)',
            border: '1px solid var(--sunstone-border)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-sunstone-red)' }}>{savedBooks.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Saved Books</div>
          </div>

          <div style={{
            background: 'var(--sunstone-bg)',
            border: '1px solid var(--sunstone-border)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-blue)' }}>{myRequests.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Borrow Requests</div>
          </div>

          <div style={{
            background: 'var(--sunstone-bg)',
            border: '1px solid var(--sunstone-border)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-emerald)' }}>{myNotes.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Study Notes</div>
          </div>
        </div>
      </div>

      {/* Sunstone Pill Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('shelf')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'shelf' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'shelf' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'shelf' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Bookmark size={15} /> Saved Books Shelf ({savedBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'requests' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'requests' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'requests' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Send size={15} /> Borrowing Requests ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'notes' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'notes' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'notes' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={15} /> Reading Analytics & Notes ({myNotes.length})
        </button>
      </div>

      {/* TAB 1: SAVED BOOKS SHELF (REDESIGNED SUNSTONE PORTAL SHELF CARDS) */}
      {activeTab === 'shelf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {savedBooks.length === 0 ? (
            <div style={{
              background: 'var(--sunstone-card-bg)',
              border: '1px solid var(--sunstone-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <Bookmark size={48} color="var(--sunstone-text-muted)" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--sunstone-text-primary)' }}>Your Bookshelf is Empty</h4>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
                Explore the Sunstone Prayas Lab catalog and click the bookmark icon on any textbook or journal to save it to your personal shelf.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {savedBooks.map((book, idx) => {
                // Mock reading progress % for visual realism
                const progressPercent = Math.min(100, 35 + (idx * 25));
                const currentSavedPage = Math.round((progressPercent / 100) * book.pages);

                return (
                  <div key={book.id} style={{
                    background: 'var(--sunstone-card-bg)',
                    border: '1px solid var(--sunstone-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}>
                    {/* Header info */}
                    <div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          style={{
                            width: '80px',
                            height: '110px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                            <span className="status-badge active" style={{ fontSize: '10px' }}>
                              {book.program}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: 'rgba(37, 99, 235, 0.1)',
                              color: 'var(--accent-blue)'
                            }}>
                              {book.category}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1.3, marginBottom: '4px', color: 'var(--sunstone-text-primary)' }}>
                            {book.title}
                          </h4>
                          <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', marginBottom: '8px' }}>
                            By {book.author}
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', marginTop: 'auto' }}>
                            Total Pages: <strong>{book.pages}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Reading Progress Indicator */}
                      <div style={{
                        background: 'var(--sunstone-bg)',
                        border: '1px solid var(--sunstone-border)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--sunstone-text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} color="var(--accent-blue)" /> In Progress
                          </span>
                          <span style={{ color: 'var(--accent-blue)' }}>{progressPercent}% (Page {currentSavedPage})</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--sunstone-border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-sunstone-red))', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Action controls */}
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--sunstone-border)' }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, padding: '8px', fontSize: '12px', justifyContent: 'center' }}
                        onClick={() => onOpenReader(book)}
                      >
                        <BookOpen size={14} /> Resume Reading
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center' }}
                        onClick={() => onOpenQuickSummary(book)}
                        title="Quick Summary"
                      >
                        <Zap size={14} color="var(--accent-gold)" />
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center' }}
                        onClick={() => onOpenBorrowModal(book)}
                        title="Request Borrow Copy"
                      >
                        <Send size={14} />
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '8px 10px', fontSize: '12px', justifyContent: 'center', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
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
        <div style={{
          background: 'var(--sunstone-card-bg)',
          border: '1px solid var(--sunstone-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '28px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '18px', color: 'var(--sunstone-text-primary)' }}>
            My Borrowing Requests & Status Tracker
          </h3>
          {myRequests.length === 0 ? (
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px' }}>
              You have not submitted any physical or digital book borrow requests yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myRequests.map((req) => (
                <div key={req.id} style={{
                  background: 'var(--sunstone-bg)',
                  border: '1px solid var(--sunstone-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{req.bookTitle}</h4>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', marginBottom: '10px' }}>
                    Requested on {new Date(req.requestDate).toLocaleDateString()} • Type: <strong>{req.borrowType}</strong>
                  </div>
                  <div style={{
                    background: 'var(--sunstone-card-bg)',
                    border: '1px solid var(--sunstone-border)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--sunstone-text-secondary)',
                    marginBottom: '8px'
                  }}>
                    <strong>Your Message to Admin:</strong> "{req.studentMessage}"
                  </div>
                  {req.adminNote && (
                    <div style={{
                      background: 'rgba(37, 99, 235, 0.08)',
                      borderLeft: '3px solid var(--accent-blue)',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: 'var(--sunstone-text-primary)'
                    }}>
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
        <div style={{
          background: 'var(--sunstone-card-bg)',
          border: '1px solid var(--sunstone-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '28px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '18px', color: 'var(--sunstone-text-primary)' }}>
            Saved Personal Study Notes & Reading Analytics
          </h3>
          {myNotes.length === 0 ? (
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px' }}>
              No notes saved yet. Open any book in the Online PDF Reader to add highlights and notes for specific page numbers.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {myNotes.map((note) => (
                <div key={note.id} style={{
                  background: 'var(--sunstone-bg)',
                  border: '1px solid var(--sunstone-border)',
                  borderLeft: '4px solid var(--accent-sunstone-red)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-sunstone-red)', fontWeight: '800', marginBottom: '6px' }}>
                      {note.bookTitle} (Page {note.pageNumber})
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--sunstone-text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {note.noteText}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '14px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--sunstone-border)',
                    fontSize: '11px',
                    color: 'var(--sunstone-text-muted)'
                  }}>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
