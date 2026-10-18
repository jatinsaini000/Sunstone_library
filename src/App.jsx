import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopHeader from './components/TopHeader.jsx';
import MobileNav from './components/MobileNav.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import ProgramTabs from './components/ProgramTabs.jsx';
import NetflixRow from './components/NetflixRow.jsx';
import BookGrid from './components/BookGrid.jsx';
import AuthModal from './components/AuthModal.jsx';
import BorrowModal from './components/BorrowModal.jsx';

// Lazy-loaded components for optimal performance and smaller initial bundle size
const BookDetailModal = lazy(() => import('./components/BookDetailModal.jsx'));
const ChapterSnippetsModal = lazy(() => import('./components/ChapterSnippetsModal.jsx'));
const PdfReaderModal = lazy(() => import('./components/PdfReaderModal.jsx'));
const StudentProfile = lazy(() => import('./components/StudentProfile.jsx'));
const AdminConsole = lazy(() => import('./components/AdminConsole.jsx'));

import {
  Flame,
  Code,
  GraduationCap,
  Briefcase,
  Sparkles,
  BookOpenCheck,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { initialBooks, initialBorrowRequests, initialStudents } from './starterBooks.js';
import { preferCatalogIfStale, enrichBooksCatalog } from './bookEnrichment.js';
import {
  getBooksFromFirestore,
  getBorrowRequestsFromFirestore,
  addBookToFirestore,
  updateBookInFirestore,
  deleteBookFromFirestore,
  addBorrowRequestToFirestore,
  updateBorrowStatusInFirestore,
  deleteBorrowRequestFromFirestore,
  getNotesFromFirestore,
  addNoteToFirestore,
  deleteNoteFromFirestore,
  getStudentsFromFirestore,
  getAllUsersFromFirestore,
  addStudentToFirestore,
  updateStudentStatusInFirestore,
  deleteStudentFromFirestore,
  updateUserRoleInFirestore,
  getAdminEmailsFromFirestore,
  saveAdminEmailsToFirestore,
  getUserProfile,
  syncGoogleUser,
  signOutUser,
  onAuthUserChanged
} from './firebase.js';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('catalog');
  const [profileSubTab, setProfileSubTab] = useState('shelf');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Active user session (Synced with Firebase Auth and Firestore /users/{uid})
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
    signOutUser();
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

  const [savedBookIds, setSavedBookIds] = useState(() => {
    try {
      const saved = localStorage.getItem('sunstone_saved_books');
      return saved ? JSON.parse(saved) : ['bk_general_1', 'bk_general_2'];
    } catch (e) {
      return ['bk_general_1', 'bk_general_2'];
    }
  });
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

  const [adminEmails, setAdminEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('sunstone_admin_emails');
      return saved ? JSON.parse(saved) : ['Sunrbu@admin.login', 'admin@sunstone.in', 'sainijatin505@gmail.com'];
    } catch (e) {
      return ['Sunrbu@admin.login', 'admin@sunstone.in', 'sainijatin505@gmail.com'];
    }
  });

  // Modal Control States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedQuickSummaryBook, setSelectedQuickSummaryBook] = useState(null);
  const [activeSnippetBook, setActiveSnippetBook] = useState(null);
  const [activeReaderBook, setActiveReaderBook] = useState(null);
  const [activeBorrowBook, setActiveBorrowBook] = useState(null);

  // Single-Borrower Rule: map of bookId -> active loan (status === 'Approved')
  const activeLoansByBookId = {};
  (borrowRequests || []).forEach((r) => {
    if (r && r.status === 'Approved') {
      activeLoansByBookId[r.bookId] = r;
    }
  });

  const borrowedBookIds = borrowRequests
    .filter((r) => user && (r.studentId === user.id || r.studentEmail === user.email) && r.status === 'Approved')
    .map((r) => r.bookId);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to Firebase Auth state natively for persistent Google Sign-In
  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            handleSetUser(profile);
          } else {
            const synced = await syncGoogleUser(firebaseUser, adminEmails);
            handleSetUser(synced);
          }
        } catch (e) {
          console.warn('Auth state sync notice:', e.message);
        }
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [adminEmails]);

  // 1. Load Books Data (Firestore -> Server -> LocalStorage -> Catalog)
  useEffect(() => {
    async function loadBooksData() {
      const applyBooks = (bookList) => {
        const resolved = preferCatalogIfStale(bookList);
        setBooks(resolved);
        try {
          localStorage.setItem('sunstone_books', JSON.stringify(resolved));
        } catch (e) {}
      };

      try {
        const fsBooks = await getBooksFromFirestore();
        if (fsBooks && fsBooks.length > 0) {
          applyBooks(enrichBooksCatalog(fsBooks));
          return;
        }
      } catch (e) {}

      try {
        const res = await fetch('/api/books');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            applyBooks(enrichBooksCatalog(data));
            return;
          }
        }
      } catch (err) {}

      applyBooks(initialBooks);
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
        const res = await fetch('/api/borrow-requests');
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
  }, []);

  // 3. Load Admin Emails on startup (determines Google Sign-In admin privileges)
  useEffect(() => {
    async function loadAdminEmails() {
      try {
        const fsAdminEmails = await getAdminEmailsFromFirestore();
        if (fsAdminEmails && fsAdminEmails.length > 0) {
          setAdminEmails(fsAdminEmails);
          try {
            localStorage.setItem('sunstone_admin_emails', JSON.stringify(fsAdminEmails));
          } catch (e) {}
        }
      } catch (e) {}
    }
    loadAdminEmails();
  }, []);

  // 4. Load Registered Users ONLY when authenticated user is Admin (Scale: avoids downloading 1,000+ users for students)
  useEffect(() => {
    async function loadUsersForAdmin() {
      if (user?.role !== 'admin') return;
      try {
        const fsUsers = await getAllUsersFromFirestore();
        if (fsUsers && fsUsers.length > 0) {
          setStudents(fsUsers);
          try {
            localStorage.setItem('sunstone_students', JSON.stringify(fsUsers));
          } catch (e) {}
        }
      } catch (e) {}
    }
    loadUsersForAdmin();
  }, [user?.role]);

  // 5. Load Study Notes for active user
  useEffect(() => {
    async function loadNotesData() {
      if (!user) {
        setUserNotes([]);
        return;
      }
      try {
        const currentUserId = user.uid || user.id;
        const fsNotes = await getNotesFromFirestore(currentUserId);
        if (fsNotes && fsNotes.length > 0) {
          setUserNotes(fsNotes);
          return;
        }
      } catch (e) {}
    }
    loadNotesData();
  }, [user?.uid, user?.id]);

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
      try { localStorage.setItem('sunstone_saved_books', JSON.stringify(next)); } catch(e){}
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
    const studentUid = user ? (user.uid || user.id) : ('usr_' + Date.now());
    const studentEmail = user ? user.email : 'student@sunstone.in';

    // 1. Quota Check: Max 3 active or pending books per student
    const activeBorrows = borrowRequests.filter(
      (r) => (r.studentId === studentUid || r.studentEmail?.toLowerCase() === studentEmail?.toLowerCase()) &&
             (r.status === 'Approved' || r.status === 'Pending')
    );
    if (activeBorrows.length >= 3) {
      triggerToast('Quota Limit: You have reached the maximum allowance of 3 active or pending book requests.', 'error');
      return;
    }

    // 2. Enforce Single Borrower Rule:
    const activeLoan = activeLoansByBookId[requestPayload.bookId];
    if (activeLoan && activeLoan.studentId !== studentUid && activeLoan.studentEmail?.toLowerCase() !== studentEmail?.toLowerCase()) {
      triggerToast('This book is currently on loan to another student. Only one reader can borrow it at a time.', 'error');
      return;
    }

    const studentName = user ? (user.displayName || user.name) : 'Student Scholar';
    const studentProgram = user ? (user.program || user.academic?.program) : 'B.Tech & BCA';

    const reqId = 'req_' + Date.now();
    const newReq = {
      ...requestPayload,
      id: reqId,
      studentId: studentUid,
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

    triggerToast(`Borrow request submitted for "${requestPayload.bookTitle}"!`);
  };

  // Admin Updates Borrow Request (Approved / Rejected / Returned)
  const handleUpdateBorrowStatus = async (requestId, status, adminNote = '') => {
    const targetReq = borrowRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    if (status === 'Approved') {
      // 1. Concurrency Check: Book must not already be on loan to another reader
      const isAlreadyLoaned = borrowRequests.some(
        (r) => r.bookId === targetReq.bookId && r.id !== requestId && r.status === 'Approved'
      );
      if (isAlreadyLoaned) {
        triggerToast('Loan Conflict: This book is currently actively loaned out to another reader.', 'error');
        return;
      }

      // 2. Student Quota Check: Maximum 3 approved loans per student
      const studentApprovedLoans = borrowRequests.filter(
        (r) => (r.studentId === targetReq.studentId || (r.studentEmail && targetReq.studentEmail && r.studentEmail.toLowerCase() === targetReq.studentEmail.toLowerCase())) &&
               r.status === 'Approved' &&
               r.id !== requestId
      );
      if (studentApprovedLoans.length >= 3) {
        triggerToast('Quota Exceeded: This student already holds 3 approved books (Maximum limit).', 'error');
        return;
      }
    }

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

    triggerToast(`Borrow request marked as ${status}.`);
  };

  // Admin Deletes Borrow Request
  const handleDeleteBorrowRequest = async (requestId) => {
    setBorrowRequests((prev) => {
      const next = prev.filter((r) => r.id !== requestId);
      try {
        localStorage.setItem('sunstone_borrow_requests', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await deleteBorrowRequestFromFirestore(requestId);
    } catch (e) {}

    try {
      if (token) {
        await fetch(`/api/borrow-requests/${requestId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {}

    triggerToast('Borrow request deleted.');
  };

  // Admin Edits Book
  const handleEditBook = async (bookId, updatedFields) => {
    setBooks((prev) => {
      const next = prev.map((b) => (b.id === bookId ? { ...b, ...updatedFields } : b));
      try {
        localStorage.setItem('sunstone_books', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await updateBookInFirestore(bookId, updatedFields);
    } catch (e) {}

    try {
      if (token) {
        await fetch(`/api/books/${bookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedFields)
        });
      }
    } catch (e) {}

    triggerToast(`Book "${updatedFields.title || 'Textbook'}" updated successfully!`);
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

  // Admin Deletes Book from Catalog with Cascade Cleanup
  const handleDeleteBook = async (bookId) => {
    // 1. Remove from books state
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

    // 2. Cascade cleanup: cancel any pending or active borrow requests for this deleted book
    setBorrowRequests((prev) => {
      const nextReqs = prev.map((r) => {
        if (r.bookId === bookId && (r.status === 'Pending' || r.status === 'Approved')) {
          updateBorrowStatusInFirestore(r.id, 'Returned', 'Book decommissioned from library catalog.');
          return { ...r, status: 'Returned', adminNote: 'Book decommissioned from library catalog.' };
        }
        return r;
      });
      try {
        localStorage.setItem('sunstone_borrow_requests', JSON.stringify(nextReqs));
      } catch (e) {}
      return nextReqs;
    });

    triggerToast('Book removed from Sunstone catalog and associated borrow records archived.');
  };

  // Admin Suspends or Activates Student Account
  const handleToggleStudentStatus = async (studentId, forcedStatus = null) => {
    const student = students.find((s) => s.id === studentId || s.uid === studentId);
    if (!student) return;

    // Self-Protection: Admin cannot suspend their own account
    if (user && (user.id === studentId || user.uid === studentId || user.email?.toLowerCase() === student.email?.toLowerCase())) {
      triggerToast('Security Violation: You cannot suspend your own administrator account.', 'error');
      return;
    }

    const currentStatus = student.status || 'Active';
    const newStatus = forcedStatus || (currentStatus === 'Active' ? 'Suspended' : 'Active');

    setStudents((prev) => {
      const next = prev.map((s) => ((s.id === studentId || s.uid === studentId) ? { ...s, status: newStatus } : s));
      try {
        localStorage.setItem('sunstone_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await updateStudentStatusInFirestore(studentId, newStatus);
    } catch (e) {}

    triggerToast(`Student status updated to ${newStatus}.`);
  };

  // Admin Adds New Student (Google Auth Compatible)
  const handleAddStudent = async (newStudent) => {
    setStudents((prev) => {
      const next = [newStudent, ...prev];
      try {
        localStorage.setItem('sunstone_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await addStudentToFirestore(newStudent);
    } catch (e) {}

    triggerToast(`Student ${newStudent.displayName || newStudent.name} registered successfully!`);
  };

  // Admin Deletes Student Account
  const handleDeleteStudent = async (studentId) => {
    const student = students.find((s) => s.id === studentId || s.uid === studentId);
    if (user && (user.id === studentId || user.uid === studentId || user.email?.toLowerCase() === student?.email?.toLowerCase())) {
      triggerToast('Security Violation: You cannot delete your own account.', 'error');
      return;
    }

    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== studentId && s.uid !== studentId);
      try {
        localStorage.setItem('sunstone_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await deleteStudentFromFirestore(studentId);
    } catch (e) {}

    triggerToast('User account removed.');
  };

  // Admin Grants or Revokes Admin Role for Any Email
  const handleGrantAdminRole = async (targetEmail, targetRole = 'admin') => {
    if (!targetEmail) return;
    const cleanEmail = targetEmail.toLowerCase().trim();

    // Self-Protection & Last-Admin Check
    if (targetRole !== 'admin') {
      if (user && user.email?.toLowerCase() === cleanEmail) {
        triggerToast('Security Violation: You cannot revoke your own administrator privileges.', 'error');
        return;
      }
      if (adminEmails.length <= 1) {
        triggerToast('System Protection: At least one administrator email must remain configured.', 'error');
        return;
      }
    }

    // 1. Update adminEmails state
    setAdminEmails((prev) => {
      let next = [...prev];
      if (targetRole === 'admin') {
        if (!next.includes(cleanEmail)) next.push(cleanEmail);
      } else {
        next = next.filter((e) => e.toLowerCase().trim() !== cleanEmail);
      }
      try {
        localStorage.setItem('sunstone_admin_emails', JSON.stringify(next));
      } catch (e) {}
      saveAdminEmailsToFirestore(next);
      return next;
    });

    // 2. Update user in students list if already present
    setStudents((prev) => {
      const next = prev.map((s) => {
        if (s.email && s.email.toLowerCase().trim() === cleanEmail) {
          updateUserRoleInFirestore(s.uid || s.id, targetRole);
          return { ...s, role: targetRole };
        }
        return s;
      });
      try {
        localStorage.setItem('sunstone_students', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    triggerToast(targetRole === 'admin' ? `Admin access granted to ${cleanEmail}!` : `Admin access revoked for ${cleanEmail}`);
  };

  const handleToggleUserRole = async (userId, newRole) => {
    const targetUser = students.find((s) => s.id === userId || s.uid === userId);
    if (!targetUser) return;
    await handleGrantAdminRole(targetUser.email, newRole);
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
  const btechBooks = books.filter((b) => b.program === 'B.Tech & BCA');
  const mbaBooks = books.filter((b) => b.program === 'MBA');
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
                onOpenBorrowModal={(b) => {
                  if (!user) setShowAuthModal(true);
                  else setActiveBorrowBook(b);
                }}
                isBorrowed={borrowedBookIds.includes(featuredBook?.id)}
                activeLoan={activeLoansByBookId[featuredBook?.id]}
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
                  activeLoans={activeLoansByBookId}
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
                  activeLoans={activeLoansByBookId}
                />

                <NetflixRow
                  title="B.Tech & BCA • Core Engineering & Computer Science"
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
                  activeLoans={activeLoansByBookId}
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
                  activeLoans={activeLoansByBookId}
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
                  activeLoans={activeLoansByBookId}
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
                  activeLoans={activeLoansByBookId}
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
                  activeLoans={activeLoansByBookId}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STUDENT PROFILE & SHELF */}
        {currentView === 'profile' && (
          <main className="view-content-main">
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--sunstone-text-secondary)', gap: '10px' }}>
                <Loader2 size={24} className="animate-spin" />
                <span>Loading Student Profile...</span>
              </div>
            }>
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
            </Suspense>
          </main>
        )}

        {/* VIEW 3: SECRET ADMIN CONSOLE */}
        {currentView === 'admin' && (
          <main className="view-content-main">
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--sunstone-text-secondary)', gap: '10px' }}>
                <Loader2 size={24} className="animate-spin" />
                <span>Loading Admin Console...</span>
              </div>
            }>
              <AdminConsole
                user={user}
                onAdminLogin={(adminUser) => handleSetUser(adminUser)}
                allBooks={books}
                onUploadBook={handleUploadBook}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
                borrowRequests={borrowRequests}
                onUpdateBorrowStatus={handleUpdateBorrowStatus}
                onDeleteBorrowRequest={handleDeleteBorrowRequest}
                students={students}
                onToggleStudentStatus={handleToggleStudentStatus}
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                adminEmails={adminEmails}
                onGrantAdminRole={handleGrantAdminRole}
                onToggleUserRole={handleToggleUserRole}
              />
            </Suspense>
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
          adminEmails={adminEmails}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(usr) => {
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

      <Suspense fallback={null}>
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
            activeLoan={activeLoansByBookId[selectedQuickSummaryBook.id]}
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
            activeLoan={activeLoansByBookId[activeSnippetBook.id]}
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
      </Suspense>

      {activeBorrowBook && (
        <BorrowModal
          book={activeBorrowBook}
          user={user}
          onClose={() => setActiveBorrowBook(null)}
          onSubmitBorrowRequest={handleSubmitBorrowRequest}
          activeLoan={activeLoansByBookId[activeBorrowBook.id]}
        />
      )}

    </div>
  );
}
