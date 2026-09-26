import React, { useState } from 'react';
import { X, Send, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function BorrowModal({ book, user, onClose, onSubmitBorrowRequest, activeLoan }) {
  const [borrowType, setBorrowType] = useState('Physical Copy');
  const [studentMessage, setStudentMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!book) return null;

  const isLoanedToMe = activeLoan && user && (activeLoan.studentId === user.id || activeLoan.studentEmail === user.email);
  const isLoanedToOther = activeLoan && !isLoanedToMe;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoanedToOther) return;

    onSubmitBorrowRequest({
      bookId: book.id,
      bookTitle: book.title,
      borrowType,
      studentMessage: studentMessage || 'I would like to borrow this book for my coursework and reference at Sunstone.'
    });
    setSuccessMsg(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bottom-sheet-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Handle */}
        <div className="sheet-drag-handle"></div>

        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="borrow-modal-content">
          <div className="borrow-header-row">
            <div className="borrow-icon-box">
              <Send size={20} />
            </div>
            <div>
              <h3 className="borrow-modal-title">Submit Borrow Request</h3>
              <p className="borrow-modal-sub">Sunstone Prayas Lab Library • 1 Borrower Limit</p>
            </div>
          </div>

          {successMsg ? (
            <div className="borrow-success-box">
              <div className="borrow-success-check">✓</div>
              <h4 className="borrow-success-title">Borrow Request Sent!</h4>
              <p className="borrow-success-desc">
                Your request has been submitted to the Admin Console. You can track approval status in your Student Profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="borrow-form">
              <div className="borrow-book-preview">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="borrow-book-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="borrow-book-info">
                  <h4 className="borrow-book-name">{book.title}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span className="status-badge active">{book.program}</span>
                    {isLoanedToOther ? (
                      <span className="status-badge rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> Currently Borrowed
                      </span>
                    ) : (
                      <span className="status-badge active" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', borderColor: 'rgba(16,185,129,0.3)' }}>
                        ✓ Available to Borrow
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1-Borrower Rule Notice */}
              {isLoanedToOther && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#dc2626', fontSize: '13px', display: 'block', marginBottom: '2px' }}>
                      Single-Borrower Limit: Book Currently On Loan
                    </strong>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--sunstone-text-secondary)', lineHeight: 1.4 }}>
                      This book is currently issued to another student ({activeLoan.studentName || 'Student Scholar'}). Only one user can borrow a book at a time. It will become available once marked as Returned by the library administrator.
                    </p>
                  </div>
                </div>
              )}

              {isLoanedToMe && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: '#059669', fontSize: '13px', display: 'block' }}>
                      You Have Already Borrowed This Book
                    </strong>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--sunstone-text-secondary)' }}>
                      This book is already active on your shelf. You can read it directly in the app.
                    </p>
                  </div>
                </div>
              )}

              {!isLoanedToOther && !isLoanedToMe && (
                <>
                  <div className="form-group">
                    <label className="form-label">Borrow Mode</label>
                    <select
                      className="form-control"
                      value={borrowType}
                      onChange={(e) => setBorrowType(e.target.value)}
                    >
                      <option value="Physical Copy">Physical Book Copy (Collect at Prayas Lab Counter)</option>
                      <option value="Digital Offline Loan">Digital Loan (Extended Offline Reading Rights)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message / Reason for Admin *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Explain why you need this book (e.g. preparing for exams, lab assignments)..."
                      value={studentMessage}
                      onChange={(e) => setStudentMessage(e.target.value)}
                      required
                    />
                    <span className="form-hint">
                      Only 1 student can borrow this book at a time. The admin will review and approve.
                    </span>
                  </div>

                  <button type="submit" className="btn-primary borrow-submit-btn">
                    <Send size={16} />
                    <span>Send Borrow Request to Admin</span>
                  </button>
                </>
              )}

              {isLoanedToOther && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                >
                  Close (Book Unavailable)
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
