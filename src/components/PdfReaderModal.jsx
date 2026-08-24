import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, FileText, Plus, Trash2,
  Maximize2, Minimize2, Sun, Moon, Sparkles, BookOpen, Layers, CheckCircle2, Search,
  Lock, Send, Eye, ShieldCheck, ArrowRight, RotateCcw
} from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';

export default function PdfReaderModal({
  book,
  onClose,
  userNotes = [],
  onAddNote,
  onDeleteNote,
  isBorrowed = false,
  onOpenSnippets,
  onOpenBorrowModal
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [readingMode, setReadingMode] = useState('dark'); // 'dark', 'light', 'sepia'
  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [showLockPrompt, setShowLockPrompt] = useState(false);

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: currentTheme.bg,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* 1. TOP CONTROL BAR */}
      <header
        style={{
          height: '64px',
          background: '#16203b',
          color: '#ffffff',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 20
        }}
      >
        {/* Left: Brand & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            <X size={16} /> Exit Reader
          </button>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.15)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SunstoneLogo size={24} color="#ffffff" />
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>{book.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                  {book.program} • {book.author}
                </span>
                {isPreviewMode && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: 'rgba(255, 77, 90, 0.2)',
                    color: '#ff4d5a',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    Preview Mode (Pages 1–5)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Page Controls & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            <div style={{ width: '70px', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #ff4d5a, #2563eb)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>

        {/* Right: Zoom, Theme, Bookmarks & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
      </header>

      {/* Free Preview Alert Banner */}
      {isPreviewMode && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.15), rgba(255, 77, 90, 0.15))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: '#ffffff',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="var(--accent-sunstone-red)" />
            <span>
              You are reading the <strong>Free Preview (Pages 1 to 5)</strong> of "{book.title}".
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenBorrowModal) onOpenBorrowModal(book);
            }}
            style={{
              background: 'var(--accent-sunstone-red)',
              color: '#ffffff',
              border: 'none',
              padding: '4px 14px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={12} /> Borrow to Unlock Full {totalPages} Pages
          </button>
        </div>
      )}

      {/* 2. MAIN READING WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* LEFT / CENTER: PDF CANVAS VIEWER */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative'
          }}
        >
          {/* Lock Screen Overlay when reaching Page 6 / End of Preview */}
          {showLockPrompt ? (
            <div
              style={{
                maxWidth: '560px',
                width: '100%',
                background: 'var(--sunstone-card-bg)',
                border: '1px solid var(--sunstone-border)',
                borderRadius: '18px',
                padding: '36px',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 77, 90, 0.15)',
                  color: 'var(--accent-sunstone-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Lock size={32} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)', marginBottom: '8px' }}>
                Preview Complete (Pages 1–5)
              </h2>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                You've completed the 5-page free preview for <strong>"{book.title}"</strong>. To continue reading the remaining <strong>{totalPages - 5} pages</strong>, please submit a quick borrow request to the Prayas Lab Admin.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                  onClick={() => {
                    onClose();
                    if (onOpenBorrowModal) onOpenBorrowModal(book);
                  }}
                >
                  <Send size={16} /> Submit Borrow Request to Unlock Full Book
                </button>

                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
                  onClick={() => {
                    onClose();
                    if (onOpenSnippets) onOpenSnippets(book);
                  }}
                >
                  <FileText size={16} /> Read Chapter Snippets & Key Takeaways
                </button>

                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--sunstone-text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: '8px',
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
              style={{
                width: `${(650 * zoomLevel) / 100}px`,
                minHeight: `${(880 * zoomLevel) / 100}px`,
                background: currentTheme.canvasBg,
                color: currentTheme.text,
                borderRadius: '8px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'width 0.2s ease, min-height 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Top Page Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                <span>{book.title}</span>
                <span>Chapter {chapterNumber} • Page {currentPage}</span>
              </div>

              {/* Simulated Authentic Textbook Typography Body */}
              <div style={{ flex: 1, padding: '24px 0', fontSize: '15px', lineHeight: 1.8 }}>
                {currentPage === 1 && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {book.program} Curriculum Standard
                      </span>
                      <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '8px 0' }}>{book.title}</h1>
                      <p style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>Authored by {book.author}</p>
                      <div style={{ width: '60px', height: '3px', background: '#ff4d5a', margin: '16px auto 0' }}></div>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                      Chapter 1: Foundational Principles & Architecture
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      {book.description || 'This academic reference textbook provides rigorous theoretical frameworks and industry case studies designed specifically for students at Sunstone Prayas Lab.'}
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      Key competencies developed throughout this module include structural algorithmic efficiency, system design scalability, enterprise integration patterns, and rigorous empirical validation methodologies.
                    </p>
                    <div style={{ background: '#f1f5f9', borderLeft: '4px solid #2563eb', padding: '14px', borderRadius: '4px', margin: '20px 0', fontStyle: 'italic', color: '#334155' }}>
                      "Excellence in applied technology and business management requires bridging theoretical models with live industry execution." — Sunstone Academic Council
                    </div>
                  </div>
                )}

                {currentPage === 2 && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
                      Section 1.2: Core Frameworks & Structural Models
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      When formulating scalable systems in {book.category}, engineers and analysts must account for computational complexity, memory footprints, and state concurrency. Modern architectures utilize distributed consensus algorithms and partition-tolerant databases.
                    </p>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', margin: '16px 0 8px' }}>Key Theoretical Benchmarks:</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                      <li style={{ marginBottom: '8px' }}>Asymptotic boundary analysis using Big-O, Big-Theta, and Big-Omega metrics.</li>
                      <li style={{ marginBottom: '8px' }}>Deterministic state machines and transaction isolation levels.</li>
                      <li style={{ marginBottom: '8px' }}>High-throughput streaming pipelines and fault-tolerant replication models.</li>
                    </ul>
                  </div>
                )}

                {currentPage === 3 && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
                      Section 1.3: Prayas Lab Industry Application Case Study
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      To evaluate practical feasibility, scholars at the Prayas Lab conducted benchmark simulations testing real-world workload spikes under intensive network latency conditions.
                    </p>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
                      <h5 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Case Study Highlight:</h5>
                      <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                        {book.quickSummary?.highlights?.[0] || 'Optimization strategies yielded a 42% reduction in processing overhead when caching hot memory segments.'}
                      </p>
                    </div>
                  </div>
                )}

                {currentPage === 4 && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
                      Section 1.4: Quantitative Evaluation & Strategic Outcomes
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      Empirical evidence shows that implementing robust error boundaries and automated telemetry enables rapid root-cause analysis during unexpected production failures.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      {book.quickSummary?.keyTakeaways?.[0] || 'Strategic decision making requires multi-dimensional analysis spanning operational cost, security boundaries, and scalability thresholds.'}
                    </p>
                  </div>
                )}

                {currentPage === 5 && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
                      Section 1.5: Chapter Review & Free Preview Conclusion
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      Congratulations on completing Chapter 1 foundational reading! In the subsequent chapters (Chapters 2 through 18), you will dive into deep technical blueprints, advanced architectural implementations, and capstone project assignments.
                    </p>
                    {isPreviewMode && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 77, 90, 0.08))',
                        border: '1px solid rgba(255, 77, 90, 0.3)',
                        borderRadius: '12px',
                        padding: '18px',
                        marginTop: '20px',
                        textAlign: 'center'
                      }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                          ✨ Ready to Read the Complete {totalPages}-Page Textbook?
                        </h4>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                          Submit a borrow request for a Physical Copy or Digital Loan to unlock all remaining chapters.
                        </p>
                        <button
                          className="btn-primary"
                          style={{ margin: '0 auto', padding: '10px 20px', fontSize: '13px' }}
                          onClick={() => {
                            onClose();
                            if (onOpenBorrowModal) onOpenBorrowModal(book);
                          }}
                        >
                          <Send size={14} /> Request Full Book Access
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {currentPage > 5 && isBorrowed && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>
                      Chapter {chapterNumber}: Advanced Topics & Laboratory Modules (Page {currentPage})
                    </h3>
                    <p style={{ marginBottom: '16px' }}>
                      Continuing your full access academic study for <strong>{book.title}</strong>. You have unlocked complete unrestricted reading with full bookmarking, notes, and PDF download permissions.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      Review chapter exercises, solve self-assessment problems, and record page notes on the right panel for your Prayas Lab review sessions.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Page Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
                <span>Sunstone Prayas Lab Knowledge Portal</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: INTERACTIVE STUDY NOTES DRAWER */}
        {showNotesDrawer && (
          <aside
            style={{
              width: '340px',
              background: currentTheme.sideBg,
              color: currentTheme.sideText,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              boxShadow: '-4px 0 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Notes Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-sunstone-red)" />
                <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Page-Specific Notes</h4>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                Page {currentPage}
              </span>
            </div>

            {/* Note Creation Input */}
            <form onSubmit={handleSaveNote} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`Write study note for Page ${currentPage}...`}
                style={{
                  width: '100%',
                  height: '70px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '10px',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  marginBottom: '10px'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}
              >
                <Plus size={14} /> Add Note to Page {currentPage}
              </button>
            </form>

            {/* Notes Search & List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {currentBookNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '13px' }}>
                  <FileText size={28} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                  <p>No notes written for this book yet.</p>
                  <p style={{ fontSize: '11px', opacity: 0.7 }}>Take notes while reading to prepare for your Prayas Lab exams.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentBookNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
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
                      <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5, color: '#e2e8f0' }}>{note.noteText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
