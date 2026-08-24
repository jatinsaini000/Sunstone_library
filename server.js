import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sunstone_prayas_library_secure_jwt_secret_key_2026';
const SECURE_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@sunstone.in').toLowerCase().trim();
const SECURE_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SunstoneAdmin2026!';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
const pdfsDir = path.join(uploadsDir, 'books');
const coversDir = path.join(uploadsDir, 'covers');

[uploadsDir, pdfsDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsDir));

// --- Security: Rate Limiter Middleware ---
const rateLimitMap = new Map();
function rateLimiter({ windowMs = 60000, maxRequests = 60, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
    } else {
      entry.count++;
    }
    rateLimitMap.set(ip, entry);

    if (entry.count > maxRequests) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// --- Security: Multer Storage with MIME & Extension Whitelist ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdfFile') cb(null, pdfsDir);
    else if (file.fieldname === 'coverImage') cb(null, coversDir);
    else cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdfFile') {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      if (isPdf) return cb(null, true);
      return cb(new Error('Security error: Only valid PDF documents (.pdf) are allowed.'));
    } else if (file.fieldname === 'coverImage') {
      const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.mimetype.startsWith('image/') && allowedImageExts.includes(ext)) {
        return cb(null, true);
      }
      return cb(new Error('Security error: Only valid image files (JPG, PNG, WEBP) are allowed for book covers.'));
    }
    cb(null, true);
  }
});

// --- Security: Cryptographic Password Hashing & JWT Utilities ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  if (!salt || !storedHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch (e) {
    return false;
  }
}

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

function generateJwt(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const tokenPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired token
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// --- Security: Authentication & Authorization Middleware ---
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }
  const token = authHeader.split(' ')[1];
  const userPayload = verifyJwt(token);
  if (!userPayload) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
  req.user = userPayload;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden: Administrator privileges required.' });
    }
    next();
  });
}

// --- Database & Starter Data ---
const DATA_FILE = path.join(__dirname, 'data_store.json');

function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      console.error('Error reading data_store.json', e);
    }
  }
  return { users: [], books: [], borrowRequests: [], userNotes: [] };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving data_store.json', e);
  }
}

let db = loadData();

// --- Auth Routes ---

/** POST /api/auth/login - Secure login with password verification & JWT token issue */
app.post('/api/auth/login', rateLimiter({ windowMs: 60000, maxRequests: 20 }), (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  db = loadData();

  // Check Master Admin Account
  if (cleanEmail === SECURE_ADMIN_EMAIL && password === SECURE_ADMIN_PASSWORD) {
    const adminUser = {
      id: 'usr_admin',
      name: 'Prayas Lab Admin',
      email: SECURE_ADMIN_EMAIL,
      role: 'admin',
      program: 'All Programs',
      status: 'Active'
    };
    const token = generateJwt(adminUser);
    return res.json({ token, user: adminUser });
  }

  // Check Registered Users
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status !== 'Active') {
    return res.status(403).json({ error: 'Your account has been suspended by library administration.' });
  }

  // Verify Password Hash (or migrate legacy plaintext)
  let isPasswordValid = false;
  if (user.salt && user.passwordHash) {
    isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
  } else if (user.password) {
    // Legacy migration on first login
    if (user.password === password) {
      isPasswordValid = true;
      const { salt, hash } = hashPassword(password);
      user.salt = salt;
      user.passwordHash = hash;
      delete user.password;
      saveData(db);
    }
  }

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const safeUser = sanitizeUser(user);
  const token = generateJwt(safeUser);
  res.json({ token, user: safeUser });
});

/** POST /api/auth/register - Secure student registration with password hashing */
app.post('/api/auth/register', rateLimiter({ windowMs: 60000, maxRequests: 10 }), (req, res) => {
  const { name, email, password, program } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  db = loadData();

  if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const { salt, hash } = hashPassword(password);

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    email: cleanEmail,
    salt,
    passwordHash: hash,
    role: 'student',
    program: program || 'B.Tech CS',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveData(db);

  const safeUser = sanitizeUser(newUser);
  const token = generateJwt(safeUser);
  res.json({ token, user: safeUser });
});

/** GET /api/auth/me - Verify token and return active profile */
app.get('/api/auth/me', requireAuth, (req, res) => {
  db = loadData();
  if (req.user.role === 'admin') {
    return res.json({ user: req.user });
  }
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: sanitizeUser(user) });
});

// --- Catalog & Book Routes ---

/** GET /api/books - Public catalog browsing */
app.get('/api/books', (req, res) => {
  db = loadData();
  res.json(db.books);
});

/** POST /api/books - Protected: Upload and add book (Admin Only) */
app.post(
  '/api/books',
  requireAdmin,
  rateLimiter({ windowMs: 60000, maxRequests: 20 }),
  upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  (req, res) => {
    db = loadData();
    const {
      title, author, program, category, fileType, pdfUrl,
      downloadable, isbn, pages, publishedYear, highlights,
      keyTakeaways, chapterSnippets, description
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Book title and author name are required.' });
    }

    let finalPdfUrl = pdfUrl;
    let finalCoverUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

    if (fileType === 'file' && req.files && req.files.pdfFile && req.files.pdfFile[0]) {
      finalPdfUrl = '/uploads/books/' + req.files.pdfFile[0].filename;
    }

    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      finalCoverUrl = '/uploads/covers/' + req.files.coverImage[0].filename;
    } else if (req.body.coverUrl) {
      finalCoverUrl = req.body.coverUrl;
    }

    const parseArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return input.split('\n').map(s => s.trim()).filter(Boolean);
    };

    const parseSnippets = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      const blocks = input.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
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

    const newBook = {
      id: 'bk_' + Date.now(),
      title: title.trim(),
      author: author.trim(),
      program: program || 'All Programs',
      category: category || 'General Academic',
      coverUrl: finalCoverUrl,
      fileType: fileType || (finalPdfUrl?.startsWith('/uploads') ? 'file' : 'url'),
      pdfUrl: finalPdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      downloadable: downloadable === 'true' || downloadable === true,
      isbn: isbn || 'ISBN-' + Math.floor(100000000 + Math.random() * 900000000),
      rating: 4.8,
      pages: parseInt(pages) || 320,
      publishedYear: parseInt(publishedYear) || 2026,
      chapterSnippets: parseSnippets(chapterSnippets),
      quickSummary: {
        highlights: parseArray(highlights).length > 0 ? parseArray(highlights) : ['Comprehensive academic material mapped to Sunstone curriculum.'],
        keyTakeaways: parseArray(keyTakeaways).length > 0 ? parseArray(keyTakeaways) : ['Gain key theoretical and practical competencies.'],
        estimatedReadingTime: '6 Hours',
        difficultyLevel: 'Standard Academic'
      },
      description: description || 'Textbook curated for Sunstone scholars.'
    };

    db.books.unshift(newBook);
    saveData(db);
    res.json({ message: 'Book uploaded successfully', book: newBook });
  }
);

/** DELETE /api/books/:id - Protected: Delete book (Admin Only) */
app.delete('/api/books/:id', requireAdmin, (req, res) => {
  db = loadData();
  const bookId = req.params.id;
  const bookToDelete = db.books.find(b => b.id === bookId);

  if (!bookToDelete) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // Delete local uploaded file if exists
  if (bookToDelete.pdfUrl && bookToDelete.pdfUrl.startsWith('/uploads/books/')) {
    const localFilePath = path.join(__dirname, bookToDelete.pdfUrl);
    if (fs.existsSync(localFilePath)) {
      try { fs.unlinkSync(localFilePath); } catch (e) {}
    }
  }

  db.books = db.books.filter(b => b.id !== bookId);
  saveData(db);
  res.json({ message: 'Book deleted successfully.' });
});

// --- Borrow Requests Routes ---

/** GET /api/borrow-requests - Protected: Admins see all, students see their own */
app.get('/api/borrow-requests', requireAuth, (req, res) => {
  db = loadData();
  if (req.user.role === 'admin') {
    return res.json(db.borrowRequests || []);
  }
  // Students only see their own requests
  const myRequests = (db.borrowRequests || []).filter(r => r.studentId === req.user.id || r.studentEmail === req.user.email);
  res.json(myRequests);
});

/** POST /api/borrow-requests - Protected: Submit borrow request (Verified Student) */
app.post('/api/borrow-requests', requireAuth, (req, res) => {
  db = loadData();
  const { bookId, bookTitle, borrowType, studentMessage } = req.body;

  if (!bookId || !bookTitle) {
    return res.status(400).json({ error: 'Book details are required.' });
  }

  const newRequest = {
    id: 'req_' + Date.now(),
    studentId: req.user.id, // Enforce authenticated student identity
    studentName: req.user.name,
    studentEmail: req.user.email,
    studentProgram: req.user.program || 'General',
    bookId,
    bookTitle,
    requestDate: new Date().toISOString(),
    borrowType: borrowType || 'Physical Copy',
    studentMessage: (studentMessage || 'I would like to borrow this textbook.').trim(),
    status: 'Pending',
    adminNote: ''
  };

  db.borrowRequests = db.borrowRequests || [];
  db.borrowRequests.unshift(newRequest);
  saveData(db);
  res.json({ message: 'Borrow request submitted successfully.', request: newRequest });
});

/** PUT /api/borrow-requests/:id - Protected: Update borrow status / approve / reject (Admin Only) */
app.put('/api/borrow-requests/:id', requireAdmin, (req, res) => {
  db = loadData();
  const { status, adminNote } = req.body;
  const reqItem = (db.borrowRequests || []).find(r => r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Borrow request not found.' });
  }

  if (status) reqItem.status = status;
  if (adminNote !== undefined) reqItem.adminNote = adminNote;

  saveData(db);
  res.json({ message: 'Borrow request updated successfully.', request: reqItem });
});

// --- Students Management (Admin Only) ---

/** GET /api/students - Protected: List registered students */
app.get('/api/students', requireAdmin, (req, res) => {
  db = loadData();
  const students = (db.users || [])
    .filter(u => u.role === 'student')
    .map(sanitizeUser);
  res.json(students);
});

/** PUT /api/students/:id/status - Protected: Toggle student account status (Admin Only) */
app.put('/api/students/:id/status', requireAdmin, (req, res) => {
  db = loadData();
  const { status } = req.body;
  const student = (db.users || []).find(u => u.id === req.params.id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  student.status = status || 'Active';
  saveData(db);
  res.json({ message: 'Student status updated.', student: sanitizeUser(student) });
});

// --- Study Notes Routes ---

/** GET /api/notes - Protected: Get authenticated student notes */
app.get('/api/notes', requireAuth, (req, res) => {
  db = loadData();
  const myNotes = (db.userNotes || []).filter(n => n.studentId === req.user.id);
  res.json(myNotes);
});

/** POST /api/notes - Protected: Create personal study note */
app.post('/api/notes', requireAuth, (req, res) => {
  db = loadData();
  const { bookId, bookTitle, pageNumber, noteText } = req.body;

  if (!bookId || !noteText) {
    return res.status(400).json({ error: 'Book ID and note text are required.' });
  }

  const newNote = {
    id: 'note_' + Date.now(),
    studentId: req.user.id, // Enforce authenticated student ownership
    bookId,
    bookTitle: bookTitle || 'Academic Textbook',
    pageNumber: pageNumber || 1,
    noteText: noteText.trim(),
    createdAt: new Date().toISOString()
  };

  db.userNotes = db.userNotes || [];
  db.userNotes.unshift(newNote);
  saveData(db);
  res.json({ note: newNote });
});

/** DELETE /api/notes/:id - Protected: Delete personal study note */
app.delete('/api/notes/:id', requireAuth, (req, res) => {
  db = loadData();
  const noteId = req.params.id;
  const note = (db.userNotes || []).find(n => n.id === noteId);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Ensure note belongs to authenticated user or user is admin
  if (note.studentId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: You do not own this note.' });
  }

  db.userNotes = db.userNotes.filter(n => n.id !== noteId);
  saveData(db);
  res.json({ message: 'Note deleted successfully.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Sunstone Prayas Library Secure Server running on port ${PORT}`);
});
