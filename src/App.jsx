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
  deleteNoteFromFirestore,
  getStudentsFromFirestore,
  addStudentToFirestore,
  updateStudentStatusInFirestore
} from './firebase.js';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('catalog');
  const [profileSubTab, setProfileSubTab] = useState('shelf');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Active user session and cryptographic JWT token
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sunstone_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('sunstone_token') || null;
    } catch (e) {
      return null;
    }
  });

  const handleSetUser = (userData, userToken = null) => {
    if (userData) {
      try {
        localStorage.setItem('sunstone_user', JSON.stringify(userData));
        if (userToken) localStorage.setItem('sunstone_token', userToken);
      } catch (e) {}
      setUser(userData);
      if (userToken) setToken(userToken);
    } else {
      try {
        localStorage.removeItem('sunstone_user');
        localStorage.removeItem('sunstone_token');
      } catch (e) {}
      setUser(null);
      setToken(null);
    }
  };

  const handleLogout = () => {
    handleSetUser(null);
    setCurrentView('catalog');
  };

  // Catalog Books State with persistent local cache
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('sunstone_books');
      return saved ? JSON.parse(saved) : initialBooks;
    } catch (e) {
      return initialBooks;
    }
  });

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

  const [borrowRequests, setBorrowRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('sunstone_borrow_requests');
      return saved ? JSON.parse(saved) : initialBorrowRequests;
    } catch (e) {
      return initialBorrowRequests;
    }
  });

  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('sunstone_students');
      return saved ? JSON.parse(saved) : initialStudents;
    } catch (e) {
      return initialStudents;
    }
  });

  // Modal Control States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedQuickSummaryBook, setSelectedQuickSummaryBook] = useState(null);
  const [activeSnippetBook, setActiveSnippetBook] = useState(null);
  const [activeReaderBook, setActiveReaderBook] = useState(null);
  const [activeBorrowBook, setActiveBorrowBook] = useState(null);

  const borrowedBookIds = borrowRequests
    .filter((r) => user && (r.studentId === user.id || r.studentEmail === user.email) && r.status === 'Approved')
    .map((r) => r.bookId);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Server-Side Session Verification on App Startup
  useEffect(() => {
    async function verifySession() {
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            try {
              localStorage.setItem('sunstone_user', JSON.stringify(data.user));
            } catch (e) {}
          }
        } else if (res.status === 401 || res.status === 403) {
          handleSetUser(null);
        }
      } catch (e) {}
    }
    verifySession();
  }, [token]);

  // 1. Load Books Data (Firestore -> Server -> LocalStorage)
  useEffect(() => {
    async function loadBooksData() {
      try {
        const fsBooks = await getBooksFromFirestore();
        if (fsBooks && fsBooks.length > 0) {
          setBooks(fsBooks);
          try {
            localStorage.setItem('sunstone_books', JSON.stringify(fsBooks));
          } catch (e) {}
          return;
        }
      } catch (e) {}

      try {
        const res = await fetch('/api/books');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBooks(data);
            try {
              localStorage.setItem('sunstone_books', JSON.stringify(data));
            } catch (e) {}
          }
        }
      } catch (err) {}
    }
    loadBooksData();
  }, []);

  // 2. Load Borrow Requests Data (Firestore -> Server -> LocalStorage)
  useEffect(() => {
    async function loadRequestsData() {
      try {
        const fsReqs = await getBorrowRequestsFromFirestore();
        if (fsReqs && fsReqs.length > 0) {
          setBorrowRequests(fsReqs);
          try {
            localStorage.setItem('sunstone_borrow_requests', JSON.stringify(fsReqs));
          } catch (e) {}
          return;
        }
      } catch (e) {}

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/borrow-requests', { headers });
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBorrowRequests(data);
            try {
              localStorage.setItem('sunstone_borrow_requests', JSON.stringify(data));
            } catch (e) {}
          }
        }
      } catch (e) {}
    }
    loadRequestsData();
  }, [token]);

  // 3. Load Registered Students for Admin Console (Firestore -> Server -> LocalStorage)
  useEffect(() => {
    async function loadStudentsData() {
      try {
        const fsStudents = await getStudentsFromFirestore();
        if (fsStudents && fsStudents.length > 0) {
          setStudents(fsStudents);
          try {
            localStorage.setItem('sunstone_students', JSON.stringify(fsStudents));
          } catch (e) {}
          return;
        }
      } catch (e) {}

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/students', { headers });
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStudents(data);
            try {
              localStorage.setItem('sunstone_students', JSON.stringify(data));
            } catch (e) {}
          }
        }
      } catch (e) {}
    }
    loadStudentsData();
  }, [token]);

  // 4. Load Study Notes
  useEffect(() => {
    async function loadNotesData() {
      try {
        const fsNotes = await getNotesFromFirestore();
        if (fsNotes && fsNotes.length > 0) {
          setUserNotes(fsNotes);
          return;
        }
      } catch (e) {}

      try {
        if (!token) return;
        const res = await fetch('/api/notes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setUserNotes(data);
        }
      } catch (e) {}
    }
    loadNotesData();
  }, [token]);

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
      if (token) {
        await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newNote)
        });
      }
    } catch (e) {}

    try {
      await addNoteToFirestore(noteObj);
    } catch (e) {}
    triggerToast('Study note saved successfully!');
  };

  const handleDeleteNote = async (noteId) => {
    setUserNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      if (token) {
        await fetch(`/api/notes/${noteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {}

    try {
      await deleteNoteFromFirestore(noteId);
    } catch (e) {}
    triggerToast('Note deleted from your repository.');
  };

  // Submit Borrow Request (Linked to Active Student Profile)
  const handleSubmitBorrowRequest = async (requestPayload) => {
    const studentId = user ? user.id : ('usr_' + Date.now());
    const studentName = user ? user.name : 'Student Scholar';
    const studentEmail = user ? user.email : 'student@sunstone.in';
    const studentProgram = user ? user.program : 'B.Tech CS';

    const reqId = 'req_' + Date.now();
    const newReq = {
      ...requestPayload,
      id: reqId,
      studentId,
      studentName,
      studentEmail,
      studentProgram,
      requestDate: new Date().toISOString(),
      status: 'Pending',
      adminNote: ''
    };

    setBorrowRequests((prev) => {
      const next = [newReq, ...prev];
      try {
        localStorage.setItem('sunstone_borrow_requests', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await addBorrowRequestToFirestore(newReq);
    } catch (e) {}

    try {
      if (token) {
        await fetch('/api/borrow-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newReq)
        });
      }
    } catch (e) {}

    triggerToast(`Borrow request submitted for "${requestPayload.bookTitle}"!`);
  };

  // Admin Updates Borrow Request (Approved / Rejected / Returned)
  const handleUpdateBorrowStatus = async (requestId, status, adminNote = '') => {
    setBorrowRequests((prev) => {
      const next = prev.map((r) => (r.id === requestId ? { ...r, status, adminNote } : r));
      try {
        localStorage.setItem('sunstone_borrow_requests', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await updateBorrowStatusInFirestore(requestId, status, adminNote);
    } catch (e) {}

    try {
      if (token) {
        await fetch(`/api/borrow-requests/${requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status, adminNote })
        });
      }
    } catch (e) {}

    triggerToast(`Borrow request marked as ${status}.`);
  };

  // Admin Uploads New Book (Direct File / Google Drive Link / Web PDF)
  const handleUploadBook = async (formData) => {
    const title = formData.get('title') || 'Untitled Academic Textbook';
    const author = formData.get('author') || 'Sunstone Faculty';
    const program = formData.get('program') || 'All Programs';
    const category = formData.get('category') || 'General Academic';
    const description = formData.get('description') || 'Curated textbook standard for Prayas Lab scholars.';
    const coverUrl = formData.get('coverUrl') || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    const pdfUrl = formData.get('pdfUrl') || '';
    const fileType = formData.get('fileType') || 'url';
    const rawHighlights = formData.get('highlights');
    const rawTakeaways = formData.get('keyTakeaways');
    const rawSnippets = formData.get('chapterSnippets');

    const parseArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return String(input).split('\n').map((s) => s.trim()).filter(Boolean);
    };

    const parseSnippets = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      const blocks = String(input).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
      return blocks.map((block, idx) => {
        const firstLine = block.split('\n')[0];
        const rest = block.split('\n').slice(1).join(' ').trim();
        return {
          chapterNumber: idx + 1,
          title: firstLine.startsWith('Chapter') ? firstLine : `Chapter ${idx + 1}: ${firstLine.slice(0, 45)}`,
          summary: rest || block
        };
      });
    };

    const highlights = parseArray(rawHighlights);
    const keyTakeaways = parseArray(rawTakeaways);
    const chapterSnippets = parseSnippets(rawSnippets);

    const bookId = 'bk_' + Date.now();
    const newBook = {
      id: bookId,
      title,
      author,
      program,
      category,
      coverUrl,
      fileType,
      pdfUrl: pdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      description,
      pages: 350,
      rating: 4.9,
      publishedYear: 2026,
      downloadable: true,
      quickSummary: {
        highlights: highlights.length > 0 ? highlights : ['Comprehensive theoretical foundations and practical laboratory applications.'],
        keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ['Master core academic frameworks mapped to Sunstone curriculum.'],
        estimatedReadingTime: '8 Hours',
        difficultyLevel: 'Intermediate'
      },
      chapterSnippets: chapterSnippets.length > 0 ? chapterSnippets : undefined,
      createdAt: new Date().toISOString()
    };

    // 1. Immediately update UI state & local cache
    setBooks((prev) => {
      const nextBooks = [newBook, ...prev];
      try {
        localStorage.setItem('sunstone_books', JSON.stringify(nextBooks));
      } catch (e) {}
      return nextBooks;
    });

    // 2. Persist to Firebase Realtime DB & Firestore
    try {
      await addBookToFirestore(newBook);
    } catch (e) {}

    // 3. Persist to Express backend server if available
    try {
      if (token) {
        await fetch('/api/books', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }
    } catch (e) {}

    triggerToast(`Book "${title}" published to Sunstone Library!`);
  };

  // Admin Deletes Book from Catalog
  const handleDeleteBook = async (bookId) => {
    setBooks((prev) => {
      const nextBooks = prev.filter((b) => b.id !== bookId);
      try {
        localStorage.setItem('sunstone_books', JSON.stringify(nextBooks));
      } catch (e) {}
      return nextBooks;
    });

    try {
      await deleteBookFromFirestore(bookId);
    } catch (e) {}

    try {
      if (token) {
        await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {}

    triggerToast('Book removed from Sunstone catalog.');
  };

  // Admin Suspends or Activates Student Account
  const handleToggleStudentStatus = async (studentId, forcedStatus = null) => {
    const student = students.find((s) => s.id === studentId);
    const newStatus = forcedStatus || (student && student.status === 'Active' ? 'Suspended' : 'Active');

    setStudents((prev) => {
      const next = prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s));
      try {
        localStorage.setItem('sunstone_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // If currently logged-in user is this student, update session
    if (user && user.id === studentId) {
      const updatedUser = { ...user, status: newStatus };
      handleSetUser(updatedUser, token);
    }

    try {
      await updateStudentStatusInFirestore(studentId, newStatus);
    } catch (e) {}

    try {
      if (token) {
        await fetch(`/api/students/${studentId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      }
    } catch (e) {}

    triggerToast(`Student status updated to ${newStatus}.`);
  };

  // Handler for New Student Registration
  const handleRegisterSuccess = async (newUser, userToken) => {
    handleSetUser(newUser, userToken);
    if (newUser && newUser.role === 'student') {
      setStudents((prev) => {
        const exists = prev.some((s) => s.id === newUser.id || s.email === newUser.email);
        const next = exists ? prev : [newUser, ...prev];
        try {
          localStorage.setItem('sunstone_students', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      try {
        await addStudentToFirestore(newUser);
      } catch (e) {}
    }
    setShowAuthModal(false);
    triggerToast(`Welcome to Sunstone Library, ${newUser.name}!`);
  };

  // Filter books based on search query and selected program
  const filteredBooks = books.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return selectedProgram === 'All Programs' || b.program === selectedProgram;
    }

    const matchesSearch =
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      b.program.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      (b.description && b.description.toLowerCase().includes(query));

    const matchesProgram = selectedProgram === 'All Programs' || b.program === selectedProgram;
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
    (r) => user && (r.studentId === user.id || r.studentEmail === user.email) && r.status === 'Pending'
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
          setSelectedProgram={setSelectedProgram}
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

        {/* VIEW 1: HOME CATALOG VIEW */}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
                  onOpenBorrowModal={(b) => {
                    if (!user) setShowAuthModal(true);
                    else setActiveBorrowBook(b);
                  }}
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
              onOpenBorrowModal={(b) => {
                if (!user) setShowAuthModal(true);
                else setActiveBorrowBook(b);
              }}
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
              onAdminLogin={(adminUser, adminToken) => handleSetUser(adminUser, adminToken)}
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

      {/* MOBILE BOTTOM NAVIGATION BAR */}
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
          onLoginSuccess={(usr, usrToken) => {
            handleSetUser(usr, usrToken);
            setShowAuthModal(false);
          }}
          onRegisterSuccess={(usr, usrToken) => {
            handleRegisterSuccess(usr, usrToken);
          }}
          onAdminLoginSuccess={(adminUsr, adminToken) => {
            handleSetUser(adminUsr, adminToken);
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
          hasPendingBorrowRequest={borrowRequests.some(
            (r) => user && (r.studentId === user.id || r.studentEmail === user.email) && r.bookId === activeReaderBook.id && r.status === 'Pending'
          )}
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
