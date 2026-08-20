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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          gap: '24px',
          padding: '28px',
          background: 'var(--sunstone-bg)',
          borderBottom: '1px solid var(--sunstone-border)'
        }}>
          <img
            src={book.coverUrl}
            alt={book.title}
            style={{ width: '150px', height: '210px', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="status-badge active" style={{ fontSize: '11px' }}>
                {book.program}
              </span>
              <span className="status-badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-blue)' }}>
                {book.category}
              </span>
              {isBorrowed ? (
                <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Unlock size={11} style={{ display: 'inline', marginRight: '4px' }} /> Borrowed & Unlocked
                </span>
              ) : (
                <span className="status-badge" style={{ background: 'rgba(255, 77, 90, 0.1)', color: 'var(--accent-sunstone-red)' }}>
                  <Lock size={11} style={{ display: 'inline', marginRight: '4px' }} /> Borrow Required for Full Access
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: 'var(--sunstone-text-primary)' }}>{book.title}</h2>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px', marginBottom: '14px' }}>
              By <strong style={{ color: 'var(--sunstone-text-primary)' }}>{book.author}</strong>
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--sunstone-text-muted)', marginBottom: '18px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                <Star size={14} fill="var(--accent-gold)" /> {book.rating || 4.8}
              </span>
              <span>• {book.pages} Pages</span>
              <span>• Published {book.publishedYear || 2026}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button
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
                  className="btn-secondary"
                  onClick={() => {
                    onClose();
                    onOpenBorrowModal(book);
                  }}
                >
                  <Send size={16} /> Borrow to Unlock Full Book
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--sunstone-border)', padding: '0 28px', background: 'var(--sunstone-card-bg)' }}>
          <div
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '14px 20px',
              fontWeight: '700',
              fontSize: '14px',
              color: activeTab === 'summary' ? 'var(--accent-sunstone-red)' : 'var(--sunstone-text-muted)',
              borderBottom: activeTab === 'summary' ? '3px solid var(--accent-sunstone-red)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            <Zap size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Quick Summary & Key Takeaways
          </div>
          <div
            onClick={() => setActiveTab('details')}
            style={{
              padding: '14px 20px',
              fontWeight: '700',
              fontSize: '14px',
              color: activeTab === 'details' ? 'var(--accent-sunstone-red)' : 'var(--sunstone-text-muted)',
              borderBottom: activeTab === 'details' ? '3px solid var(--accent-sunstone-red)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            Full Book Details
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', background: 'var(--sunstone-card-bg)' }}>
          {activeTab === 'summary' ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={24} color="var(--accent-blue)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Estimated Read Time</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{quickSummary.estimatedReadingTime || '6 Hours'}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BarChart2 size={24} color="var(--accent-sunstone-red)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Target Level</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{quickSummary.difficultyLevel || 'Standard Academic'}</div>
                  </div>
                </div>
              </div>

              {/* Highlights Box */}
              <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} /> Key Book Highlights (Why Read This?)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quickSummary.highlights.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>
                      <CheckCircle2 size={16} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Outcomes Box */}
              <div style={{ background: 'rgba(255, 77, 90, 0.05)', border: '1px solid rgba(255, 77, 90, 0.2)', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-sunstone-red)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} /> Core Learning Outcomes
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quickSummary.keyTakeaways.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>
                      <CheckCircle2 size={16} color="var(--accent-sunstone-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px', color: 'var(--sunstone-text-primary)' }}>Book Overview</h4>
              <p style={{ color: 'var(--sunstone-text-secondary)', lineHeight: 1.6, marginBottom: '24px', fontSize: '14px' }}>
                {book.description || 'No description available for this book.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', padding: '18px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>ISBN / Ref Code</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>{book.isbn || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>Institute Program</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>{book.program}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>Format & Rights</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>
                    {book.fileType === 'file' ? 'Uploaded PDF (Online & Offline)' : 'Digital Cloud Stream'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
