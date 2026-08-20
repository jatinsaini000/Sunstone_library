import React, { useState } from 'react';
import { ShieldCheck, Lock, Upload, Link as LinkIcon, Plus, CheckCircle, XCircle, MessageSquare, Users, BookOpen, Trash2, Search, Mail, Send, AlertTriangle, HardDrive } from 'lucide-react';
import { convertGoogleDriveUrl, convertGoogleDriveImageUrl } from '../googleDriveHelper.js';

export default function AdminConsole({
  user,
  onAdminLogin,
  allBooks = [],
  onUploadBook,
  onDeleteBook,
  borrowRequests = [],
  onUpdateBorrowStatus,
  students = [],
  onToggleStudentStatus
}) {
  const [adminEmail, setAdminEmail] = useState('admin@sunstone.in');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('messages');

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

  // Secure Admin Credentials from Environment with safe defaults
  const SECURE_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@sunstone.in').toLowerCase().trim();
  const SECURE_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'SunstoneAdmin2026!';

  const isAdminAuthenticated = user && user.role === 'admin';

  const handleAdminLoginFormSubmit = (e) => {
    e.preventDefault();
    if (adminEmail.trim().toLowerCase() === SECURE_ADMIN_EMAIL && adminPassword === SECURE_ADMIN_PASSWORD) {
      onAdminLogin({
        id: 'usr_admin',
        name: 'Prayas Lab Admin',
        email: SECURE_ADMIN_EMAIL,
        role: 'admin',
        program: 'All Programs'
      });
      setLoginError('');
    } else {
      setLoginError('Invalid administrative credentials. Access restricted to authorized library coordinators.');
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
          Official Sunstone Admin Portal. Authenticate to manage books, student messages, and permissions.
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

  const pendingRequestsCount = borrowRequests.filter(r => r.status === 'Pending').length;

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
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--sunstone-navy-dark)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>Prayas Lab Admin Portal</h2>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px' }}>Book Upload Curation, Student Borrow Messages & Access Roster</p>
          </div>
        </div>

        <span className="status-badge active">Admin Session Active</span>
      </div>

      {/* Stats Counter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 77, 90, 0.1)', color: 'var(--accent-sunstone-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{allBooks.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Total Books in Catalog</div>
          </div>
        </div>

        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{pendingRequestsCount}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Pending Borrow Messages</div>
          </div>
        </div>

        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{students.length}</div>
            <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>Registered Students</div>
          </div>
        </div>
      </div>

      {/* Sunstone Admin Navigation Pills */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'messages' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'messages' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'messages' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Borrow Messages ({pendingRequestsCount})
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'upload' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'upload' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'upload' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} /> Upload Book (File / URL)
        </button>

        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'students' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'students' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'students' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} /> Student Access ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 20px',
            borderRadius: '30px',
            border: activeTab === 'catalog' ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
            background: activeTab === 'catalog' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
            color: activeTab === 'catalog' ? '#ffffff' : 'var(--sunstone-text-primary)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} /> Manage Catalog ({allBooks.length})
        </button>
      </div>

      {/* TAB 1: BORROW MESSAGES INBOX */}
      {activeTab === 'messages' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--sunstone-text-primary)' }}>Student Borrowing Requests & Messages</h3>
          {borrowRequests.length === 0 ? (
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '14px' }}>No student borrowing messages received yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {borrowRequests.map((req) => (
                <div key={req.id} style={{ background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>{req.studentName}</h4>
                        <span className="status-badge active">{req.studentProgram}</span>
                        <span style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>({req.studentEmail})</span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--accent-sunstone-red)', fontWeight: '700' }}>
                        Book Requested: "{req.bookTitle}" ({req.borrowType})
                      </div>
                    </div>

                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </div>

                  <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderLeft: '4px solid var(--accent-blue)', padding: '14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>Student Message:</strong> "{req.studentMessage}"
                  </div>

                  {req.adminNote && (
                    <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', marginBottom: '12px' }}>
                      <strong>Your Reply:</strong> {req.adminNote}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {req.status === 'Pending' && (
                      <>
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '12px', background: '#10b981' }}
                          onClick={() => {
                            const note = prompt('Optional Admin Reply message to student:', 'Approved! Please collect your copy from Prayas Lab counter.');
                            onUpdateBorrowStatus(req.id, 'Approved', note || 'Approved');
                          }}
                        >
                          <CheckCircle size={14} /> Approve Request
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => {
                            const note = prompt('Reason for declining request:', 'Currently unavailable in lab stock.');
                            onUpdateBorrowStatus(req.id, 'Rejected', note || 'Declined');
                          }}
                        >
                          <XCircle size={14} /> Reject Request
                        </button>
                      </>
                    )}

                    {req.status === 'Approved' && (
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => onUpdateBorrowStatus(req.id, 'Returned', 'Book returned to lab.')}
                      >
                        Mark as Returned
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DAILY BOOK UPLOADER (FILE OR URL) */}
      {activeTab === 'upload' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', color: 'var(--sunstone-text-primary)' }}>Upload & Publish New Book Daily</h3>
          <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Add new academic textbooks, lab manuals, or journals. Choose between uploading a PDF file from your computer OR providing an external URL link.
          </p>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Sunstone Program Alignment</label>
                <select
                  className="form-control"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                >
                  <option value="MBA">MBA</option>
                  <option value="B.Tech CS">B.Tech CS</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="Special Collections">Special Collections</option>
                  <option value="Journals">Journals & Research</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category / Subject Tag</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Data Science, Finance, Marketing"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div className="form-group">
                <label className="form-label">Select PDF File from Device *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-control"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">📁 Google Drive Share Link OR Direct PDF Web URL *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Paste Google Drive link (e.g. https://drive.google.com/file/d/...) or any PDF URL"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                />
                <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', marginTop: '4px' }}>
                  💡 Tip: Set your Google Drive file permission to "Anyone with the link can view". It will automatically open in the PDF reader!
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Cover Image URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>

            <div style={{ background: 'var(--sunstone-bg)', border: '1px solid var(--sunstone-border)', padding: '18px', borderRadius: '12px', margin: '20px 0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '12px' }}>
                ⚡ Quick Summary & Key Takeaways (Helps students decide whether to read)
              </h4>

              <div className="form-group">
                <label className="form-label">Book Highlights (One bullet per line)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="• Covers neural networks and deep learning fundamentals&#10;• Includes Python PyTorch code samples&#10;• Mapped to semester lab exams"
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Learning Takeaways (One bullet per line)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="• Master CNN and RNN architectures&#10;• Deploy AI models to cloud endpoints"
                  value={takeawaysText}
                  onChange={(e) => setTakeawaysText(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">📖 Chapter-Wise Snippets / Summaries (Available for free preview without borrowing)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Chapter 1: Foundational Principles&#10;Detailed chapter summary and key formulas here...&#10;&#10;Chapter 2: Advanced Implementations&#10;Summary of chapter 2 methodologies and case studies..."
                  value={chapterSnippetsText}
                  onChange={(e) => setChapterSnippetsText(e.target.value)}
                />
                <div style={{ fontSize: '11px', color: 'var(--sunstone-text-muted)', marginTop: '4px' }}>
                  Students can read these chapter snippets for free. Full book PDF reading is restricted until borrowed.
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Book Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Detailed background summary of the book contents..."
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

      {/* TAB 3: MANAGE STUDENT ACCESS */}
      {activeTab === 'students' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--sunstone-text-primary)' }}>Student Roster & Access Controls</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sunstone-border)', textAlign: 'left', color: 'var(--sunstone-text-muted)' }}>
                  <th style={{ padding: '12px' }}>Student Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Program</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Access Control</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--sunstone-border)' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: 'var(--sunstone-text-primary)' }}>{st.name}</td>
                    <td style={{ padding: '12px', color: 'var(--sunstone-text-secondary)' }}>{st.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="status-badge active">{st.program}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge ${st.status.toLowerCase()}`}>
                        {st.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => onToggleStudentStatus(st.id, st.status === 'Active' ? 'Suspended' : 'Active')}
                      >
                        {st.status === 'Active' ? 'Suspend Access' : 'Activate Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATALOG MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div style={{ background: 'var(--sunstone-card-bg)', border: '1px solid var(--sunstone-border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--sunstone-text-primary)' }}>Uploaded Books Catalog ({allBooks.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allBooks.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--sunstone-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sunstone-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={b.coverUrl} alt={b.title} style={{ width: '40px', height: '54px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--sunstone-text-primary)' }}>{b.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--sunstone-text-muted)' }}>
                      By {b.author} • <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>{b.program}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteBook(b.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                  title="Delete Book"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
