import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopHeader from './components/TopHeader.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import ProgramTabs from './components/ProgramTabs.jsx';
import NetflixRow from './components/NetflixRow.jsx';
import BookGrid from './components/BookGrid.jsx';
import BookDetailModal from './components/BookDetailModal.jsx';
import ChapterSnippetsModal from './components/ChapterSnippetsModal.jsx';
import PdfReaderModal from './components/PdfReaderModal.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import AdminConsole from './components/AdminConsole.jsx';
import AuthModal from './components/AuthModal.jsx';
import BorrowModal from './components/BorrowModal.jsx';
import {
  Flame,
  Code,
  GraduationCap,
  Server,
  Briefcase,
  Sparkles,
  BookOpenCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { initialBooks, initialBorrowRequests, initialStudents } from './starterBooks.js';
import {
  getBooksFromFirestore,
  getBorrowRequestsFromFirestore,
  addBookToFirestore,
  deleteBookFromFirestore,
  addBorrowRequestToFirestore,
  updateBorrowStatusInFirestore,
  getNotesFromFirestore,
  addNoteToFirestore,
  deleteNoteFromFirestore
} from './firebase.js';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('catalog');
  const [profileSubTab, setProfileSubTab] = useState('shelf');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Active user session (persisted in localStorage or null for guest visitors)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sunstone_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const handleSetUser = (userData) => {
    if (userData) {
      try {
        localStorage.setItem('sunstone_user', JSON.stringify(userData));
      } catch (e) {}
      setUser(userData);
    } else {
      try {
        localStorage.removeItem('sunstone_user');
      } catch (e) {}
      setUser(null);
    }
  };

  const handleLogout = () => {
    handleSetUser(null);
    setCurrentView('catalog');
  };

  // Catalog Books State with immediate starter catalog
  const [books, setBooks] = useState(initialBooks);
  const [savedBookIds, setSavedBookIds] = useState(['bk_cs_1', 'bk_spec_1']);
  const [userNotes, setUserNotes] = useState([
    {
      id: 'n1',
      studentId: 'usr_student1',
      bookId: 'bk_cs_1',
      bookTitle: 'Data Structures and Algorithms in Python',
      pageNumber: 15,
      noteText: 'Remember to revise Big-O complexity for Binary Search Trees before Friday Prayas Lab quiz.',
      createdAt: new Date().toISOString()
    }
  ]);

  const [borrowRequests, setBorrowRequests] = useState(initialBorrowRequests);
  const [students, setStudents] = useState(initialStudents);

  // Modal Control States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedQuickSummaryBook, setSelectedQuickSummaryBook] = useState(null);
  const [activeSnippetBook, setActiveSnippetBook] = useState(null);
  const [activeReaderBook, setActiveReaderBook] = useState(null);
  const [activeBorrowBook, setActiveBorrowBook] = useState(null);

  const borrowedBookIds = borrowRequests
    .filter((r) => user && r.studentId === user.id && r.status === 'Approved')
    .map((r) => r.bookId);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function loadBooksData() {
      try {
        const fsBooks = await getBooksFromFirestore();
        if (fsBooks && fsBooks.length > 0) {
          setBooks(fsBooks);
          return;
        }
      } catch (e) {}

      try {
        const res = await fetch('/api/books');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setBooks(data);
        }
      } catch (err) {}
    }
    loadBooksData();
  }, []);

  useEffect(() => {
    async function loadRequestsData() {
      try {
        const fsReqs = await getBorrowRequestsFromFirestore();
        if (fsReqs && fsReqs.length > 0) {
          setBorrowRequests(fsReqs);
          return;
        }
      } catch (e) {}

      try {
        const res = await fetch('/api/borrow-requests');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setBorrowRequests(data);
        }
      } catch (e) {}
    }
    loadRequestsData();
  }, []);

  useEffect(() => {
    async function loadNotesData() {
      if (user && user.id) {
        const fsNotes = await getNotesFromFirestore(user.id);
        if (fsNotes && fsNotes.length > 0) {
          setUserNotes(fsNotes);
        } else {
          fetch(`/api/notes/${user.id}`)
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data) && data.length > 0) setUserNotes(data);
            })
            .catch(() => {});
        }
      }
    }
    loadNotesData();
  }, [user]);

  const handleSwitchUserRole = (roleKey) => {
    if (roleKey === 'student1') {
      setUser({ id: 'usr_student1', name: 'Jatin', email: 'jatin@sunstone.in', role: 'student', program: 'B.Tech CS' });
      setCurrentView('catalog');
    } else if (roleKey === 'student2') {
      setUser({ id: 'usr_student2', name: 'Ananya Verma', email: 'ananya@sunstone.in', role: 'student', program: 'MBA' });
      setCurrentView('catalog');
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesProgram =
      selectedProgram === 'All Programs' ||
      b.program === selectedProgram;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.program.toLowerCase().includes(query) ||
      (b.quickSummary?.highlights && b.quickSummary.highlights.some(h => h.toLowerCase().includes(query)));

    return matchesProgram && matchesSearch;
  });

  const programCounts = {
    'All Programs': books.length,
    'MBA': books.filter((b) => b.program === 'MBA').length,
    'B.Tech CS': books.filter((b) => b.program === 'B.Tech CS').length,
    'BCA': books.filter((b) => b.program === 'BCA').length,
    'BBA': books.filter((b) => b.program === 'BBA').length,
    'Special Collections': books.filter((b) => b.program === 'Special Collections').length,
    'Journals': books.filter((b) => b.program === 'Journals').length
  };

  const featuredBook = books[0] || null;
  const trendingBooks = books.slice(0, 5);
  const btechBooks = books.filter((b) => b.program === 'B.Tech CS');
  const mbaBooks = books.filter((b) => b.program === 'MBA');
  const bcaBooks = books.filter((b) => b.program === 'BCA');
  const bbaBooks = books.filter((b) => b.program === 'BBA');
  const specialBooks = books.filter((b) => b.program === 'Special Collections');
  const journalBooks = books.filter((b) => b.program === 'Journals');

  const handleToggleSaveBook = (bookId) => {
    setSavedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleAddNote = (newNoteData) => {
    const noteObj = {
      id: 'note_' + Date.now(),
      studentId: user ? user.id : 'usr_student1',
      ...newNoteData,
      createdAt: new Date().toISOString()
    };
    setUserNotes((prev) => [noteObj, ...prev]);
    addNoteToFirestore(noteObj).catch(() => {});
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteObj)
    }).catch(() => {});
  };

  const handleDeleteNote = (noteId) => {
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
    deleteNoteFromFirestore(noteId).catch(() => {});
    fetch(`/api/notes/${noteId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUploadBook = async (formData) => {
    let newBook = null;
    try {
      const res = await fetch('/api/books', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.book) newBook = data.book;
      }
    } catch (e) {
      console.warn('Local API unavailable, falling back to direct Firebase/client sync:', e.message);
    }

    if (!newBook) {
      const parseSnippets = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) return parsed;
        } catch(e) {}
        const blocks = String(input).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
        return blocks.map((block, idx) => {
          const firstLine = block.split('\n')[0];
          const rest = block.split('\n').slice(1).join(' ').trim();
          return {
            chapterNumber: idx + 1,
            title: firstLine.startsWith('Chapter') ? firstLine : `Chapter ${idx + 1}: ${firstLine.slice(0, 40)}`,
            summary: rest || block
          };
        });
      };

      const parseArray = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        return String(input).split('\n').map(s => s.trim()).filter(Boolean);
      };

      const title = formData.get('title') || 'Untitled Book';
      const author = formData.get('author') || 'Unknown Author';
      const program = formData.get('program') || 'All Programs';
      const category = formData.get('category') || 'General Academic';
      const coverUrl = formData.get('coverUrl') || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80';
      const pdfUrl = formData.get('pdfUrl') || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
      const description = formData.get('description') || 'No description provided.';
      const highlights = parseArray(formData.get('highlights'));
      const keyTakeaways = parseArray(formData.get('keyTakeaways'));
      const chapterSnippets = parseSnippets(formData.get('chapterSnippets'));

      newBook = {
        id: 'bk_' + Date.now(),
        title,
        author,
        program,
        category,
        coverUrl,
        fileType: 'url',
        pdfUrl,
        downloadable: true,
        isbn: 'ISBN-' + Math.floor(100000000 + Math.random() * 900000000),
        rating: 4.8,
        pages: 350,
        publishedYear: 2026,
        chapterSnippets,
        quickSummary: {
          highlights: highlights.length > 0 ? highlights : ['Comprehensive academic material mapped to Sunstone curriculum.'],
          keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ['Gain key theoretical and practical insights.'],
          estimatedReadingTime: '6 Hours',
          difficultyLevel: 'Standard Academic'
        },
        description
      };
    }

    setBooks((prev) => [newBook, ...prev]);
    addBookToFirestore(newBook).catch((err) => console.warn('Firebase book sync error:', err));
  };

  const handleDeleteBook = async (bookId) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    deleteBookFromFirestore(bookId).catch(() => {});
    fetch(`/api/books/${bookId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSubmitBorrowRequest = (reqData) => {
    const newReq = {
      id: 'req_' + Date.now(),
      studentId: user ? user.id : 'usr_student1',
      studentName: user ? user.name : 'Jatin',
      studentEmail: user ? user.email : 'jatin@sunstone.in',
      studentProgram: user ? user.program : 'B.Tech CS',
      requestDate: new Date().toISOString(),
      status: 'Pending',
      adminNote: '',
      ...reqData
    };
    setBorrowRequests((prev) => [newReq, ...prev]);
    addBorrowRequestToFirestore(newReq).catch(() => {});
    fetch('/api/borrow-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    }).catch(() => {});

    setToastMessage({
      text: `Borrow Request for "${reqData.bookTitle}" submitted!`,
      actionText: null
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUpdateBorrowStatus = (reqId, status, adminNote) => {
    setBorrowRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status, adminNote } : r))
    );
    updateBorrowStatusInFirestore(reqId, status, adminNote).catch(() => {});
    fetch(`/api/borrow-requests/${reqId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote })
    }).catch(() => {});
  };

  const handleToggleStudentStatus = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
    fetch(`/api/students/${studentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  return (
    <div className="app-layout">
      {/* Official Sunstone Dark Navy Sidebar */}
      <Sidebar
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        setTheme={setTheme}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        setProfileSubTab={setProfileSubTab}
      />

      {/* Main Workspace Area */}
      <div className="app-main">
        <TopHeader
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* Live Toast Banner */}
        {toastMessage && (
          <div style={{
            margin: '0 32px 16px',
            background: 'var(--sunstone-navy-dark)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <span>{toastMessage.text}</span>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* VIEW 1: HOME CATALOG VIEW (NETFLIX STYLE) */}
        {currentView === 'catalog' && (
          <div>
            {/* Netflix Hero Billboard */}
            {!searchQuery && selectedProgram === 'All Programs' && (
              <HeroBanner
                book={featuredBook}
                onOpenReader={(b) => setActiveReaderBook(b)}
                onOpenSnippets={(b) => setActiveSnippetBook(b)}
                onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                onOpenBorrowModal={(b) => {
                  if (!user) setShowAuthModal(true);
                  else setActiveBorrowBook(b);
                }}
                isBorrowed={borrowedBookIds.includes(featuredBook?.id)}
              />
            )}

            {/* Sunstone Program Filter Cards */}
            <ProgramTabs
              selectedProgram={selectedProgram}
              setSelectedProgram={setSelectedProgram}
              counts={programCounts}
            />

            {/* Filtered Grid or Netflix Category Rows */}
            {searchQuery || selectedProgram !== 'All Programs' ? (
              <main style={{ padding: '0 32px 60px' }}>
                <BookGrid
                  selectedProgram={selectedProgram}
                  books={filteredBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />
              </main>
            ) : (
              <div style={{ paddingBottom: '60px' }}>
                <NetflixRow
                  title="Trending in Sunstone Prayas Lab"
                  icon={Flame}
                  books={trendingBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />

                <NetflixRow
                  title="B.Tech CS • Core Engineering & Computer Science"
                  icon={Code}
                  books={btechBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />

                <NetflixRow
                  title="MBA • Corporate Finance, Strategy & Management"
                  icon={GraduationCap}
                  books={mbaBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />

                <NetflixRow
                  title="BCA • Web Engineering & Software Development"
                  icon={Server}
                  books={bcaBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />

                <NetflixRow
                  title="BBA • Business Administration & Marketing"
                  icon={Briefcase}
                  books={bbaBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />

                <NetflixRow
                  title="Special Collections • Prayas Lab Industry AI Case Studies"
                  icon={Sparkles}
                  books={specialBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />

                <NetflixRow
                  title="Journals • Academic Research Papers & Peer Reviews"
                  icon={BookOpenCheck}
                  books={journalBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenSnippets={(b) => setActiveSnippetBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                  borrowedBookIds={borrowedBookIds}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STUDENT PROFILE & SHELF */}
        {currentView === 'profile' && (
          <main style={{ padding: '0 32px 60px' }}>
            <StudentProfile
              user={user}
              allBooks={books}
              savedBookIds={savedBookIds}
              onToggleSave={handleToggleSaveBook}
              onOpenReader={(b) => setActiveReaderBook(b)}
              onOpenSnippets={(b) => setActiveSnippetBook(b)}
              onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
              onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
              borrowRequests={borrowRequests}
              userNotes={userNotes}
              onDeleteNote={handleDeleteNote}
              activeTab={profileSubTab}
              setActiveTab={setProfileSubTab}
              borrowedBookIds={borrowedBookIds}
            />
          </main>
        )}

        {/* VIEW 3: SECRET ADMIN CONSOLE */}
        {currentView === 'admin' && (
          <main style={{ padding: '0 32px 60px' }}>
            <AdminConsole
              user={user}
              onAdminLogin={(adminUser) => handleSetUser(adminUser)}
              allBooks={books}
              onUploadBook={handleUploadBook}
              onDeleteBook={handleDeleteBook}
              borrowRequests={borrowRequests}
              onUpdateBorrowStatus={handleUpdateBorrowStatus}
              students={students}
              onToggleStudentStatus={handleToggleStudentStatus}
            />
          </main>
        )}
      </div>

      {/* MODALS */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(usr) => {
            handleSetUser(usr);
            setShowAuthModal(false);
          }}
          onRegisterSuccess={(usr) => {
            handleSetUser(usr);
            setShowAuthModal(false);
          }}
          onAdminLoginSuccess={(adminUsr) => {
            handleSetUser(adminUsr);
            setCurrentView('admin');
            setShowAuthModal(false);
          }}
        />
      )}

      {selectedQuickSummaryBook && (
        <BookDetailModal
          book={selectedQuickSummaryBook}
          onClose={() => setSelectedQuickSummaryBook(null)}
          onOpenReader={(b) => setActiveReaderBook(b)}
          onOpenSnippets={(b) => setActiveSnippetBook(b)}
          onOpenBorrowModal={(b) => {
            if (!user) setShowAuthModal(true);
            else setActiveBorrowBook(b);
          }}
          initialTab="summary"
          isBorrowed={borrowedBookIds.includes(selectedQuickSummaryBook.id)}
        />
      )}

      {activeSnippetBook && (
        <ChapterSnippetsModal
          book={activeSnippetBook}
          onClose={() => setActiveSnippetBook(null)}
          onOpenBorrowModal={(b) => {
            if (!user) setShowAuthModal(true);
            else setActiveBorrowBook(b);
          }}
          onOpenReader={(b) => setActiveReaderBook(b)}
          isBorrowed={borrowedBookIds.includes(activeSnippetBook.id)}
        />
      )}

      {activeReaderBook && (
        <PdfReaderModal
          book={activeReaderBook}
          onClose={() => setActiveReaderBook(null)}
          userNotes={userNotes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          isBorrowed={borrowedBookIds.includes(activeReaderBook.id)}
          onOpenSnippets={(b) => setActiveSnippetBook(b)}
          onOpenBorrowModal={(b) => {
            if (!user) setShowAuthModal(true);
            else setActiveBorrowBook(b);
          }}
        />
      )}

      {activeBorrowBook && (
        <BorrowModal
          book={activeBorrowBook}
          user={user}
          onClose={() => setActiveBorrowBook(null)}
          onSubmitBorrowRequest={handleSubmitBorrowRequest}
        />
      )}
    </div>
  );
}
