import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, FileText, Plus, Trash2,
  Maximize2, Minimize2, Sun, Moon, Sparkles, BookOpen, Layers, CheckCircle2, Search,
  Lock, Send, Eye, ShieldCheck, ArrowRight, RotateCcw, Palette, ExternalLink, Clock
} from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';
import { resolvePdfViewerUrl, isEmbeddablePdfUrl } from '../googleDriveHelper.js';
import { getDriveFileIdForFilename, getDrivePreviewUrl } from '../driveBookMap.js';

export default function PdfReaderModal({
  book,
  onClose,
  userNotes = [],
  onAddNote,
  onDeleteNote,
  isBorrowed = false,
  hasPendingBorrowRequest = false,
  onOpenSnippets,
  onOpenBorrowModal
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [readingMode, setReadingMode] = useState('dark'); // 'dark', 'light', 'sepia'
  const [viewerType, setViewerType] = useState('livePdf'); // Default to actual PDF
  const [showNotesDrawer, setShowNotesDrawer] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 900 : false;
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  const localFilename = book?.localPath
    ? book.localPath.split('/').pop()
    : (book?.pdfUrl && book.pdfUrl.includes('/uploads/') ? book.pdfUrl.split('/').pop() : book ? `${book.title}.pdf` : null);

  const embedPdfUrl = book ? resolvePdfViewerUrl(book.pdfUrl, {
    filename: localFilename,
    title: book.title
  }) : null;

  const canShowLivePdf = Boolean(embedPdfUrl && isEmbeddablePdfUrl(embedPdfUrl));

  useEffect(() => {
    if (!book) return;
    setPdfLoadError(false);
    setPdfLoading(canShowLivePdf);
    setViewerType(canShowLivePdf ? 'livePdf' : 'interactive');
  }, [book?.id, canShowLivePdf]);

  if (!book) return null;

  const totalPages = book.pages || 350;
  const MAX_FREE_PREVIEW_PAGES = 5;
  const isPreviewMode = !isBorrowed;
  const maxAllowedPage = isBorrowed ? totalPages : Math.min(totalPages, MAX_FREE_PREVIEW_PAGES);

  const progressPercent = Math.round((currentPage / (isPreviewMode ? MAX_FREE_PREVIEW_PAGES : totalPages)) * 100);
  const chapterNumber = Math.max(1, Math.ceil(currentPage / 15));

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

  const handleNextPage = () => {
    if (currentPage < maxAllowedPage) {
      setCurrentPage((p) => p + 1);
    } else if (isPreviewMode && currentPage >= MAX_FREE_PREVIEW_PAGES) {
      setShowLockPrompt(true);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      setShowLockPrompt(false);
    }
  };

  const handleCycleTheme = () => {
    if (readingMode === 'dark') setReadingMode('sepia');
    else if (readingMode === 'sepia') setReadingMode('light');
    else setReadingMode('dark');
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote({
      bookId: book.id,
      bookTitle: book.title,
      pageNumber: currentPage,
      noteText: newNoteText
    });
    setNewNoteText('');
  };

  const currentBookNotes = userNotes.filter(
    (n) => n.bookId === book.id &&
    (!notesSearch || n.noteText.toLowerCase().includes(notesSearch.toLowerCase()))
  );

  // Background Theme Variations
  const themeStyles = {
    dark: { bg: '#090d16', canvasBg: '#ffffff', text: '#0f172a', sideBg: '#111827', sideText: '#f8fafc' },
    light: { bg: '#e2e8f0', canvasBg: '#ffffff', text: '#0f172a', sideBg: '#ffffff', sideText: '#0f172a' },
    sepia: { bg: '#fbf0d9', canvasBg: '#fff8ea', text: '#432818', sideBg: '#f4e4ba', sideText: '#432818' }
  };

  const currentTheme = themeStyles[readingMode];

  return (
    <div className="pdf-reader-root" style={{ background: currentTheme.bg }}>
      {/* 1. TOP CONTROL BAR */}
      <header className="pdf-reader-topbar">
        {/* Left: Brand, Exit & Book Title */}
        <div className="pdf-reader-brand">
          <button
            onClick={onClose}
            className="pdf-reader-exit-btn"
            title="Exit Reader"
          >
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
                {isPreviewMode ? (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: hasPendingBorrowRequest ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 77, 90, 0.2)',
                    color: hasPendingBorrowRequest ? '#f59e0b' : '#ff4d5a',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap'
                  }}>
                    {hasPendingBorrowRequest ? 'Borrow Pending' : 'Preview (1–5p)'}
                  </span>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Desktop Page Controls & Progress (for Interactive Mode) */}
        {viewerType === 'interactive' && (
          <div className="pdf-reader-desktop-nav">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '4px 14px',
                borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage <= 1 ? '#475569' : '#ffffff',
                  cursor: currentPage <= 1 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '800', minWidth: '120px', textAlign: 'center' }}>
                Page{' '}
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= maxAllowedPage) {
                      setCurrentPage(val);
                      setShowLockPrompt(false);
                    } else if (val > maxAllowedPage && isPreviewMode) {
                      setCurrentPage(MAX_FREE_PREVIEW_PAGES);
                      setShowLockPrompt(true);
                    }
                  }}
                  style={{
                    width: '40px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '4px',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontWeight: '800',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />{' '}
                of {isPreviewMode ? `${MAX_FREE_PREVIEW_PAGES} (Preview)` : totalPages}
              </div>

              <button
                onClick={handleNextPage}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isPreviewMode && currentPage >= MAX_FREE_PREVIEW_PAGES ? 'Borrow Book to Read Past Page 5' : 'Next Page'}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
              <span>{progressPercent}%</span>
              <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #ff4d5a, #2563eb)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Desktop Controls */}
        <div className="pdf-reader-desktop-actions">
          {/* Mode switch if live PDF URL is present */}
          {canShowLivePdf && (
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: '2px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setViewerType('interactive')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: viewerType === 'interactive' ? '#2563eb' : 'transparent',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Interactive Text
              </button>
              <button
                onClick={() => setViewerType('livePdf')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: viewerType === 'livePdf' ? '#ff4d5a' : 'transparent',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Live PDF
              </button>
            </div>
          )}

          {/* Reading Mode Theme Selector */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: '2px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setReadingMode('dark')}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                background: readingMode === 'dark' ? '#ff4d5a' : 'transparent',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Dark
            </button>
            <button
              onClick={() => setReadingMode('sepia')}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                background: readingMode === 'sepia' ? '#d97706' : 'transparent',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Warm
            </button>
            <button
              onClick={() => setReadingMode('light')}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                background: readingMode === 'light' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Paper
            </button>
          </div>

          {/* Zoom Controls */}
          {viewerType === 'interactive' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span style={{ fontSize: '11px', color: '#94a3b8', width: '36px', textAlign: 'center', fontWeight: '800' }}>{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>
          )}

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
          {/* Mobile Theme Cycle */}
          <button
            className="pdf-reader-action-icon-btn"
            onClick={handleCycleTheme}
            title={`Reading Theme: ${readingMode.toUpperCase()}`}
          >
            <Palette size={16} />
          </button>

          {/* Mobile Bookmark */}
          <button
            className={`pdf-reader-action-icon-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
            title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
          >
            <Bookmark size={16} fill={isBookmarked ? '#ffffff' : 'none'} />
          </button>

          {/* Mobile Notes Drawer Toggle */}
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

      {/* Progress Line */}
      {viewerType === 'interactive' && (
        <div className="pdf-reader-progress-line">
          <div className="pdf-reader-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      )}

      {/* Free Preview Alert Banner */}
      {isPreviewMode && (
        <div className="pdf-reader-preview-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={15} color={hasPendingBorrowRequest ? '#f59e0b' : 'var(--accent-sunstone-red)'} style={{ flexShrink: 0 }} />
            <span>
              {hasPendingBorrowRequest ? (
                <>⏳ Borrow Request <strong>Pending Approval</strong> for "{book.title}"</>
              ) : (
                <>Free Preview: <strong>Pages 1 to 5</strong> of "{book.title}"</>
              )}
            </span>
          </div>

          {hasPendingBorrowRequest ? (
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock size={12} /> Awaiting Admin Approval
            </span>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenBorrowModal) onOpenBorrowModal(book);
              }}
              style={{
                background: 'var(--accent-sunstone-red)',
                color: '#ffffff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Send size={12} /> Borrow Full Book ({totalPages}p)
            </button>
          )}
        </div>
      )}

      {/* 2. MAIN READING WORKSPACE */}
      <div className="pdf-reader-workspace">
        {/* CENTER: PDF CANVAS VIEWER */}
        <div className="pdf-reader-canvas-container">
          {viewerType === 'livePdf' && canShowLivePdf ? (
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
                    Could not load the PDF inline. Open it directly in Google Drive or try the local copy.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {embedPdfUrl?.includes('drive.google.com') && (
                      <a
                        href={book.pdfUrl || embedPdfUrl.replace('/preview', '/view')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} /> Open in Google Drive
                      </a>
                    )}
                    {book.localPath && (
                      <a
                        href={book.localPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} /> Open Local PDF
                      </a>
                    )}
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
          ) : showLockPrompt ? (
            /* Lock Screen Overlay when reaching Page 6 / End of Preview */
            <div
              style={{
                maxWidth: '560px',
                width: '100%',
                background: 'var(--sunstone-card-bg)',
                border: '1px solid var(--sunstone-border)',
                borderRadius: '18px',
                padding: '30px 20px',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.3s ease',
                margin: 'auto'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: hasPendingBorrowRequest ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 77, 90, 0.15)',
                  color: hasPendingBorrowRequest ? '#f59e0b' : 'var(--accent-sunstone-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                {hasPendingBorrowRequest ? <Clock size={28} /> : <Lock size={28} />}
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sunstone-text-primary)', marginBottom: '8px' }}>
                {hasPendingBorrowRequest ? 'Borrow Request Under Review' : 'Preview Complete (Pages 1–5)'}
              </h2>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px' }}>
                {hasPendingBorrowRequest ? (
                  <>Your request to borrow <strong>"{book.title}"</strong> is currently in the Prayas Lab Admin queue. You will unlock all remaining <strong>{totalPages - 5} pages</strong> immediately once approved.</>
                ) : (
                  <>You've completed the 5-page free preview for <strong>"{book.title}"</strong>. To continue reading the remaining <strong>{totalPages - 5} pages</strong>, please submit a quick borrow request to the Prayas Lab Admin.</>
                )}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!hasPendingBorrowRequest && (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
                    onClick={() => {
                      onClose();
                      if (onOpenBorrowModal) onOpenBorrowModal(book);
                    }}
                  >
                    <Send size={15} /> Submit Borrow Request to Unlock Full Book
                  </button>
                )}

                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13px' }}
                  onClick={() => {
                    onClose();
                    if (onOpenSnippets) onOpenSnippets(book);
                  }}
                >
                  <FileText size={15} /> Read Chapter Snippets & Key Takeaways
                </button>

                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--sunstone-text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onClick={() => {
                    setCurrentPage(1);
                    setShowLockPrompt(false);
                  }}
                >
                  <RotateCcw size={14} /> Review Pages 1–5 Again
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE PAGE CANVAS */
            <div
              className="pdf-reader-canvas-card"
              style={{
                maxWidth: `${(680 * zoomLevel) / 100}px`,
                minHeight: `${(860 * zoomLevel) / 100}px`,
                background: currentTheme.canvasBg,
                color: currentTheme.text
              }}
            >
              {/* Top Page Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px', fontSize: '11.5px', color: '#64748b', fontWeight: '700' }}>
                <span style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</span>
                <span>Ch. {chapterNumber} • Page {currentPage}</span>
              </div>

              {/* Authentic Textbook Typography Body */}
              <div style={{ flex: 1, padding: '20px 0', fontSize: '14.5px', lineHeight: 1.75 }}>
                {currentPage === 1 && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {book.program} Curriculum Standard
                      </span>
                      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '8px 0', lineHeight: 1.3 }}>{book.title}</h1>
                      <p style={{ fontSize: '13.5px', color: '#475569', fontWeight: '600' }}>Authored by {book.author}</p>
                      <div style={{ width: '50px', height: '3px', background: '#ff4d5a', margin: '14px auto 0' }}></div>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
                      Chapter 1: Foundational Principles & Architecture
                    </h3>
                    <p style={{ marginBottom: '14px' }}>
                      {book.description || 'This academic reference textbook provides rigorous theoretical frameworks and industry case studies designed specifically for students at Sunstone Prayas Lab.'}
                    </p>
                    <p style={{ marginBottom: '14px' }}>
                      Key competencies developed throughout this module include structural algorithmic efficiency, system design scalability, enterprise integration patterns, and rigorous empirical validation methodologies.
                    </p>
                    <div style={{ background: '#f1f5f9', borderLeft: '4px solid #2563eb', padding: '12px 14px', borderRadius: '4px', margin: '16px 0', fontStyle: 'italic', color: '#334155', fontSize: '13.5px' }}>
                      "Excellence in applied technology and business management requires bridging theoretical models with live industry execution." — Sunstone Academic Council
                    </div>
                  </div>
                )}

                {currentPage === 2 && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                      Section 1.2: Core Frameworks & Structural Models
                    </h3>
                    <p style={{ marginBottom: '14px' }}>
                      When formulating scalable systems in {book.category}, engineers and analysts must account for computational complexity, memory footprints, and state concurrency. Modern architectures utilize distributed consensus algorithms and partition-tolerant databases.
                    </p>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#334155', margin: '14px 0 8px' }}>Key Theoretical Benchmarks:</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
                      <li style={{ marginBottom: '6px' }}>Asymptotic boundary analysis using Big-O, Big-Theta, and Big-Omega metrics.</li>
                      <li style={{ marginBottom: '6px' }}>Deterministic state machines and transaction isolation levels.</li>
                      <li style={{ marginBottom: '6px' }}>High-throughput streaming pipelines and fault-tolerant replication models.</li>
                    </ul>
                  </div>
                )}

                {currentPage === 3 && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                      Section 1.3: Prayas Lab Industry Application Case Study
                    </h3>
                    <p style={{ marginBottom: '14px' }}>
                      To evaluate practical feasibility, scholars at the Prayas Lab conducted benchmark simulations testing real-world workload spikes under intensive network latency conditions.
                    </p>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', margin: '14px 0' }}>
                      <h5 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '6px', fontSize: '14px' }}>Case Study Highlight:</h5>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                        {book.quickSummary?.highlights?.[0] || 'Optimization strategies yielded a 42% reduction in processing overhead when caching hot memory segments.'}
                      </p>
                    </div>
                  </div>
                )}

                {currentPage === 4 && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                      Section 1.4: Quantitative Evaluation & Strategic Outcomes
                    </h3>
                    <p style={{ marginBottom: '14px' }}>
                      Empirical evidence shows that implementing robust error boundaries and automated telemetry enables rapid root-cause analysis during unexpected production failures.
                    </p>
                    <p style={{ marginBottom: '14px' }}>
                      {book.quickSummary?.keyTakeaways?.[0] || 'Strategic decision making requires multi-dimensional analysis spanning operational cost, security boundaries, and scalability thresholds.'}
                    </p>
                  </div>
                )}

                {currentPage === 5 && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                      Section 1.5: Chapter Review & Free Preview Conclusion
                    </h3>
                    <p style={{ marginBottom: '14px' }}>
                      Congratulations on completing Chapter 1 foundational reading! In the subsequent chapters (Chapters 2 through 18), you will dive into deep technical blueprints, advanced architectural implementations, and capstone project assignments.
                    </p>
                    {isPreviewMode && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 77, 90, 0.08))',
                        border: '1px solid rgba(255, 77, 90, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginTop: '16px',
                        textAlign: 'center'
                      }}>
                        <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                          ✨ Ready to Read the Complete {totalPages}-Page Textbook?
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
                          {hasPendingBorrowRequest
                            ? 'Your borrow request has been submitted and is awaiting approval.'
                            : 'Submit a borrow request for a Physical Copy or Digital Loan to unlock all remaining chapters.'}
                        </p>
                        {!hasPendingBorrowRequest && (
                          <button
                            className="btn-primary"
                            style={{ margin: '0 auto', padding: '10px 18px', fontSize: '13px' }}
                            onClick={() => {
                              onClose();
                              if (onOpenBorrowModal) onOpenBorrowModal(book);
                            }}
                          >
                            <Send size={14} /> Request Full Book Access
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentPage > 5 && isBorrowed && (
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                      Chapter {chapterNumber}: Advanced Topics & Laboratory Modules (Page {currentPage})
                    </h3>
                    <p style={{ marginBottom: '14px' }}>
                      Continuing your full access academic study for <strong>{book.title}</strong>. You have unlocked complete unrestricted reading with full bookmarking, notes, and PDF download permissions.
                    </p>
                    <p style={{ marginBottom: '14px' }}>
                      Review chapter exercises, solve self-assessment problems, and record page notes on the right panel for your Prayas Lab review sessions.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Page Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
                <span>Sunstone Prayas Lab Knowledge Portal</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Notes Drawer Backdrop */}
        <div
          className={`pdf-reader-notes-backdrop ${showNotesDrawer ? 'open' : ''}`}
          onClick={() => setShowNotesDrawer(false)}
        ></div>

        {/* RIGHT: INTERACTIVE STUDY NOTES DRAWER */}
        <aside
          className={`pdf-reader-notes-drawer ${showNotesDrawer ? 'open' : ''}`}
          style={{
            background: currentTheme.sideBg,
            color: currentTheme.sideText
          }}
        >
          {/* Notes Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={17} color="var(--accent-sunstone-red)" />
              <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Study Notes</h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                Page {currentPage}
              </span>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close Notes"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Note Creation Input */}
          <form onSubmit={handleSaveNote} style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder={`Write note for Page ${currentPage}...`}
              style={{
                width: '100%',
                height: '65px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: currentTheme.sideText,
                padding: '10px',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                marginBottom: '8px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}
            >
              <Plus size={14} /> Add Note (Page {currentPage})
            </button>
          </form>

          {/* Notes List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
            {currentBookNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px' }}>
                <FileText size={26} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <p style={{ margin: '0 0 4px' }}>No notes for this book yet.</p>
                <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>Add notes while reading to prepare for your Prayas Lab exams.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentBookNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-sunstone-red)' }}>
                        Page {note.pageNumber || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p style={{ fontSize: '12.5px', margin: 0, lineHeight: 1.5, color: '#e2e8f0' }}>{note.noteText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. MOBILE STICKY BOTTOM NAVIGATION BAR */}
      {viewerType === 'interactive' && (
        <div className="pdf-reader-mobile-bottombar">
          <button
            className="pdf-reader-mobile-nav-btn"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={18} /> Prev
          </button>

          <div className="pdf-reader-mobile-page-indicator">
            Page {currentPage} / {isPreviewMode ? `${MAX_FREE_PREVIEW_PAGES} (Preview)` : totalPages}
          </div>

          <button
            className="pdf-reader-mobile-nav-btn"
            onClick={handleNextPage}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
