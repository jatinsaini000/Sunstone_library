import React, { useState, useEffect } from 'react';
import {
  X, Bookmark, FileText, Plus, Trash2,
  Maximize2, Minimize2, ExternalLink
} from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';
import { resolvePdfViewerUrl } from '../googleDriveHelper.js';

export default function PdfReaderModal({
  book,
  onClose,
  userNotes = [],
  onAddNote,
  onDeleteNote,
}) {
  const [showNotesDrawer, setShowNotesDrawer] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 900 : false;
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [manualPageNum, setManualPageNum] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  const localFilename = book?.localPath
    ? book.localPath.split('/').pop()
    : (book?.pdfUrl && book.pdfUrl.includes('/uploads/') ? book.pdfUrl.split('/').pop() : book ? `${book.title}.pdf` : null);

  const embedPdfUrl = book ? resolvePdfViewerUrl(book.pdfUrl, {
    filename: localFilename,
    title: book.title
  }) : null;

  useEffect(() => {
    if (!book) return;
    setPdfLoadError(false);
    setPdfLoading(Boolean(embedPdfUrl));
  }, [book?.id, embedPdfUrl]);

  if (!book) return null;

  // Toggle Browser Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote({
      bookId: book.id,
      bookTitle: book.title,
      pageNumber: manualPageNum || 'N/A',
      noteText: newNoteText
    });
    setNewNoteText('');
    setManualPageNum('');
  };

  const currentBookNotes = userNotes.filter((n) => n.bookId === book.id);

  return (
    <div className="pdf-reader-root" style={{ background: '#090d16' }}>
      {/* TOP CONTROL BAR */}
      <header className="pdf-reader-topbar">
        {/* Left: Brand, Exit & Book Title */}
        <div className="pdf-reader-brand">
          <button onClick={onClose} className="pdf-reader-exit-btn" title="Exit Reader">
            <X size={16} />
            <span>Exit Reader</span>
          </button>
          <div className="pdf-reader-divider"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <SunstoneLogo size={22} color="#ffffff" />
            <div className="pdf-reader-title-box">
              <h3 title={book.title}>{book.title}</h3>
              <div className="pdf-reader-subtitle-row">
                <span className="pdf-reader-subtitle-text" style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {book.program} • {book.author}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap'
                }}>
                  Full Book Unlocked
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Desktop Controls */}
        <div className="pdf-reader-desktop-actions">
          {/* Bookmark Toggle */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            style={{
              background: isBookmarked ? 'rgba(255, 77, 90, 0.25)' : 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: isBookmarked ? '#ff4d5a' : '#ffffff',
              padding: '6px 12px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            <Bookmark size={14} fill={isBookmarked ? '#ff4d5a' : 'none'} />
            {isBookmarked ? 'Saved' : 'Bookmark'}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Notes Drawer Toggle */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            style={{
              background: showNotesDrawer ? '#2563eb' : 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            <FileText size={15} /> Notes ({currentBookNotes.length})
          </button>
        </div>

        {/* Right: Mobile Compact Action Icons */}
        <div className="pdf-reader-mobile-actions">
          <button
            className={`pdf-reader-action-icon-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
            title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
          >
            <Bookmark size={16} fill={isBookmarked ? '#ffffff' : 'none'} />
          </button>
          <button
            className={`pdf-reader-action-icon-btn ${showNotesDrawer ? 'active' : ''}`}
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            title="Toggle Notes"
          >
            <FileText size={16} />
            {currentBookNotes.length > 0 && (
              <span className="badge-pill">{currentBookNotes.length}</span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN READING WORKSPACE */}
      <div className="pdf-reader-workspace">
        {/* CENTER: PDF CANVAS VIEWER */}
        <div className="pdf-reader-canvas-container">
          {embedPdfUrl ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {pdfLoading && !pdfLoadError && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(9,13,22,0.85)', zIndex: 2, color: '#94a3b8', fontSize: '14px', fontWeight: '600'
                }}>
                  Loading PDF from Google Drive...
                </div>
              )}
              {pdfLoadError ? (
                <div style={{
                  maxWidth: '520px', margin: 'auto', textAlign: 'center', padding: '24px',
                  background: 'var(--sunstone-card-bg)', borderRadius: '16px', border: '1px solid var(--sunstone-border)'
                }}>
                  <p style={{ color: 'var(--sunstone-text-secondary)', marginBottom: '16px' }}>
                    Could not load the PDF inline. Open it directly in Google Drive.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                      href={book.pdfUrl || embedPdfUrl.replace('/preview', '/view')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} /> Open in Google Drive
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  src={embedPdfUrl}
                  title={book.title}
                  onLoad={() => setPdfLoading(false)}
                  onError={() => { setPdfLoading(false); setPdfLoadError(true); }}
                  style={{
                    width: '100%',
                    height: 'calc(100vh - 120px)',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}
                  allow="autoplay"
                />
              )}
            </div>
          ) : (
            <div style={{
              maxWidth: '520px', margin: 'auto', textAlign: 'center', padding: '24px',
              background: 'var(--sunstone-card-bg)', borderRadius: '16px', border: '1px solid var(--sunstone-border)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sunstone-text-primary)', marginBottom: '8px' }}>
                PDF Not Available
              </h2>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px' }}>
                This book does not have a Google Drive link mapped yet. Please add its Google Drive File ID to `src/driveBookMap.js` to enable reading.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT DRAWER: NOTES */}
        <aside className={`pdf-reader-notes-drawer ${showNotesDrawer ? 'open' : ''}`}>
          <div className="notes-drawer-header">
            <h3>My Study Notes</h3>
            <button className="notes-drawer-close" onClick={() => setShowNotesDrawer(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="notes-drawer-content">
            {/* NEW NOTE FORM */}
            <form className="notes-drawer-form" onSubmit={handleSaveNote}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Page (Optional)"
                  value={manualPageNum}
                  onChange={(e) => setManualPageNum(e.target.value)}
                  style={{
                    width: '100px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    padding: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <textarea
                placeholder={`Take a note on "${book.title}"...`}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={3}
                required
              ></textarea>
              <button type="submit" disabled={!newNoteText.trim()}>
                <Plus size={14} /> Save Note
              </button>
            </form>

            <div className="notes-drawer-divider"></div>

            <div className="notes-list-container">
              {currentBookNotes.length === 0 ? (
                <div className="notes-empty-state">
                  <FileText size={32} opacity={0.3} />
                  <p>No notes saved yet.</p>
                  <span>Notes are saved securely to your Sunstone Lab profile.</span>
                </div>
              ) : (
                <div className="notes-list">
                  {currentBookNotes.map((note) => (
                    <div key={note.id} className="note-item">
                      <div className="note-item-header">
                        <span className="note-badge">Page {note.pageNumber}</span>
                        <div className="note-actions">
                          <button onClick={() => onDeleteNote(note.id)} title="Delete Note">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="note-text">{note.noteText}</p>
                      <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
