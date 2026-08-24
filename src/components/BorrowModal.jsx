import React, { useState } from 'react';
import { X, Send, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function BorrowModal({ book, user, onClose, onSubmitBorrowRequest }) {
  const [borrowType, setBorrowType] = useState('Physical Copy');
  const [studentMessage, setStudentMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
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
              <p className="borrow-modal-sub">Sunstone Prayas Lab Library</p>
            </div>
          </div>

          {successMsg ? (
            <div className="borrow-success-box">
              <div className="borrow-success-check">✓</div>
              <h4 className="borrow-success-title">Borrow Request Sent!</h4>
              <p className="borrow-success-desc">
                Your message has been sent to the Admin Console. You can track approval status in your Student Profile.
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
                  <span className="status-badge active">{book.program}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Borrow Mode</label>
                <select
                  className="form-control"
                  value={borrowType}
                  onChange={(e) => setBorrowType(e.target.value)}
                >
                  <option value="Physical Copy">Physical Book Copy (Collect at Prayas Lab Counter)</option>
                  <option value="Digital Offline Loan">Digital Loan (Extended Offline Download Rights)</option>
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
                  This message will appear directly in the Admin Console inbox.
                </span>
              </div>

              <button type="submit" className="btn-primary borrow-submit-btn">
                <Send size={16} />
                <span>Send Borrow Request to Admin</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
