import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopHeader from './components/TopHeader.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import ProgramTabs from './components/ProgramTabs.jsx';
import NetflixRow from './components/NetflixRow.jsx';
import BookGrid from './components/BookGrid.jsx';
import BookDetailModal from './components/BookDetailModal.jsx';
import PdfReaderModal from './components/PdfReaderModal.jsx';
import StudentProfile from './components/StudentProfile.jsx';
import AdminConsole from './components/AdminConsole.jsx';
import AuthModal from './components/AuthModal.jsx';
import BorrowModal from './components/BorrowModal.jsx';
import { Flame, Code, GraduationCap, Server, Briefcase, Sparkles, BookOpenCheck, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('catalog');
  const [profileSubTab, setProfileSubTab] = useState('shelf');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Active student user session
  const [user, setUser] = useState({
    id: 'usr_student1',
    name: 'Jatin',
    email: 'jatin@sunstone.in',
    role: 'student',
    program: 'B.Tech CS'
  });

  // Catalog Books State
  const [books, setBooks] = useState([]);
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

  const [borrowRequests, setBorrowRequests] = useState([
    {
      id: 'req_101',
      studentId: 'usr_student1',
      studentName: 'Jatin',
      studentEmail: 'jatin@sunstone.in',
      studentProgram: 'B.Tech CS',
      bookId: 'bk_cs_1',
      bookTitle: 'Data Structures and Algorithms in Python',
      requestDate: new Date().toISOString(),
      borrowType: 'Physical Copy',
      studentMessage: 'Respected Admin, I need the physical copy for 2 weeks to prepare for the Prayas Lab hackathon and end-term exam. Kindly approve.',
      status: 'Pending',
      adminNote: ''
    }
  ]);

  const [students, setStudents] = useState([
    { id: 'usr_student1', name: 'Jatin', email: 'jatin@sunstone.in', program: 'B.Tech CS', status: 'Active' },
    { id: 'usr_student2', name: 'Ananya Verma', email: 'ananya@sunstone.in', program: 'MBA', status: 'Active' },
    { id: 'usr_student3', name: 'Rohan Gupta', email: 'rohan@sunstone.in', program: 'BCA', status: 'Active' },
    { id: 'usr_student4', name: 'Priya Singh', email: 'priya@sunstone.in', program: 'BBA', status: 'Active' }
  ]);

  // Modal Control States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedQuickSummaryBook, setSelectedQuickSummaryBook] = useState(null);
  const [activeReaderBook, setActiveReaderBook] = useState(null);
  const [activeBorrowBook, setActiveBorrowBook] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBooks(data);
        }
      })
      .catch((err) => console.warn('API fallback:', err));
  }, []);

  useEffect(() => {
    fetch('/api/borrow-requests')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBorrowRequests(data);
        }
      })
      .catch(() => {});
  }, []);

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
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteObj)
    }).catch(() => {});
  };

  const handleDeleteNote = (noteId) => {
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
    fetch(`/api/notes/${noteId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUploadBook = async (formData) => {
    try {
      const res = await fetch('/api/books', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.book) setBooks((prev) => [data.book, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBook = async (bookId) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
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
        onLogout={() => {
          setUser(null);
          setCurrentView('catalog');
        }}
        setProfileSubTab={setProfileSubTab}
      />

      {/* Main Workspace Area */}
      <div className="app-main">
        <TopHeader
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAuth={() => setShowAuthModal(true)}
          onSwitchUserRole={handleSwitchUserRole}
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
                onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
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
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />
              </main>
            ) : (
              <div style={{ paddingBottom: '60px' }}>
                <NetflixRow
                  title="Trending in Sunstone Prayas Lab"
                  icon={Flame}
                  books={trendingBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />

                <NetflixRow
                  title="B.Tech CS • Core Engineering & Computer Science"
                  icon={Code}
                  books={btechBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />

                <NetflixRow
                  title="MBA • Corporate Finance, Strategy & Management"
                  icon={GraduationCap}
                  books={mbaBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />

                <NetflixRow
                  title="BCA • Web Engineering & Software Development"
                  icon={Server}
                  books={bcaBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />

                <NetflixRow
                  title="BBA • Business Administration & Marketing"
                  icon={Briefcase}
                  books={bbaBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />

                <NetflixRow
                  title="Special Collections • Prayas Lab Industry AI Case Studies"
                  icon={Sparkles}
                  books={specialBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
                />

                <NetflixRow
                  title="Journals • Academic Research Papers & Peer Reviews"
                  icon={BookOpenCheck}
                  books={journalBooks}
                  onOpenReader={(b) => setActiveReaderBook(b)}
                  onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
                  onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
                  savedBookIds={savedBookIds}
                  onToggleSave={handleToggleSaveBook}
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
              onOpenQuickSummary={(b) => setSelectedQuickSummaryBook(b)}
              onOpenBorrowModal={(b) => setActiveBorrowBook(b)}
              borrowRequests={borrowRequests}
              userNotes={userNotes}
              onDeleteNote={handleDeleteNote}
              activeTab={profileSubTab}
              setActiveTab={setProfileSubTab}
            />
          </main>
        )}

        {/* VIEW 3: SECRET ADMIN CONSOLE */}
        {currentView === 'admin' && (
          <main style={{ padding: '0 32px 60px' }}>
            <AdminConsole
              user={user}
              onAdminLogin={(adminUser) => setUser(adminUser)}
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
            setUser(usr);
            setShowAuthModal(false);
          }}
          onRegisterSuccess={(usr) => {
            setUser(usr);
            setShowAuthModal(false);
          }}
          onAdminLoginSuccess={(adminUsr) => {
            setUser(adminUsr);
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
          onOpenBorrowModal={(b) => {
            if (!user) setShowAuthModal(true);
            else setActiveBorrowBook(b);
          }}
          initialTab="summary"
        />
      )}

      {activeReaderBook && (
        <PdfReaderModal
          book={activeReaderBook}
          onClose={() => setActiveReaderBook(null)}
          userNotes={userNotes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
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
