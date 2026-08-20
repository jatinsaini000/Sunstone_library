import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, FileText, Plus, Trash2,
  Maximize2, Minimize2, Sun, Moon, Sparkles, BookOpen, Layers, CheckCircle2, Search, Volume2
} from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';

export default function PdfReaderModal({
  book,
  onClose,
  userNotes = [],
  onAddNote,
  onDeleteNote
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [readingMode, setReadingMode] = useState('dark'); // 'dark', 'light', 'sepia'
  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');

  if (!book) return null;

  const totalPages = book.pages || 350;
  const progressPercent = Math.round((currentPage / totalPages) * 100);
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
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
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
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 20
        }}
      >
        {/* Left: Brand & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>{book.title}</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                {book.program} • {book.author}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Page Controls & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '800', minWidth: '110px', textAlign: 'center' }}>
              Page{' '}
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= totalPages) setCurrentPage(val);
                }}
                style={{
                  width: '44px',
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
              of {totalPages}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage >= totalPages ? '#475569' : '#ffffff',
                cursor: currentPage >= totalPages ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Progress Bar Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
            <span>{progressPercent}% Read</span>
            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
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

      {/* 2. MAIN READER WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* PDF Document Canvas Viewport */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '30px 20px 60px',
            overflowY: 'auto',
            position: 'relative'
          }}
        >
          {/* High-Precision Page Sheet */}
          <div
            style={{
              width: `${Math.min(960, 840 * (zoomLevel / 100))}px`,
              minHeight: `${1080 * (zoomLevel / 100)}px`,
              background: currentTheme.canvasBg,
              color: currentTheme.text,
              borderRadius: '12px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              padding: '48px 60px',
              fontFamily: "'Inter', sans-serif",
              lineHeight: '1.75',
              position: 'relative',
              transition: 'width 0.2s ease',
              marginBottom: '40px'
            }}
          >
            {/* Header Rule */}
            <div
              style={{
                borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
                paddingBottom: '14px',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--sunstone-text-muted)',
                fontWeight: '700'
              }}
            >
              <span>SUNSTONE PRAYAS LAB • OFFICIAL ACADEMIC EDITION</span>
              <span>CHAPTER {chapterNumber} • PAGE {currentPage} OF {totalPages}</span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-sunstone-red)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px' }}>
              {book.program} • {book.category}
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: currentTheme.text, fontFamily: "'Outfit', sans-serif" }}>
              Chapter {chapterNumber}: Core Foundations & Practice Scenarios
            </h2>

            <p style={{ fontSize: '15px', marginBottom: '20px' }}>
              Welcome to the digital reading module for <strong>{book.title}</strong> authored by <em>{book.author}</em>.
              This material is officially curated for Sunstone <strong>{book.program}</strong> scholars.
            </p>

            {/* Key Focus Highlight Box */}
            <div
              style={{
                background: 'rgba(37, 99, 235, 0.06)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderLeft: '4px solid var(--accent-blue)',
                padding: '18px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Key Study Focus for Page {currentPage}:
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px' }}>
                {book.quickSummary?.highlights ? (
                  book.quickSummary.highlights.map((h, i) => <li key={i} style={{ marginBottom: '4px' }}>{h}</li>)
                ) : (
                  <li>Understand core theoretical frameworks and practical analytical models.</li>
                )}
              </ul>
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              1.1 Theoretical Framework & Applied Mechanics
            </h3>

            <p style={{ fontSize: '14px', marginBottom: '18px' }}>
              {book.description || 'This course material establishes quantitative and analytical frameworks necessary for executing industry-standard projects during Sunstone Prayas Lab residencies.'}
            </p>

            {/* Applied Code / Formula Box */}
            <div
              style={{
                background: '#16203b',
                color: '#ffffff',
                padding: '18px 22px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                marginBottom: '24px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px', fontWeight: '700' }}>
                // Sunstone Prayas Lab - Applied Code/Formula Architecture
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{book.program === 'B.Tech CS' || book.program === 'BCA'
  ? `def solve_prayas_algorithm(input_data):\n    # Optimized O(N log N) processing\n    data_store = sorted(input_data, key=lambda x: x.priority)\n    return [item.execute() for item in data_store]`
  : `// Corporate Financial Capital Asset Valuation (CAPM)\nExpected_Return = Risk_Free_Rate + Beta * (Market_Return - Risk_Free_Rate)\nNPV = sum(Cash_Flow_t / (1 + WACC)**t for t in periods) - Initial_Investment`}
              </pre>
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              1.2 Practice Revision Questions
            </h3>

            <ul style={{ paddingLeft: '20px', fontSize: '13px', marginBottom: '40px' }}>
              <li style={{ marginBottom: '8px' }}>How does the theoretical model on Page {currentPage} apply to modern Indian tech/business ecosystems?</li>
              <li style={{ marginBottom: '8px' }}>What performance trade-offs must be evaluated during lab project implementation?</li>
            </ul>

            {/* Footer */}
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '60px',
                right: '60px',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--sunstone-text-muted)',
                fontWeight: '700'
              }}
            >
              <span>Sunstone Academic Repository • Confidential Student Material</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* 3. SIDE NOTES DRAWER */}
        {showNotesDrawer && (
          <aside
            style={{
              width: '360px',
              background: currentTheme.sideBg,
              color: currentTheme.sideText,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-blue)" /> Study Notes ({currentBookNotes.length})
              </h4>
              <button
                onClick={() => setShowNotesDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Notes Input */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search notes..."
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '12px', borderRadius: '20px' }}
              />
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleSaveNote} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '700' }}>
                Attach note to Page <strong style={{ color: 'var(--accent-blue)' }}>{currentPage}</strong>:
              </div>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Write key formulas, highlights, or exam revision notes..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{ width: '100%', resize: 'none', marginBottom: '8px', fontSize: '13px' }}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '13px' }}>
                <Plus size={14} /> Save Note for Page {currentPage}
              </button>
            </form>

            {/* Notes List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentBookNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px' }}>
                  No study notes saved for this book yet. Type a note above to record page insights.
                </div>
              ) : (
                currentBookNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setCurrentPage(note.pageNumber)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid var(--accent-blue)',
                      padding: '14px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '11px', color: '#94a3b8' }}>
                      <span style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>Page {note.pageNumber}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                      {note.noteText}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12} /> Delete Note
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
