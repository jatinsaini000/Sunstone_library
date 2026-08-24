import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopHeader from './components/TopHeader.jsx';
import MobileNav from './components/MobileNav.jsx';
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
      try {
        const fsNotes = await getNotesFromFirestore();
        if (fsNotes && fsNotes.length > 0) {
          setUserNotes(fsNotes);
        }
      } catch (e) {}
    }
    loadNotesData();
  }, []);

  const triggerToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleSaveBook = (bookId) => {
    setSavedBookIds((prev) => {
      const isSaved = prev.includes(bookId);
      const next = isSaved ? prev.filter((id) => id !== bookId) : [...prev, bookId];
      triggerToast(isSaved ? 'Book removed from your shelf' : 'Book saved to your personal shelf!');
      return next;
    });
  };

  const handleAddNote = async (newNote) => {
    const noteObj = {
      ...newNote,
      id: 'n_' + Date.now(),
      studentId: user ? user.id : 'usr_guest',
      createdAt: new Date().toISOString()
    };
    setUserNotes((prev) => [noteObj, ...prev]);
    try {
      await addNoteToFirestore(noteObj);
    } catch (e) {}
    triggerToast('Study note saved successfully!');
  };

  const handleDeleteNote = async (noteId) => {
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await deleteNoteFromFirestore(noteId);
    } catch (e) {}
    triggerToast('Note deleted from your repository.');
  };

  const handleSubmitBorrowRequest = async (requestPayload) => {
    const newReq = {
      ...requestPayload,
      id: 'req_' + Date.now(),
      studentId: user ? user.id : 'usr_guest',
      studentName: user ? user.name : 'Guest Student',
      studentEmail: user ? user.email : 'student@sunstone.in',
      program: user ? user.program : 'B.Tech CS',
      requestDate: new Date().toISOString(),
      status: 'Pending',
      adminNote: ''
    };

    setBorrowRequests((prev) => [newReq, ...prev]);

    try {
      await addBorrowRequestToFirestore(newReq);
    } catch (e) {}

    try {
      await fetch('/api/borrow-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
    } catch (e) {}

    triggerToast(`Borrow request submitted for "${requestPayload.bookTitle}"!`);
  };

  const handleUpdateBorrowStatus = async (requestId, status, adminNote) => {
    setBorrowRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status, adminNote } : r))
    );

    try {
      await updateBorrowStatusInFirestore(requestId, status, adminNote);
    } catch (e) {}

    try {
      await fetch(`/api/borrow-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote })
      });
    } catch (e) {}

    triggerToast(`Request marked as ${status}.`);
  };

  const handleUploadBook = async (formData) => {
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newBook = await res.json();
        setBooks((prev) => [newBook, ...prev]);
        try {
          await addBookToFirestore(newBook);
        } catch (e) {}
        triggerToast(`Book "${newBook.title}" added to Sunstone Library!`);
      }
    } catch (e) {
      const newBookFallback = {
        id: 'bk_' + Date.now(),
        title: formData.get('title'),
        author: formData.get('author'),
        program: formData.get('program'),
        category: formData.get('category'),
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        pdfUrl: formData.get('pdfUrl') || '',
        description: formData.get('description'),
        pages: 320,
        rating: 4.9,
        publishedYear: 2026,
        isCustom: true
      };
      setBooks((prev) => [newBookFallback, ...prev]);
      try {
        await addBookToFirestore(newBookFallback);
      } catch (err) {}
      triggerToast(`Book published to Sunstone Library!`);
    }
  };

  const handleDeleteBook = async (bookId) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    try {
      await deleteBookFromFirestore(bookId);
    } catch (e) {}
    try {
      await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('Book removed from Sunstone catalog.');
  };

  const handleToggleStudentStatus = (studentId) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' } : s))
    );
    triggerToast('Student access permissions updated.');
  };

  // Filter books based on search query and selected program
  const filteredBooks = books.filter((b) => {
    const matchesProgram = selectedProgram === 'All Programs' || b.program === selectedProgram;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesProgram;

    const matchesSearch =
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      b.program.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      (b.description && b.description.toLowerCase().includes(query));

    return matchesProgram && matchesSearch;
  });

  // Calculate counts for program categories
  const programCounts = books.reduce(
    (acc, b) => {
      acc['All Programs'] = (acc['All Programs'] || 0) + 1;
      if (b.program) {
        acc[b.program] = (acc[b.program] || 0) + 1;
      }
      return acc;
    },
    { 'All Programs': books.length }
  );

  const featuredBook = books[0] || initialBooks[0];
  const trendingBooks = books.slice(0, 6);
  const btechBooks = books.filter((b) => b.program === 'B.Tech CS');
  const mbaBooks = books.filter((b) => b.program === 'MBA');
  const bcaBooks = books.filter((b) => b.program === 'BCA');
  const bbaBooks = books.filter((b) => b.program === 'BBA');
  const specialBooks = books.filter((b) => b.program === 'Special Collections');
  const journalBooks = books.filter((b) => b.program === 'Journals');

  const pendingRequestsCount = borrowRequests.filter(
    (r) => user && r.studentId === user.id && r.status === 'Pending'
  ).length;

  return (
    <div className="app-layout">
      {/* Official Sunstone Desktop Sidebar */}
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
          theme={theme}
          setTheme={setTheme}
        />

        {/* Live Toast Banner */}
        {toastMessage && (
          <div className="app-toast-banner">
            <div className="toast-content">
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToastMessage(null)}
              aria-label="Close message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* VIEW 1: HOME CATALOG VIEW (NETFLIX / SWIGGY STYLE) */}
        {currentView === 'catalog' && (
          <div className="catalog-view-wrap">
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

            {/* Sunstone Program Filter Category Pills */}
            <ProgramTabs
              selectedProgram={selectedProgram}
              setSelectedProgram={setSelectedProgram}
              counts={programCounts}
            />

            {/* Filtered Grid or Netflix Category Rows */}
            {searchQuery || selectedProgram !== 'All Programs' ? (
              <main className="catalog-grid-main">
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
              <div className="catalog-rows-container">
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
          <main className="view-content-main">
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
          <main className="view-content-main">
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

      {/* MOBILE BOTTOM NAVIGATION BAR (Swiggy / Zomato style) */}
      <MobileNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        profileSubTab={profileSubTab}
        setProfileSubTab={setProfileSubTab}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        savedCount={savedBookIds.length}
        requestCount={pendingRequestsCount}
        onSelectCategoryModal={() => {
          if (currentView !== 'catalog') {
            setCurrentView('catalog');
          }
          setTimeout(() => {
            const el = document.getElementById('programs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

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
