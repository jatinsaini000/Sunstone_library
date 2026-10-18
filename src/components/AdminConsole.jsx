import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Upload,
  Link as LinkIcon,
  Plus,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  BookOpen,
  Trash2,
  HardDrive,
  ExternalLink,
  Edit3,
  Clock,
  AlertTriangle,
  Search,
  UserPlus,
  X,
  RotateCcw,
  Loader2,
  UserCheck,
  UserX,
  Key,
  Mail,
  ShieldAlert,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { convertGoogleDriveUrl, convertGoogleDriveImageUrl, PRAYAS_DRIVE_FOLDER_URL } from '../googleDriveHelper.js';
import { signInWithGooglePopup, syncGoogleUser, uploadBookPdfToStorage } from '../firebase.js';

export default function AdminConsole({
  user,
  onAdminLogin,
  allBooks = [],
  onUploadBook,
  onEditBook,
  onDeleteBook,
  borrowRequests = [],
  onUpdateBorrowStatus,
  onDeleteBorrowRequest,
  students = [],
  onToggleStudentStatus,
  onAddStudent,
  onDeleteStudent,
  adminEmails = [],
  onGrantAdminRole,
  onToggleUserRole
}) {
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages', 'upload', 'catalog', 'users'
  const [messagesFilter, setMessagesFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Returned', 'Rejected'
  const [catalogSearch, setCatalogSearch] = useState('');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All'); // 'All', 'admin', 'student', 'with_loans'
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [grantSuccessMsg, setGrantSuccessMsg] = useState('');
  const [grantErrorMsg, setGrantErrorMsg] = useState('');
  const [selectedUserForBooks, setSelectedUserForBooks] = useState(null);

  // Book Upload Form State
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [program, setProgram] = useState('MBA');
  const [category, setCategory] = useState('Management');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [takeawaysText, setTakeawaysText] = useState('');
  const [chapterSnippetsText, setChapterSnippetsText] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit Book Modal State
  const [editingBook, setEditingBook] = useState(null);

  // Add User Modal State (Google Auth Compatible - No Password Needed)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState('B.Tech & BCA');

  const isAdminAuthenticated = user && user.role === 'admin';

  // Compute active loans by book ID (Status === 'Approved')
  const activeLoansByBookId = {};
  (borrowRequests || []).forEach((r) => {
    if (r && r.status === 'Approved') {
      activeLoansByBookId[r.bookId] = r;
    }
  });

  // Google Login Handler for Admin Console
  const handleAdminGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoggingIn(true);
    try {
      const res = await signInWithGooglePopup();
      if (!res.success) {
        if (res.code === 'auth/popup-closed-by-user') {
          setIsGoogleLoggingIn(false);
          return;
        }
        throw new Error(res.error || 'Google Sign-In failed.');
      }

      const cleanUser = await syncGoogleUser(res.user, adminEmails);
      onAdminLogin(cleanUser);

      if (cleanUser.role === 'admin') {
        setLoginError('');
      } else {
        setLoginError(`Signed in as ${cleanUser.email}. This account has a Student role. Ask an existing administrator to grant admin rights to your email.`);
      }
    } catch (err) {
      setLoginError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleGrantAdminSubmit = async (e) => {
    e.preventDefault();
    if (!newAdminEmailInput.trim()) return;
    const targetEmail = newAdminEmailInput.trim().toLowerCase();
    setGrantErrorMsg('');
    setGrantSuccessMsg('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(targetEmail)) {
      setGrantErrorMsg('Invalid email address format. Please enter a valid institutional/Google email.');
      return;
    }

    try {
      if (onGrantAdminRole) {
        await onGrantAdminRole(targetEmail, 'admin');
        setGrantSuccessMsg(`Admin access successfully granted to ${targetEmail}! They can now sign in with Google.`);
        setNewAdminEmailInput('');
        setTimeout(() => setGrantSuccessMsg(''), 5000);
      }
    } catch (err) {
      setGrantErrorMsg(err.message || 'Failed to grant admin access.');
    }
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Invalid file type: Only PDF documents (.pdf) can be uploaded.');
      e.target.value = '';
      setPdfFile(null);
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 30 MB.`);
      e.target.value = '';
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  };

  const handleCreateBookSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!title.trim() || !author.trim()) {
      setUploadError('Please provide book title and author name.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(1);

    try {
      let finalPdfUrl = '';
      if (uploadMode === 'file') {
        if (!pdfFile) {
          throw new Error('Please select a PDF file from your device.');
        }
        if (pdfFile.size > 30 * 1024 * 1024) {
          throw new Error('File exceeds the 30 MB size limit.');
        }
        finalPdfUrl = await uploadBookPdfToStorage(pdfFile, (p) => setUploadProgress(p));
      } else {
        finalPdfUrl = convertGoogleDriveUrl(pdfUrl) || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      formData.append('program', program);
      formData.append('category', category);
      formData.append('fileType', uploadMode);
      formData.append('description', description);
      formData.append('highlights', highlightsText);
      formData.append('keyTakeaways', takeawaysText);
      formData.append('chapterSnippets', chapterSnippetsText);
      formData.append('downloadable', 'true');
      formData.append('pdfUrl', finalPdfUrl);

      if (coverUrl) {
        formData.append('coverUrl', convertGoogleDriveImageUrl(coverUrl));
      }

      await onUploadBook(formData);

      setUploadSuccessMsg(`Book "${title}" published successfully to Sunstone Library!`);
      setTitle('');
      setAuthor('');
      setPdfFile(null);
      setPdfUrl('');
      setCoverUrl('');
      setDescription('');
      setHighlightsText('');
      setTakeawaysText('');
      setChapterSnippetsText('');
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Book publish error:', err);
      setUploadError(err.message || 'Failed to upload and publish book.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveEditedBook = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    if (onEditBook) {
      await onEditBook(editingBook.id, {
        title: editingBook.title,
        author: editingBook.author,
        program: editingBook.program,
        category: editingBook.category,
        description: editingBook.description,
        pdfUrl: convertGoogleDriveUrl(editingBook.pdfUrl),
        coverUrl: convertGoogleDriveImageUrl(editingBook.coverUrl)
      });
    }
    setEditingBook(null);
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) {
      alert('Please enter user name and email.');
      return;
    }

    const cleanEmail = newStudentEmail.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      alert('Invalid email address format.');
      return;
    }

    if (onAddStudent) {
      await onAddStudent({
        id: 'usr_' + Date.now(),
        name: newStudentName.trim(),
        displayName: newStudentName.trim(),
        email: cleanEmail,
        program: newStudentProgram,
        role: 'student',
        status: 'Active',
        authProvider: 'google',
        createdAt: new Date().toISOString()
      });
    }

    setNewStudentName('');
    setNewStudentEmail('');
    setShowAddStudentModal(false);
  };

  // If Admin is NOT logged in, show Google Sign-In Gatekeeper
  if (!isAdminAuthenticated) {
    return (
      <div style={{
        background: 'var(--sunstone-card-bg)',
        border: '1px solid var(--sunstone-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        maxWidth: '460px',
        margin: '60px auto',
        padding: '36px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--accent-sunstone-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <ShieldCheck size={36} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'var(--sunstone-text-primary)' }}>
          Prayas Lab Admin Console
        </h2>

        {user ? (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', margin: '0 0 12px' }}>
              Signed in as <strong>{user.email}</strong> ({user.name}).
            </p>
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '12px',
              color: '#dc2626',
              lineHeight: '1.5',
              textAlign: 'left'
            }}>
              <strong>Access Restricted:</strong> This Google account does not currently have Administrator privileges. Access is restricted to authorized coordinators.
              <br /><br />
              Ask an existing admin to grant admin access to <strong>{user.email}</strong> from the Admin Console, or switch to an authorized Google account below.
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
            Official Sunstone Admin Portal. All passwords are removed — sign in with your authorized Google account to manage the catalog, loans, users, and admin access.
          </p>
        )}

        {loginError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', textAlign: 'left' }}>
            {loginError}
          </div>
        )}

        <button
          type="button"
          onClick={handleAdminGoogleLogin}
          disabled={isGoogleLoggingIn}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px',
            fontSize: '14px',
            fontWeight: '700',
            background: 'var(--sunstone-navy-dark)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          }}
        >
          {isGoogleLoggingIn ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.03 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          )}
          <span>{isGoogleLoggingIn ? 'Connecting with Google...' : (user ? 'Switch Google Account' : 'Sign In with Google (Admin Portal)')}</span>
        </button>
      </div>
    );
  }

  const pendingRequestsCount = borrowRequests.filter((r) => r.status === 'Pending').length;
  const activeLoansCount = Object.keys(activeLoansByBookId).length;
  const adminUsersCount = students.filter(s => s.role === 'admin').length;

  const filteredBorrowRequests = borrowRequests.filter((req) => {
    if (messagesFilter === 'All') return true;
    return req.status === messagesFilter;
  });

  const filteredCatalog = allBooks.filter((b) => {
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.program.toLowerCase().includes(q);
  });

  // Filter users
  const filteredUsers = students.filter((u) => {
    // Role filter
    if (userRoleFilter === 'admin' && u.role !== 'admin') return false;
    if (userRoleFilter === 'student' && u.role === 'admin') return false;
    if (userRoleFilter === 'with_loans') {
      const userHasLoans = (borrowRequests || []).some(
        r => r.status === 'Approved' && (r.studentId === u.id || (u.email && r.studentEmail && r.studentEmail.toLowerCase() === u.email.toLowerCase()))
      );
      if (!userHasLoans) return false;
    }

    // Search query
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.program && u.program.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Header Card */}
      <div style={{
        background: 'var(--sunstone-card-bg)',
        border: '1px solid var(--sunstone-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--accent-sunstone-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--sunstone-text-primary)' }}>
                Prayas Admin Console
              </h2>
              <span className="status-badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-sunstone-red)', fontWeight: '800' }}>
                ADMIN PORTAL
              </span>
            </div>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
              Logged in as: <strong>{user?.name || user?.email}</strong> ({user?.email}) • Google Authentication
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={PRAYAS_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HardDrive size={15} /> Open Prayas Drive Folder <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Admin Quick Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{activeLoansCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Active Loans (On Loan)</div>
          </div>
        </div>

        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{pendingRequestsCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Pending Requests</div>
          </div>
        </div>

        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{students.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Total Users & Scholars</div>
          </div>
        </div>

        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-sunstone-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{adminUsersCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Authorized Admins</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div
        className="admin-tabs-scroller"
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '10px 18px',
            borderRadius: '30px',
            border: activeTab === 'messages' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'messages' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'messages' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <MessageSquare size={16} /> Borrow Messages & Loans ({borrowRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 18px',
            borderRadius: '30px',
            border: activeTab === 'upload' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'upload' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'upload' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <Plus size={16} /> Upload Book
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 18px',
            borderRadius: '30px',
            border: activeTab === 'catalog' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'catalog' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'catalog' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <BookOpen size={16} /> Manage Catalog ({allBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 18px',
            borderRadius: '30px',
            border: activeTab === 'users' ? '2px solid var(--accent-sunstone-red)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'users' ? 'var(--accent-sunstone-red)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'users' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <Users size={16} /> Users & Books ({students.length})
        </button>
      </div>

      {/* TAB 1: BORROW MESSAGES & ACTIVE LOANS (ENFORCES 1-BORROWER RULE) */}
      {activeTab === 'messages' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Borrow Requests & Active Loans ({filteredBorrowRequests.length})
              </h3>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                Rule: Each book can only be on loan to <strong>one reader at a time</strong>. Approving a request locks the book until returned.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'Approved', 'Returned', 'Rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setMessagesFilter(filter)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: messagesFilter === filter ? '1px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
                    background: messagesFilter === filter ? 'var(--sunstone-navy-dark)' : 'transparent',
                    color: messagesFilter === filter ? '#ffffff' : 'var(--sunstone-text-secondary)'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredBorrowRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--sunstone-text-muted)' }}>
              <CheckCircle size={36} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: '700', fontSize: '15px' }}>No messages match this filter</div>
              <p style={{ fontSize: '13px', margin: '4px 0 0' }}>All borrower statuses are up to date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredBorrowRequests.map((req) => {
                const currentHolder = activeLoansByBookId[req.bookId];
                const isBookAlreadyOnLoan = currentHolder && currentHolder.id !== req.id;

                return (
                  <div
                    key={req.id}
                    style={{
                      background: 'var(--sunstone-hover-bg)',
                      border: '1px solid var(--sunstone-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--sunstone-text-primary)' }}>
                            {req.studentName}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>
                            ({req.studentEmail})
                          </span>
                          <span className={`status-badge ${req.status ? req.status.toLowerCase() : 'pending'}`}>
                            {req.status || 'Pending'}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--sunstone-text-secondary)', marginTop: '4px' }}>
                          Requested Book: <strong>{req.bookTitle}</strong> by {req.bookAuthor}
                        </div>
                        {req.requestDate && (
                          <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', marginTop: '2px' }}>
                            Submitted: {new Date(req.requestDate).toLocaleDateString()} at {new Date(req.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {req.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (isBookAlreadyOnLoan) {
                                  alert(`Cannot approve: "${req.bookTitle}" is currently on loan to ${currentHolder.studentName}. Book must be returned first.`);
                                  return;
                                }
                                onUpdateBorrowStatus(req.id, 'Approved', 'Approved by Library Coordinator. Please collect textbook from Prayas Lab.');
                              }}
                              disabled={isBookAlreadyOnLoan}
                              className="btn-primary"
                              style={{
                                fontSize: '12px',
                                padding: '6px 14px',
                                background: isBookAlreadyOnLoan ? '#94a3b8' : 'var(--accent-green)',
                                cursor: isBookAlreadyOnLoan ? 'not-allowed' : 'pointer'
                              }}
                              title={isBookAlreadyOnLoan ? `Currently on loan to ${currentHolder.studentName}` : 'Approve loan'}
                            >
                              <CheckCircle size={14} /> Approve Loan
                            </button>

                            <button
                              type="button"
                              onClick={() => onUpdateBorrowStatus(req.id, 'Rejected', 'Book unavailable or physical copy currently undergoing maintenance.')}
                              className="btn-secondary"
                              style={{ fontSize: '12px', padding: '6px 14px', color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}

                        {req.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={() => onUpdateBorrowStatus(req.id, 'Returned', 'Book returned to Prayas Lab shelf and inspected.')}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 14px', color: '#2563eb', borderColor: 'rgba(37,99,235,0.3)' }}
                          >
                            <RotateCcw size={14} /> Mark as Returned
                          </button>
                        )}

                        {onDeleteBorrowRequest && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this borrow message record?')) {
                                onDeleteBorrowRequest(req.id);
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--sunstone-text-muted)', cursor: 'pointer', padding: '6px' }}
                            title="Delete message"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {isBookAlreadyOnLoan && req.status === 'Pending' && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <AlertTriangle size={14} />
                        <strong>Single-Borrower Lock:</strong> This book is currently holding by <strong>{currentHolder.studentName}</strong> ({currentHolder.studentEmail}). This request cannot be approved until they return it.
                      </div>
                    )}

                    {req.adminNote && (
                      <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', background: 'var(--sunstone-card-bg)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid var(--accent-blue)' }}>
                        <strong>Coordinator Note:</strong> {req.adminNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD BOOK FORM */}
      {activeTab === 'upload' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', marginBottom: '8px' }}>
            Publish Book to Sunstone Library
          </h3>
          <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Upload textbooks, research notes, or reference manuals for scholars. Files are instantly shared with students.
          </p>

          {uploadSuccessMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} /> {uploadSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Marketing Management: A Strategic Decision-Making Approach"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Philip Kotler & Kevin Lane Keller"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Program *</label>
                <select
                  className="form-control"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                >
                  <option value="MBA">MBA</option>
                  <option value="B.Tech & BCA">B.Tech & BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="Special Collections">Special Collections</option>
                  <option value="Journals">Journals</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Marketing, Data Structures, Finance"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            {/* Document Source Toggle */}
            <div className="form-group">
              <label className="form-label">Textbook Document Source</label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: uploadMode === 'file' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
                    background: uploadMode === 'file' ? 'var(--sunstone-hover-bg)' : 'transparent',
                    color: 'var(--sunstone-text-primary)',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Upload Local PDF File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: uploadMode === 'url' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
                    background: uploadMode === 'url' ? 'var(--sunstone-hover-bg)' : 'transparent',
                    color: 'var(--sunstone-text-primary)',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Google Drive / Direct URL
                </button>
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="form-control"
                    onChange={handlePdfFileChange}
                    disabled={isUploading}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', marginTop: '4px' }}>
                    Accepted format: PDF only. Maximum file size: 30 MB. Cloud-hosted on Firebase Storage.
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  className="form-control"
                  placeholder="Paste Google Drive shareable link or raw PDF URL"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  disabled={isUploading}
                />
              )}
            </div>

            {uploadError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                {uploadError}
              </div>
            )}

            {isUploading && (
              <div style={{ background: 'var(--sunstone-hover-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--sunstone-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Uploading to Firebase Cloud Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--sunstone-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.2s ease' }} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Cover Image URL (Optional - Google Drive or Web Image)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://drive.google.com/file/d/.../view or image URL"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Description & Overview</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Brief summary of syllabus coverage, core competencies, and textbook audience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isUploading}
              style={{
                padding: '12px 24px',
                alignSelf: 'flex-start',
                background: 'var(--sunstone-navy-dark)',
                cursor: isUploading ? 'wait' : 'pointer',
                opacity: isUploading ? 0.7 : 1
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading PDF ({uploadProgress}%)...
                </>
              ) : (
                <>
                  <Upload size={16} /> Publish to Sunstone Library
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MANAGE CATALOG */}
      {activeTab === 'catalog' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Manage Catalog Books ({filteredCatalog.length})
              </h3>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                Search, update details, edit links, or remove books from the library.
              </p>
            </div>

            <div style={{ width: '280px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search catalog by title, author..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredCatalog.map((b) => {
              const activeLoan = activeLoansByBookId[b.id];
              return (
                <div
                  key={b.id}
                  style={{
                    background: 'var(--sunstone-hover-bg)',
                    border: '1px solid var(--sunstone-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '54px',
                      borderRadius: '4px',
                      background: 'var(--sunstone-card-bg)',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img
                        src={b.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&auto=format&fit=crop&q=80'}
                        alt={b.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)' }}>
                        {b.author} • <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>{b.program}</span>
                      </div>
                      {activeLoan ? (
                        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', marginTop: '2px' }}>
                          ● Currently on loan to: {activeLoan.studentName}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', marginTop: '2px' }}>
                          ● Available in Prayas Lab
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingBook(b)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${b.title}" from the Sunstone catalog?`)) {
                          onDeleteBook(b.id);
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                      title="Delete Book"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & BOOKS + ADMIN PRIVILEGE MANAGEMENT */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SECTION A: GRANT ADMIN ACCESS BY EMAIL */}
          <div style={{
            background: 'var(--sunstone-card-bg)',
            border: '1.5px solid var(--sunstone-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--accent-sunstone-red)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                    Grant Admin Access to Any Email
                  </h3>
                </div>
                <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', margin: '6px 0 0', maxWidth: '680px' }}>
                  Authorize any Google account email. When that person signs in with Google, they automatically receive full Admin Console privileges on this website.
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddStudentModal(true)}
                style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={14} /> Pre-Enroll Scholar / Student
              </button>
            </div>

            {grantSuccessMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} /> {grantSuccessMsg}
              </div>
            )}

            {grantErrorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={15} /> {grantErrorMsg}
              </div>
            )}

            <form onSubmit={handleGrantAdminSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ flex: '1 1 320px', position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sunstone-text-muted)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px', fontSize: '14px' }}
                  placeholder="Enter email address (e.g. colleague@sunstone.in or user@gmail.com)"
                  value={newAdminEmailInput}
                  onChange={(e) => setNewAdminEmailInput(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  background: 'var(--accent-sunstone-red)',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={16} /> Grant Admin Privileges
              </button>
            </form>

            {/* List of currently authorized Admin Emails */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--sunstone-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Currently Authorized Admin Accounts ({adminEmails.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {adminEmails.map((email) => {
                  const isCurrentLoggedUser = user && user.email && user.email.toLowerCase() === email.toLowerCase();
                  return (
                    <div
                      key={email}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--sunstone-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ShieldCheck size={13} color="var(--accent-sunstone-red)" />
                      <span>{email}</span>
                      {isCurrentLoggedUser && (
                        <span style={{ fontSize: '10px', background: 'var(--accent-sunstone-red)', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>
                          You
                        </span>
                      )}
                      {!isCurrentLoggedUser && email !== 'sunrbu@admin.login' && onGrantAdminRole && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Revoke admin privileges for "${email}"?`)) {
                              onGrantAdminRole(email, 'student');
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--sunstone-text-muted)',
                            cursor: 'pointer',
                            padding: '0 2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Revoke admin access"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION B: ALL REGISTERED USERS & THEIR BOOKS */}
          <div style={{
            background: 'var(--sunstone-card-bg)',
            border: '1px solid var(--sunstone-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                  Registered Users & Borrowed Books ({filteredUsers.length})
                </h3>
                <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                  Inspect every scholar's book loans, promote/demote administrators, and manage accounts.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Filter by role */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'All', label: 'All Users' },
                    { id: 'admin', label: 'Admins' },
                    { id: 'student', label: 'Students' },
                    { id: 'with_loans', label: 'Holding Books' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setUserRoleFilter(f.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: userRoleFilter === f.id ? '1px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
                        background: userRoleFilter === f.id ? 'var(--sunstone-navy-dark)' : 'transparent',
                        color: userRoleFilter === f.id ? '#ffffff' : 'var(--sunstone-text-secondary)'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ fontSize: '12px', padding: '7px 10px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sunstone-border)', textAlign: 'left', color: 'var(--sunstone-text-muted)' }}>
                    <th style={{ padding: '12px 10px' }}>User Details</th>
                    <th style={{ padding: '12px 10px' }}>Role</th>
                    <th style={{ padding: '12px 10px' }}>Program</th>
                    <th style={{ padding: '12px 10px' }}>Borrowed Books</th>
                    <th style={{ padding: '12px 10px' }}>Status</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--sunstone-text-muted)' }}>
                        No users match this filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      // Compute books for this user
                      const userReqs = (borrowRequests || []).filter(
                        (r) => r && (
                          (u.id && r.studentId === u.id) ||
                          (u.uid && r.studentId === u.uid) ||
                          (u.email && r.studentEmail && r.studentEmail.toLowerCase() === u.email.toLowerCase())
                        )
                      );
                      const userActiveLoans = userReqs.filter((r) => r.status === 'Approved');
                      const userPendingReqs = userReqs.filter((r) => r.status === 'Pending');
                      const isUserAdmin = u.role === 'admin';
                      const isSelf = user && (user.id === u.id || user.uid === u.uid || user.email === u.email);
                      const userDisplayName = u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'User');
                      const userAvatar = u.photoUrl || u.photoURL;

                      return (
                        <tr key={u.uid || u.id} style={{ borderBottom: '1px solid var(--sunstone-border)' }}>
                          {/* User Column */}
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {userAvatar ? (
                                <img
                                  src={userAvatar}
                                  alt={userDisplayName}
                                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  background: isUserAdmin ? 'var(--accent-sunstone-red)' : 'var(--accent-blue)',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '800',
                                  fontSize: '13px'
                                }}>
                                  {userDisplayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: '700', color: 'var(--sunstone-text-primary)' }}>
                                  {userDisplayName} {isSelf && <span style={{ fontSize: '11px', color: 'var(--accent-blue)' }}>(You)</span>}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)' }}>
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td style={{ padding: '12px 10px' }}>
                            {isUserAdmin ? (
                              <span style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--accent-sunstone-red)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <ShieldCheck size={12} /> Admin
                              </span>
                            ) : (
                              <span style={{
                                background: 'rgba(37, 99, 235, 0.08)',
                                color: 'var(--accent-blue)',
                                border: '1px solid rgba(37, 99, 235, 0.25)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <UserIcon size={12} /> Student
                              </span>
                            )}
                          </td>

                          {/* Program Column */}
                          <td style={{ padding: '12px 10px', color: 'var(--sunstone-text-secondary)', fontSize: '12px' }}>
                            {u.program || 'General Scholar'}
                          </td>

                          {/* Borrowed Books Column */}
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedUserForBooks(u)}
                                style={{
                                  background: userActiveLoans.length > 0 ? 'rgba(245, 158, 11, 0.1)' : 'var(--sunstone-hover-bg)',
                                  border: userActiveLoans.length > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--sunstone-border)',
                                  color: userActiveLoans.length > 0 ? '#b45309' : 'var(--sunstone-text-primary)',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                                title="Click to view all books for this scholar"
                              >
                                <BookOpen size={13} />
                                <span>{userActiveLoans.length} on loan ({userReqs.length} total)</span>
                              </button>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td style={{ padding: '12px 10px' }}>
                            <span className={`status-badge ${(u.status || 'Active').toLowerCase()}`}>
                              {u.status || 'Active'}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              {/* Role Promotion / Demotion */}
                              {!isSelf && onToggleUserRole && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextRole = isUserAdmin ? 'student' : 'admin';
                                    const msg = isUserAdmin
                                      ? `Revoke Admin access from "${u.name}" (${u.email})?`
                                      : `Promote "${u.name}" (${u.email}) to Administrator? They will have full console access.`;
                                    if (window.confirm(msg)) {
                                      onToggleUserRole(u.id, nextRole);
                                    }
                                  }}
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    border: isUserAdmin ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(37,99,235,0.3)',
                                    background: isUserAdmin ? 'rgba(239,68,68,0.08)' : 'rgba(37,99,235,0.08)',
                                    color: isUserAdmin ? '#dc2626' : '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={isUserAdmin ? 'Demote to Student' : 'Promote to Admin'}
                                >
                                  {isUserAdmin ? (
                                    <>Revoke Admin</>
                                  ) : (
                                    <><ShieldCheck size={12} /> Make Admin</>
                                  )}
                                </button>
                              )}

                              {/* Status Toggle */}
                              {!isSelf && onToggleStudentStatus && (
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: u.status === 'Active' ? '#ef4444' : '#10b981',
                                    borderColor: u.status === 'Active' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)',
                                    background: u.status === 'Active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                                    cursor: 'pointer',
                                    borderRadius: '16px'
                                  }}
                                  onClick={() => onToggleStudentStatus(u.id, u.status === 'Active' ? 'Suspended' : 'Active')}
                                  title={u.status === 'Active' ? 'Suspend account' : 'Activate account'}
                                >
                                  {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                </button>
                              )}

                              {/* Delete User */}
                              {!isSelf && onDeleteStudent && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Permanently remove account for "${u.name}" (${u.email})?`)) {
                                      onDeleteStudent(u.id);
                                    }
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--sunstone-text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                  title="Delete User"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW USER'S BOOKS */}
      {selectedUserForBooks && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--sunstone-card-bg)',
            border: '1px solid var(--sunstone-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--sunstone-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                  Books for {selectedUserForBooks.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', marginTop: '2px' }}>
                  {selectedUserForBooks.email} • {selectedUserForBooks.program}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForBooks(null)}
                style={{ background: 'none', border: 'none', color: 'var(--sunstone-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const reqs = (borrowRequests || []).filter(
                  (r) => r && (
                    (selectedUserForBooks.id && r.studentId === selectedUserForBooks.id) ||
                    (selectedUserForBooks.email && r.studentEmail && r.studentEmail.toLowerCase() === selectedUserForBooks.email.toLowerCase())
                  )
                );

                if (reqs.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--sunstone-text-muted)' }}>
                      <BookOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                      <div style={{ fontWeight: '700' }}>No borrow records found</div>
                      <p style={{ fontSize: '12px', margin: '4px 0 0' }}>This scholar has not requested or checked out any books yet.</p>
                    </div>
                  );
                }

                return reqs.map((r) => {
                  const matchedBook = allBooks.find((b) => b.id === r.bookId);

                  return (
                    <div
                      key={r.id}
                      style={{
                        background: 'var(--sunstone-hover-bg)',
                        border: '1px solid var(--sunstone-border)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '52px', borderRadius: '4px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                          <img
                            src={matchedBook?.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                            alt={r.bookTitle}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>
                            {r.bookTitle}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>
                            {r.bookAuthor}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--sunstone-text-secondary)', marginTop: '2px' }}>
                            Requested: {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`status-badge ${(r.status || 'pending').toLowerCase()}`}>
                          {r.status === 'Approved' ? 'On Loan' : r.status || 'Pending'}
                        </span>

                        {r.status === 'Approved' && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              onUpdateBorrowStatus(r.id, 'Returned', 'Book returned to Prayas Lab.');
                            }}
                            style={{ fontSize: '11px', padding: '4px 10px', color: '#2563eb' }}
                          >
                            Mark Returned
                          </button>
                        )}

                        {r.status === 'Pending' && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              onUpdateBorrowStatus(r.id, 'Approved', 'Approved by Library Coordinator.');
                            }}
                            style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--accent-green)' }}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedUserForBooks(null)}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BOOK DETAILS */}
      {editingBook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--sunstone-card-bg)',
            border: '1px solid var(--sunstone-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Edit Book: {editingBook.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                style={{ background: 'none', border: 'none', color: 'var(--sunstone-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBook}>
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Program</label>
                  <select
                    className="form-control"
                    value={editingBook.program}
                    onChange={(e) => setEditingBook({ ...editingBook, program: e.target.value })}
                  >
                    <option value="MBA">MBA</option>
                    <option value="B.Tech & BCA">B.Tech & BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="Special Collections">Special Collections</option>
                    <option value="Journals">Journals</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingBook.category || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PDF URL or Drive Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingBook.pdfUrl || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, pdfUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingBook.coverUrl || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, coverUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={editingBook.description || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', justifyContent: 'center', background: 'var(--sunstone-navy-dark)' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRE-ENROLL USER (GOOGLE AUTH COMPATIBLE - NO PASSWORD NEEDED) */}
      {showAddStudentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--sunstone-card-bg)',
            border: '1px solid var(--sunstone-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                  Pre-Enroll Scholar / Student
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', marginTop: '2px' }}>
                  Passwords are removed. User will log in with their Google account.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--sunstone-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Vikramaditya Rao"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Google Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@sunstone.in or scholar@gmail.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enrolled Program</label>
                <select
                  className="form-control"
                  value={newStudentProgram}
                  onChange={(e) => setNewStudentProgram(e.target.value)}
                >
                  <option value="B.Tech & BCA">B.Tech & BCA</option>
                  <option value="MBA">MBA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', justifyContent: 'center', background: 'var(--sunstone-navy-dark)' }}
                >
                  Enroll User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
