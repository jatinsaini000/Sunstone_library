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
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ padding: '28px', background: 'var(--sunstone-card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={22} style={{ margin: '0 auto' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>Submit Book Borrow Request</h3>
              <p style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>Sunstone Prayas Lab Library Services</p>
            </div>
          </div>

          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--accent-emerald)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>✓</div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Borrow Request Sent!</h4>
              <p style={{ fontSize: '13px', color: 'var(--sunstone-text-secondary)' }}>
                Your message has been sent to the Admin Console. You can track status in your Student Profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', padding: '14px', borderRadius: '10px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={book.coverUrl} alt={book.title} style={{ width: '40px', height: '54px', objectFit: 'cover', borderRadius: '4px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{book.title}</h4>
                  <span className="status-badge active" style={{ fontSize: '10px' }}>{book.program}</span>
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
                  placeholder="Explain why you need this book (e.g., preparing for B.Tech CS mid-term exam, MBA case study project, etc.)..."
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', marginTop: '4px' }}>
                  This message will appear directly in the Admin Console inbox for review.
                </span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }}>
                <Send size={16} /> Send Borrow Request to Admin
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
