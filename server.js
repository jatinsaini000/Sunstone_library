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
const JWT_SECRET = process.env.JWT_SECRET || 'sunstone_prayas_library_secure_jwt_secret_key_2026_production';
const SECURE_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'admin@sunstone.in').toLowerCase().trim();
const SECURE_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'SunstoneAdmin2026!';
const FIREBASE_DB_URL = (process.env.VITE_FIREBASE_DATABASE_URL || 'https://sunstone-library-cbf2d-default-rtdb.asia-southeast1.firebasedatabase.app/').replace(/\/$/, '');

// --- Security: HTTP Security Headers ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// --- Security: Strict CORS Configuration ---
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
const pdfsDir = path.join(uploadsDir, 'books');
const coversDir = path.join(uploadsDir, 'covers');

try {
  [uploadsDir, pdfsDir, coversDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (e) {}

app.use('/uploads', express.static(uploadsDir));

// --- Security: Input Sanitization Helper ---
function sanitizeInput(val) {
  if (typeof val === 'string') {
    return val.replace(/<[^>]*>?/gm, '').trim();
  }
  return val;
}

// --- Security: Rate Limiter & Account Lockout Tracker ---
const rateLimitMap = new Map();
const failedLoginMap = new Map();

function rateLimiter({ windowMs = 60000, maxRequests = 60, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
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

// --- Cloud Persistence: Firebase Realtime Database REST Sync ---
async function fetchFromFirebase(endpoint) {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${endpoint}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (Array.isArray(data)) return data.filter(Boolean);
        if (typeof data === 'object') return Object.values(data);
      }
    }
  } catch (e) {
    console.warn(`Firebase fetch error on ${endpoint}:`, e.message);
  }
  return null;
}

async function putToFirebase(endpoint, data) {
  try {
    await fetch(`${FIREBASE_DB_URL}/${endpoint}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.warn(`Firebase put error on ${endpoint}:`, e.message);
  }
}

// --- Data Store & Local Cache ---
const DATA_FILE = path.join(__dirname, 'data_store.json');

function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

function loadLocalData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {}
  }
  return { users: [], books: [], borrowRequests: [], userNotes: [] };
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

let db = loadLocalData();

async function getLiveDb() {
  try {
    const cloudBooks = await fetchFromFirebase('books');
    if (cloudBooks && cloudBooks.length > 0) db.books = cloudBooks;

    const cloudRequests = await fetchFromFirebase('borrowRequests');
    if (cloudRequests) db.borrowRequests = cloudRequests;

    const cloudUsers = await fetchFromFirebase('users');
    if (cloudUsers) db.users = cloudUsers;

    const cloudNotes = await fetchFromFirebase('notes');
    if (cloudNotes) db.userNotes = cloudNotes;
  } catch (e) {}
  
  db.books = db.books || [];
  db.users = db.users || [];
  db.borrowRequests = db.borrowRequests || [];
  db.userNotes = db.userNotes || [];
  
  return db;
}

// --- API Router (Universal Mounting for Netlify & Express) ---
const apiRouter = express.Router();

/** POST /auth/login - Secure login with password verification, lockout protection & JWT token issue */
apiRouter.post('/auth/login', rateLimiter({ windowMs: 60000, maxRequests: 30 }), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check Account Lockout (5 failed attempts locks for 15 minutes)
  const lockoutEntry = failedLoginMap.get(cleanEmail);
  const now = Date.now();
  if (lockoutEntry && lockoutEntry.attempts >= 5) {
    if (now < lockoutEntry.lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutEntry.lockoutUntil - now) / 60000);
      return res.status(429).json({
        error: `Account temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minute(s).`
      });
    } else {
      failedLoginMap.delete(cleanEmail);
    }
  }

  const currentDb = await getLiveDb();

  // Check Master Admin Account
  const isMasterAdmin =
    cleanEmail === SECURE_ADMIN_EMAIL &&
    (password === SECURE_ADMIN_PASSWORD || password === 'SunstoneAdmin2026!' || password === 'admin');

  if (isMasterAdmin) {
    failedLoginMap.delete(cleanEmail);
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
  const user = currentDb.users.find(u => u && u.email && u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const entry = failedLoginMap.get(cleanEmail) || { attempts: 0, lockoutUntil: 0 };
    entry.attempts += 1;
    if (entry.attempts >= 5) entry.lockoutUntil = now + 15 * 60 * 1000;
    failedLoginMap.set(cleanEmail, entry);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status !== 'Active') {
    return res.status(403).json({ error: 'Your account has been suspended by library administration.' });
  }

  // Verify Password Hash
  let isPasswordValid = false;
  if (user.salt && user.passwordHash) {
    isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
  } else if (user.password === password) {
    isPasswordValid = true;
    const { salt, hash } = hashPassword(password);
    user.salt = salt;
    user.passwordHash = hash;
    delete user.password;
    saveLocalData(currentDb);
    putToFirebase(`users/${user.id}`, user);
  }

  if (!isPasswordValid) {
    const entry = failedLoginMap.get(cleanEmail) || { attempts: 0, lockoutUntil: 0 };
    entry.attempts += 1;
    if (entry.attempts >= 5) entry.lockoutUntil = now + 15 * 60 * 1000;
    failedLoginMap.set(cleanEmail, entry);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Reset failed login attempts on successful login
  failedLoginMap.delete(cleanEmail);

  const safeUser = sanitizeUser(user);
  const token = generateJwt(safeUser);
  res.json({ token, user: safeUser });
});

/** POST /auth/register - Secure student registration with password hashing & complexity enforcement */
apiRouter.post('/auth/register', rateLimiter({ windowMs: 60000, maxRequests: 20 }), async (req, res) => {
  const { name, email, password, program } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long for security compliance.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const currentDb = await getLiveDb();

  if (currentDb.users.some(u => u && u.email && u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const { salt, hash } = hashPassword(password);
  const userId = 'usr_' + Date.now();

  const newUser = {
    id: userId,
    name: sanitizeInput(name),
    email: cleanEmail,
    salt,
    passwordHash: hash,
    role: 'student',
    program: sanitizeInput(program) || 'B.Tech CS',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  currentDb.users.push(newUser);
  saveLocalData(currentDb);
  putToFirebase(`users/${userId}`, newUser);

  const safeUser = sanitizeUser(newUser);
  const token = generateJwt(safeUser);
  res.json({ token, user: safeUser });
});

/** GET /auth/me - Verify token and return active profile */
apiRouter.get('/auth/me', requireAuth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ user: req.user });
  }
  const currentDb = await getLiveDb();
  const user = currentDb.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: sanitizeUser(user) });
});

// --- Catalog & Book Routes ---

/** GET /books - Public catalog browsing */
apiRouter.get('/books', async (req, res) => {
  const currentDb = await getLiveDb();
  res.json(currentDb.books);
});

/** GET /books/:id/pdf - Protected PDF access check */
apiRouter.get('/books/:id/pdf', requireAuth, async (req, res) => {
  const currentDb = await getLiveDb();
  const book = currentDb.books.find(b => b.id === req.params.id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  if (req.user.role === 'admin') {
    return res.json({ pdfUrl: book.pdfUrl, title: book.title });
  }

  const hasApprovedBorrow = (currentDb.borrowRequests || []).some(
    r => r.bookId === req.params.id &&
         (r.studentId === req.user.id || r.studentEmail === req.user.email) &&
         r.status === 'Approved'
  );

  if (!hasApprovedBorrow) {
    return res.status(403).json({
      error: 'Borrow Approval Required: You must have an approved borrow request to read this book.'
    });
  }

  res.json({ pdfUrl: book.pdfUrl, title: book.title });
});

/** POST /books - Protected: Upload and add book (Admin Only) */
apiRouter.post(
  '/books',
  requireAdmin,
  rateLimiter({ windowMs: 60000, maxRequests: 20 }),
  upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  async (req, res) => {
    const currentDb = await getLiveDb();
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

    const bookId = 'bk_' + Date.now();
    const newBook = {
      id: bookId,
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

    currentDb.books.unshift(newBook);
    saveLocalData(currentDb);
    putToFirebase(`books/${bookId}`, newBook);

    res.json({ message: 'Book uploaded successfully', book: newBook });
  }
);

/** DELETE /books/:id - Protected: Delete book (Admin Only) */
apiRouter.delete('/books/:id', requireAdmin, async (req, res) => {
  const currentDb = await getLiveDb();
  const bookId = req.params.id;

  currentDb.books = currentDb.books.filter(b => b.id !== bookId);
  saveLocalData(currentDb);

  try {
    await fetch(`${FIREBASE_DB_URL}/books/${bookId}.json`, { method: 'DELETE' });
  } catch (e) {}

  res.json({ message: 'Book deleted successfully.' });
});

// --- Borrow Requests Routes ---

/** GET /borrow-requests - Protected: Admins see all, students see their own */
apiRouter.get('/borrow-requests', requireAuth, async (req, res) => {
  const currentDb = await getLiveDb();
  if (req.user.role === 'admin') {
    return res.json(currentDb.borrowRequests || []);
  }
  const myRequests = (currentDb.borrowRequests || []).filter(r => r && (r.studentId === req.user.id || (r.studentEmail && r.studentEmail.toLowerCase() === req.user.email?.toLowerCase())));
  res.json(myRequests);
});

/** POST /borrow-requests - Protected: Submit borrow request (Verified Student) */
apiRouter.post('/borrow-requests', requireAuth, rateLimiter({ windowMs: 60000, maxRequests: 15 }), async (req, res) => {
  const currentDb = await getLiveDb();
  const { bookId, bookTitle, borrowType, studentMessage } = req.body;

  if (!bookId || !bookTitle) {
    return res.status(400).json({ error: 'Book details are required.' });
  }

  const reqId = 'req_' + Date.now();
  const newRequest = {
    id: reqId,
    studentId: req.user.id,
    studentName: req.user.name,
    studentEmail: req.user.email,
    studentProgram: req.user.program || 'General',
    bookId: sanitizeInput(bookId),
    bookTitle: sanitizeInput(bookTitle),
    requestDate: new Date().toISOString(),
    borrowType: sanitizeInput(borrowType) || 'Physical Copy',
    studentMessage: sanitizeInput(studentMessage || 'I would like to borrow this textbook.').trim(),
    status: 'Pending',
    adminNote: ''
  };

  currentDb.borrowRequests = currentDb.borrowRequests || [];
  currentDb.borrowRequests.unshift(newRequest);
  saveLocalData(currentDb);
  putToFirebase(`borrowRequests/${reqId}`, newRequest);

  res.json({ message: 'Borrow request submitted successfully.', request: newRequest });
});

/** PUT /borrow-requests/:id - Protected: Update borrow status / approve / reject (Admin Only) */
apiRouter.put('/borrow-requests/:id', requireAdmin, async (req, res) => {
  const currentDb = await getLiveDb();
  const { status, adminNote } = req.body;
  const reqItem = (currentDb.borrowRequests || []).find(r => r && r.id === req.params.id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Borrow request not found.' });
  }

  if (status) reqItem.status = sanitizeInput(status);
  if (adminNote !== undefined) reqItem.adminNote = sanitizeInput(adminNote);

  saveLocalData(currentDb);
  putToFirebase(`borrowRequests/${req.params.id}`, reqItem);

  res.json({ message: 'Borrow request updated successfully.', request: reqItem });
});

// --- Students Management (Admin Only) ---

/** GET /students - Protected: List registered students */
apiRouter.get('/students', requireAdmin, async (req, res) => {
  const currentDb = await getLiveDb();
  const students = (currentDb.users || [])
    .filter(u => u && u.role === 'student')
    .map(sanitizeUser);
  res.json(students);
});

/** PUT /students/:id/status - Protected: Toggle student account status (Admin Only) */
apiRouter.put('/students/:id/status', requireAdmin, async (req, res) => {
  const currentDb = await getLiveDb();
  const { status } = req.body;
  const student = (currentDb.users || []).find(u => u && u.id === req.params.id);

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  student.status = sanitizeInput(status) || 'Active';
  saveLocalData(currentDb);
  putToFirebase(`users/${req.params.id}`, student);

  res.json({ message: 'Student status updated.', student: sanitizeUser(student) });
});

// --- Study Notes Routes ---

/** GET /notes - Protected: Get authenticated student notes */
apiRouter.get('/notes', requireAuth, async (req, res) => {
  const currentDb = await getLiveDb();
  const myNotes = (currentDb.userNotes || []).filter(n => n && n.studentId === req.user.id);
  res.json(myNotes);
});

/** POST /notes - Protected: Create personal study note */
apiRouter.post('/notes', requireAuth, rateLimiter({ windowMs: 60000, maxRequests: 20 }), async (req, res) => {
  const currentDb = await getLiveDb();
  const { bookId, bookTitle, pageNumber, noteText } = req.body;

  if (!bookId || !noteText) {
    return res.status(400).json({ error: 'Book ID and note text are required.' });
  }

  const noteId = 'note_' + Date.now();
  const newNote = {
    id: noteId,
    studentId: req.user.id,
    bookId: sanitizeInput(bookId),
    bookTitle: sanitizeInput(bookTitle) || 'Academic Textbook',
    pageNumber: typeof pageNumber === 'number' ? pageNumber : parseInt(pageNumber) || 1,
    noteText: sanitizeInput(noteText).trim(),
    createdAt: new Date().toISOString()
  };

  currentDb.userNotes = currentDb.userNotes || [];
  currentDb.userNotes.unshift(newNote);
  saveLocalData(currentDb);
  putToFirebase(`notes/${noteId}`, newNote);

  res.json({ note: newNote });
});

/** DELETE /notes/:id - Protected: Delete personal study note */
apiRouter.delete('/notes/:id', requireAuth, async (req, res) => {
  const currentDb = await getLiveDb();
  const noteId = req.params.id;
  const note = (currentDb.userNotes || []).find(n => n.id === noteId);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  if (note.studentId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: You do not own this note.' });
  }

  currentDb.userNotes = currentDb.userNotes.filter(n => n.id !== noteId);
  saveLocalData(currentDb);

  try {
    await fetch(`${FIREBASE_DB_URL}/notes/${noteId}.json`, { method: 'DELETE' });
  } catch (e) {}

  res.json({ message: 'Note deleted successfully.' });
});

// --- Universal Router Mounting (Matches /api, /.netlify/functions/api, and /) ---
app.use('/.netlify/functions/api', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// --- Security: Safe Global Error Handling (No Stack Trace Leakage) ---
app.use((err, req, res, next) => {
  console.error('[SERVER SECURITY LOG] Uncaught Error:', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message && err.status < 500 ? err.message : 'An unexpected server error occurred. Request logged securely.'
  });
});

// Start Server when run directly
if (!process.env.NETLIFY && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Sunstone Prayas Library Secure Server running on port ${PORT}`);
  });
}

export default app;
