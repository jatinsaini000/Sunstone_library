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
  RotateCcw
} from 'lucide-react';
import { convertGoogleDriveUrl, convertGoogleDriveImageUrl, PRAYAS_DRIVE_FOLDER_URL } from '../googleDriveHelper.js';

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
  onDeleteStudent
}) {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const [messagesFilter, setMessagesFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Returned', 'Rejected'
  const [catalogSearch, setCatalogSearch] = useState('');

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

  // Edit Book Modal State
  const [editingBook, setEditingBook] = useState(null);

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState('B.Tech & BCA');
  const [newStudentPassword, setNewStudentPassword] = useState('Sunstone2026!');

  const isAdminAuthenticated = user && user.role === 'admin';

  // Compute active loans by book ID (Status === 'Approved')
  const activeLoansByBookId = {};
  (borrowRequests || []).forEach((r) => {
    if (r && r.status === 'Approved') {
      activeLoansByBookId[r.bookId] = r;
    }
  });

  const handleAdminLoginFormSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          password: adminPassword
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user && data.user.role === 'admin') {
        onAdminLogin(data.user, data.token);
        setLoginError('');
        return;
      }

      setLoginError(data.error || 'Invalid administrative credentials. Access restricted to authorized library coordinators.');
    } catch (err) {
      setLoginError('Unable to reach the server. Please check your connection and try again.');
    }
  };

  const handleCreateBookSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert('Please provide book title and author name.');
      return;
    }

    const finalUploadedPdfUrl = convertGoogleDriveUrl(pdfUrl);

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

    if (uploadMode === 'file' && pdfFile) {
      formData.append('pdfFile', pdfFile);
    } else {
      formData.append('pdfUrl', finalUploadedPdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
    }

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
      alert('Please enter student name and email.');
      return;
    }

    if (onAddStudent) {
      await onAddStudent({
        id: 'usr_' + Date.now(),
        name: newStudentName.trim(),
        email: newStudentEmail.trim().toLowerCase(),
        program: newStudentProgram,
        password: newStudentPassword,
        role: 'student',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    }

    setNewStudentName('');
    setNewStudentEmail('');
    setShowAddStudentModal(false);
  };

  // If Admin is NOT logged in, show Admin Security Card
  if (!isAdminAuthenticated) {
    return (
      <div style={{
        background: 'var(--sunstone-card-bg)',
        border: '1px solid var(--sunstone-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        maxWidth: '440px',
        margin: '60px auto',
        padding: '36px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.1)',
          color: 'var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <ShieldCheck size={32} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: 'var(--sunstone-text-primary)' }}>
          Prayas Lab Admin Console
        </h2>
        <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
          Official Sunstone Admin Portal. Authenticate to manage books, student loans, and permissions.
        </p>

        {loginError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleAdminLoginFormSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Admin Email / ID</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@sunstone.in"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px', background: 'var(--sunstone-navy-dark)' }}>
            <Lock size={16} /> Authenticate Admin
          </button>
        </form>
      </div>
    );
  }

  const pendingRequestsCount = borrowRequests.filter((r) => r.status === 'Pending').length;
  const activeLoansCount = Object.keys(activeLoansByBookId).length;

  const filteredBorrowRequests = borrowRequests.filter((req) => {
    if (messagesFilter === 'All') return true;
    return req.status === messagesFilter;
  });

  const filteredCatalog = allBooks.filter((b) => {
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.program.toLowerCase().includes(q);
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
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--sunstone-navy-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>Prayas Lab Admin Portal</h2>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px' }}>Full Management: Books, 1-Borrower Loan Controls, Students & Inventory</p>
          </div>
        </div>

        <span className="status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Admin Session Active
        </span>
      </div>

      {/* Stats Counter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255, 77, 90, 0.1)', color: 'var(--accent-sunstone-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{allBooks.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Total Books</div>
          </div>
        </div>

        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Registered Students</div>
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
          onClick={() => setActiveTab('students')}
          style={{
            padding: '10px 18px',
            borderRadius: '30px',
            border: activeTab === 'students' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'students' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'students' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <Users size={16} /> Student Access ({students.length})
        </button>
      </div>

      {/* TAB 1: BORROW MESSAGES & ACTIVE LOANS (ENFORCES 1-BORROWER RULE) */}
      {activeTab === 'messages' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Borrow Requests & Active Loans
              </h3>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                Only one student can borrow a book at a time. Active loans lock the book until marked as Returned.
              </p>
            </div>

            {/* Sub-Filters */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'Approved', 'Returned', 'Rejected'].map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setMessagesFilter(statusKey)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid var(--sunstone-border)',
                    background: messagesFilter === statusKey ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-bg)',
                    color: messagesFilter === statusKey ? '#ffffff' : 'var(--sunstone-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {statusKey === 'Approved' ? 'Active Loans' : statusKey}
                </button>
              ))}
            </div>
          </div>

          {filteredBorrowRequests.length === 0 ? (
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>
              No borrow messages matching "{messagesFilter}".
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredBorrowRequests.map((req) => {
                const currentActiveLoan = activeLoansByBookId[req.bookId];
                const isConflict = currentActiveLoan && currentActiveLoan.id !== req.id && req.status === 'Pending';

                return (
                  <div key={req.id} style={{
                    background: 'var(--sunstone-bg)',
                    border: '1px solid var(--sunstone-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>{req.studentName}</h4>
                          <span className="status-badge active">{req.studentProgram}</span>
                          <span style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>({req.studentEmail})</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--accent-sunstone-red)', fontWeight: '700' }}>
                          Book: "{req.bookTitle}" • <span style={{ color: 'var(--sunstone-text-secondary)' }}>{req.borrowType}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-badge ${(req.status || 'Pending').toLowerCase()}`}>
                          {req.status === 'Approved' ? 'Active Loan' : (req.status || 'Pending')}
                        </span>
                        {onDeleteBorrowRequest && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this borrow request record?')) {
                                onDeleteBorrowRequest(req.id);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--sunstone-text-muted)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete Request Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderLeft: '4px solid var(--accent-blue)', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--accent-blue)' }}>Student Reason:</strong> "{req.studentMessage}"
                    </div>

                    {req.adminNote && (
                      <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', marginBottom: '12px' }}>
                        <strong>Admin Reply:</strong> {req.adminNote}
                      </div>
                    )}

                    {/* Single-Borrower Conflict Alert */}
                    {isConflict && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#dc2626'
                      }}>
                        <AlertTriangle size={16} />
                        <span>
                          <strong>1-Borrower Conflict:</strong> This textbook is currently on loan to <strong>{currentActiveLoan.studentName}</strong> ({currentActiveLoan.studentEmail}). The active loan must be marked as Returned before approving this student.
                        </span>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {req.status === 'Pending' && (
                        <>
                          <button
                            className="btn-primary"
                            disabled={Boolean(isConflict)}
                            style={{
                              padding: '6px 14px',
                              fontSize: '12px',
                              background: isConflict ? '#9ca3af' : '#10b981',
                              cursor: isConflict ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => {
                              if (isConflict) return;
                              const note = prompt('Optional Admin Reply message to student:', 'Approved! Access granted for Prayas Lab.');
                              if (note !== null) {
                                onUpdateBorrowStatus(req.id, 'Approved', note || 'Approved! Access granted.');
                              }
                            }}
                            title={isConflict ? 'Cannot approve: book is already loaned to another student' : 'Approve Request'}
                          >
                            <CheckCircle size={14} /> Approve Loan
                          </button>

                          <button
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                            onClick={() => {
                              const note = prompt('Reason for declining request:', 'Currently unavailable or reserved.');
                              if (note !== null) {
                                onUpdateBorrowStatus(req.id, 'Rejected', note || 'Declined');
                              }
                            }}
                          >
                            <XCircle size={14} /> Reject Request
                          </button>
                        </>
                      )}

                      {req.status === 'Approved' && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(16,185,129,0.1)', color: '#059669', borderColor: 'rgba(16,185,129,0.4)', fontWeight: '700' }}
                          onClick={() => onUpdateBorrowStatus(req.id, 'Returned', 'Book returned to Prayas Lab counter.')}
                        >
                          <RotateCcw size={14} /> Mark as Returned (Release Book)
                        </button>
                      )}

                      {req.status === 'Returned' && (
                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                          ✓ Book has been returned and is available in catalog.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD BOOK */}
      {activeTab === 'upload' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', color: 'var(--sunstone-text-primary)' }}>Upload & Publish New Book</h3>
          <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Add new academic textbooks, lab manuals, or journals. Upload PDF files directly or link files from your designated Google Drive repository folder.
          </p>

          {/* Google Drive Repository Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 77, 90, 0.08))',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HardDrive size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--sunstone-text-primary)', marginBottom: '3px' }}>
                  Official Sunstone Prayas Lab Google Drive Repository
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', margin: 0 }}>
                  Upload textbooks and cover images to your Google Drive folder, copy their share link, and paste below.
                </p>
              </div>
            </div>
            <a
              href={PRAYAS_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                background: '#2563eb',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink size={14} /> Open Drive Folder ↗
            </a>
          </div>

          {uploadSuccessMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#059669', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', fontWeight: '700' }}>
              ✓ {uploadSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateBookSubmit}>
            <div style={{ background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Choose Book Ingestion Mode:</label>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: 'var(--sunstone-text-primary)' }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="file"
                    checked={uploadMode === 'file'}
                    onChange={() => setUploadMode('file')}
                  />
                  <Upload size={16} color="var(--accent-sunstone-red)" /> Upload Local PDF File
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: 'var(--sunstone-text-primary)' }}>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="url"
                    checked={uploadMode === 'url'}
                    onChange={() => setUploadMode('url')}
                  />
                  <LinkIcon size={16} color="var(--accent-blue)" /> Google Drive / Web PDF Link
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Advanced Machine Learning for Engineers"
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
                  placeholder="e.g. Dr. A. Sharma"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Sunstone Program Alignment</label>
                <select
                  className="form-control"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                >
                  <option value="MBA">MBA</option>
                  <option value="B.Tech & BCA">B.Tech & BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="Special Collections">Special Collections</option>
                  <option value="Journals">Journals & Research</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Computer Science, Finance, Marketing"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div className="form-group">
                <label className="form-label">Select PDF Document (.pdf) *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Google Drive Share Link or Direct PDF URL *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://drive.google.com/file/d/.../view or https://example.com/book.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Cover Image URL (or Google Drive Image Link)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/... or Google Drive share link"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Book Description & Syllabus Context</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Explain the book context and why it's recommended..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--sunstone-navy-dark)' }}>
              <Plus size={18} /> Publish Book to Prayas Library
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MANAGE CATALOG (LIVE AVAILABILITY, EDIT, DELETE) */}
      {activeTab === 'catalog' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Manage Catalog & Availability ({allBooks.length})
              </h3>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                Track live loan availability, edit metadata, or remove books.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sunstone-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search catalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredCatalog.map((b) => {
              const activeLoan = activeLoansByBookId[b.id];

              return (
                <div key={b.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--sunstone-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--sunstone-border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                    <img
                      src={b.coverUrl}
                      alt={b.title}
                      style={{ width: '38px', height: '52px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--sunstone-text-primary)' }}>{b.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>
                        By {b.author} • <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>{b.program}</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Availability Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {activeLoan ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="status-badge rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                          <Clock size={11} /> On Loan to {activeLoan.studentName || 'Student'}
                        </span>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11px', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
                          onClick={() => onUpdateBorrowStatus(activeLoan.id, 'Returned', 'Book returned to Prayas Lab.')}
                          title="Mark loan as returned to release book"
                        >
                          <RotateCcw size={12} /> Return
                        </button>
                      </div>
                    ) : (
                      <span className="status-badge active" style={{ fontSize: '11px' }}>
                        ✓ Available
                      </span>
                    )}

                    {/* Edit Book Button */}
                    <button
                      type="button"
                      onClick={() => setEditingBook({ ...b })}
                      style={{
                        background: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        borderRadius: '6px',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}
                      title="Edit Book Details"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    {/* Delete Book Button */}
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

      {/* TAB 4: MANAGE STUDENT ACCESS & ROSTER */}
      {activeTab === 'students' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Student Roster & Access Controls ({students.length})
              </h3>
              <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                Manage student enrollment, suspend or activate accounts, and add new scholars.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddStudentModal(true)}
              style={{ fontSize: '12px', padding: '8px 14px', background: 'var(--sunstone-navy-dark)' }}
            >
              <UserPlus size={14} /> Add New Student
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sunstone-border)', textAlign: 'left', color: 'var(--sunstone-text-muted)' }}>
                  <th style={{ padding: '10px' }}>Student Name</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Program</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--sunstone-border)' }}>
                    <td style={{ padding: '10px', fontWeight: '700', color: 'var(--sunstone-text-primary)' }}>{st.name}</td>
                    <td style={{ padding: '10px', color: 'var(--sunstone-text-secondary)' }}>{st.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="status-badge active">{st.program}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`status-badge ${(st.status || 'Active').toLowerCase()}`}>
                        {st.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          className="btn-secondary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: st.status === 'Active' ? '#ef4444' : '#10b981',
                            borderColor: st.status === 'Active' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)',
                            background: st.status === 'Active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                            cursor: 'pointer',
                            borderRadius: '16px'
                          }}
                          onClick={() => onToggleStudentStatus(st.id, st.status === 'Active' ? 'Suspended' : 'Active')}
                        >
                          {st.status === 'Active' ? '🚫 Suspend' : '✓ Activate'}
                        </button>

                        {onDeleteStudent && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Remove student account for "${st.name}"?`)) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--sunstone-text-muted)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete Student"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* MODAL: ADD NEW STUDENT */}
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
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--sunstone-text-primary)', margin: 0 }}>
                Enroll New Student
              </h3>
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
                <label className="form-label">Student Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@sunstone.in"
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

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input
                  type="text"
                  className="form-control"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  required
                />
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
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
