import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, child, remove } from 'firebase/database';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, limit } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Firebase configuration using your provided Realtime Database URL
const FIREBASE_WEB_API_KEY = "AIzaSyCvmjYePXRpAbahhOCtqrz5z6-jEhvjZH0";
const rawEnvKey = import.meta.env.VITE_FIREBASE_API_KEY;
const resolvedApiKey = (typeof rawEnvKey === 'string' && rawEnvKey.startsWith('AIzaSy'))
  ? rawEnvKey
  : FIREBASE_WEB_API_KEY;

const firebaseConfig = {
  apiKey: resolvedApiKey,
  authDomain: "sunstone-library-cbf2d.firebaseapp.com",
  databaseURL: "https://sunstone-library-cbf2d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sunstone-library-cbf2d",
  storageBucket: "sunstone-library-cbf2d.firebasestorage.app",
  messagingSenderId: "862348491959",
  appId: "1:862348491959:web:f5b5342535fa7dde59a132",
  measurementId: "G-NFJD7964BL"
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/** Upload book PDF directly to Firebase Storage with progress tracking */
export function uploadBookPdfToStorage(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No PDF file provided for upload.'));
    
    // Clean filename and ensure uniqueness
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `books/${Date.now()}_${cleanFileName}`;
    const fileRef = storageRef(storage, storagePath);

    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type || 'application/pdf'
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (typeof onProgress === 'function') onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Launch Google Sign-In Popup */
export async function signInWithGooglePopup() {
  try {
    const popupPromise = signInWithPopup(auth, googleProvider);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Google Sign-In window timed out. Please check if the popup was blocked by your browser.')), 45000)
    );
    const result = await Promise.race([popupPromise, timeoutPromise]);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.warn('Firebase Google Sign-In notice:', error.message);
    let friendlyError = error.message;
    if (error.code === 'auth/popup-blocked') {
      friendlyError = 'Pop-up window was blocked by your browser. Please click the pop-up icon in your browser address bar and allow popups.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      friendlyError = 'Previous sign-in request was cancelled. Please try again.';
    } else if (error.code === 'auth/network-request-failed') {
      friendlyError = 'Network connection error. Please check your internet connection.';
    }
    return {
      success: false,
      error: friendlyError,
      code: error.code
    };
  }
}

// --- Realtime Database & Firestore Helpers ---

/** Fetch all books from Firebase Realtime DB or Firestore */
export async function getBooksFromFirestore() {
  try {
    // 1. Try Firebase Realtime Database
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'books'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'object') return Object.values(val);
    }
  } catch (err) {
    console.warn('Realtime DB getBooks info:', err.message);
  }

  try {
    // 2. Fallback to Firestore
    const booksCol = collection(db, 'books');
    const fsSnap = await getDocs(booksCol);
    if (!fsSnap.empty) {
      return fsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    }
  } catch (error) {
    console.warn('Firestore getBooks info:', error.message);
  }

  return null;
}

/** Add a new book to Firebase Realtime DB */
export async function addBookToFirestore(bookData) {
  const bookId = bookData.id || ('bk_' + Date.now());
  const finalBook = { ...bookData, id: bookId, createdAt: new Date().toISOString() };

  try {
    // Save to Realtime Database
    await set(ref(rtdb, 'books/' + bookId), finalBook);
  } catch (error) {
    console.warn('Realtime DB add error:', error);
  }

  try {
    // Also save to Firestore
    await setDoc(doc(db, 'books', bookId), finalBook);
  } catch (error) {}

  return finalBook;
}

/** Delete a book from Firebase */
export async function deleteBookFromFirestore(bookId) {
  try {
    await remove(ref(rtdb, 'books/' + bookId));
  } catch (e) {}

  try {
    await deleteDoc(doc(db, 'books', bookId));
  } catch (e) {}
}

/** Update an existing book in Firebase */
export async function updateBookInFirestore(bookId, updatedFields) {
  try {
    await update(ref(rtdb, 'books/' + bookId), updatedFields);
  } catch (e) {}

  try {
    await updateDoc(doc(db, 'books', bookId), updatedFields);
  } catch (e) {}
}

/** Fetch all borrow requests from Firebase */
export async function getBorrowRequestsFromFirestore() {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'borrowRequests'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'object') return Object.values(val);
    }
  } catch (err) {}

  try {
    const reqCol = collection(db, 'borrowRequests');
    const fsSnap = await getDocs(reqCol);
    if (!fsSnap.empty) {
      return fsSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    }
  } catch (error) {}

  return null;
}

/** Add a new borrow request to Firebase */
export async function addBorrowRequestToFirestore(requestData) {
  const reqId = requestData.id || ('req_' + Date.now());
  const finalReq = { ...requestData, id: reqId, requestDate: new Date().toISOString() };

  try {
    await set(ref(rtdb, 'borrowRequests/' + reqId), finalReq);
  } catch (error) {}

  try {
    await setDoc(doc(db, 'borrowRequests', reqId), finalReq);
  } catch (error) {}

  return finalReq;
}

/** Update borrow request status (Approved/Rejected/Returned) */
export async function updateBorrowStatusInFirestore(reqId, status, adminNote = '') {
  const updates = { status, adminNote, updatedAt: new Date().toISOString() };

  try {
    await update(ref(rtdb, 'borrowRequests/' + reqId), updates);
  } catch (error) {}

  try {
    await updateDoc(doc(db, 'borrowRequests', reqId), updates);
  } catch (error) {}
}

/** Delete borrow request from Firebase */
export async function deleteBorrowRequestFromFirestore(reqId) {
  try {
    await remove(ref(rtdb, 'borrowRequests/' + reqId));
  } catch (error) {}

  try {
    await deleteDoc(doc(db, 'borrowRequests', reqId));
  } catch (error) {}
}

/** Fetch user notes from Firebase */
export async function getNotesFromFirestore(studentId) {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'notes'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      const allNotes = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
      if (studentId) {
        return allNotes.filter(n => n.studentId === studentId);
      }
      return allNotes;
    }
  } catch (err) {}
  return null;
}

/** Add user note to Firebase */
export async function addNoteToFirestore(noteData) {
  const noteId = noteData.id || ('note_' + Date.now());
  const finalNote = { ...noteData, id: noteId, createdAt: noteData.createdAt || new Date().toISOString() };

  try {
    await set(ref(rtdb, 'notes/' + noteId), finalNote);
  } catch (e) {}

  try {
    await setDoc(doc(db, 'notes', noteId), finalNote);
  } catch (e) {}

  return finalNote;
}

/** Delete user note from Firebase */
export async function deleteNoteFromFirestore(noteId) {
  try {
    await remove(ref(rtdb, 'notes/' + noteId));
  } catch (e) {}

  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (e) {}
}

/**
 * Scalable User Schema for 1,000+ Users:
 * Primary Key: Google Firebase Auth UID (doc path: /users/{uid})
 * Fields:
 * - uid: string (Google UID)
 * - id: string (compatible alias for uid)
 * - email: canonical lowercase string
 * - displayName: string (name)
 * - name: string (alias for displayName)
 * - photoURL: string (avatar)
 * - photoUrl: string (alias for photoURL)
 * - role: 'student' | 'admin'
 * - status: 'Active' | 'Suspended'
 * - academic: { program: string, rollNo: string, batch: string }
 * - program: string (alias)
 * - stats: { activeBorrows: number, totalBorrows: number }
 * - createdAt: ISO string
 * - lastLoginAt: ISO string
 */

/** Fetch single user profile by UID (O(1) direct lookup, optimal for scale) */
export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { id: docSnap.id, uid: docSnap.id, ...docSnap.data() };
    }
  } catch (err) {}

  try {
    const snap = await get(child(ref(rtdb), `users/${uid}`));
    if (snap.exists()) {
      const val = snap.val();
      return { id: uid, uid, ...val };
    }
  } catch (err) {}

  return null;
}

/** Sync or initialize Google-authenticated user in database */
export async function syncGoogleUser(googleUser, adminEmails = []) {
  if (!googleUser || !googleUser.uid) {
    throw new Error('Invalid Google user data');
  }

  const uid = googleUser.uid;
  const cleanEmail = (googleUser.email || '').toLowerCase().trim();
  const normalizedAdmins = (adminEmails || []).map(e => (typeof e === 'string' ? e.toLowerCase().trim() : ''));
  const isAuthorizedAdmin = normalizedAdmins.includes(cleanEmail);

  // Check if existing profile exists
  let existingProfile = null;
  try {
    existingProfile = await getUserProfile(uid);
  } catch (e) {}

  const now = new Date().toISOString();

  let finalProfile;
  if (existingProfile) {
    // Determine updated role: retain admin if granted, or elevate if email matches whitelist
    const targetRole = isAuthorizedAdmin ? 'admin' : (existingProfile.role || 'student');
    finalProfile = {
      ...existingProfile,
      uid,
      id: uid,
      email: cleanEmail,
      displayName: googleUser.displayName || existingProfile.displayName || cleanEmail.split('@')[0],
      name: googleUser.displayName || existingProfile.name || cleanEmail.split('@')[0],
      photoURL: googleUser.photoURL || existingProfile.photoURL || '',
      photoUrl: googleUser.photoURL || existingProfile.photoUrl || '',
      role: targetRole,
      status: existingProfile.status || 'Active',
      lastLoginAt: now
    };
  } else {
    // Create new student/admin profile
    finalProfile = {
      uid,
      id: uid,
      email: cleanEmail,
      displayName: googleUser.displayName || cleanEmail.split('@')[0],
      name: googleUser.displayName || cleanEmail.split('@')[0],
      photoURL: googleUser.photoURL || '',
      photoUrl: googleUser.photoURL || '',
      role: isAuthorizedAdmin ? 'admin' : 'student',
      status: 'Active',
      program: 'B.Tech & BCA',
      academic: {
        program: 'B.Tech & BCA',
        rollNo: '',
        batch: ''
      },
      stats: {
        activeBorrows: 0,
        totalBorrows: 0
      },
      createdAt: now,
      lastLoginAt: now
    };
  }

  // Persist to Firestore and RTDB asynchronously
  try {
    await setDoc(doc(db, 'users', uid), finalProfile, { merge: true });
  } catch (e) {
    console.warn('Firestore user sync warning:', e.message);
  }

  try {
    await set(ref(rtdb, 'users/' + uid), finalProfile);
  } catch (e) {}

  return finalProfile;
}

/** Fetch all registered students from Firebase */
export async function getStudentsFromFirestore() {
  try {
    const usersCol = collection(db, 'users');
    const fsSnap = await getDocs(usersCol);
    if (!fsSnap.empty) {
      return fsSnap.docs
        .map(docSnap => ({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() }))
        .filter(u => u.role === 'student');
    }
  } catch (error) {}

  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'users'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      const allUsers = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
      return allUsers.filter(u => u.role === 'student');
    }
  } catch (err) {}

  return null;
}

/** Add or update a registered student in Firebase */
export async function addStudentToFirestore(studentData) {
  const studentId = studentData.uid || studentData.id || ('usr_' + Date.now());
  const finalStudent = {
    ...studentData,
    uid: studentId,
    id: studentId,
    role: studentData.role || 'student',
    status: studentData.status || 'Active',
    createdAt: studentData.createdAt || new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'users', studentId), finalStudent, { merge: true });
  } catch (e) {}

  try {
    await set(ref(rtdb, 'users/' + studentId), finalStudent);
  } catch (e) {}

  return finalStudent;
}

/** Update student account status in Firebase (Active / Suspended) */
export async function updateStudentStatusInFirestore(studentId, status) {
  const updates = { status, updatedAt: new Date().toISOString() };

  try {
    await updateDoc(doc(db, 'users', studentId), updates);
  } catch (e) {}

  try {
    await update(ref(rtdb, 'users/' + studentId), updates);
  } catch (e) {}
}

/** Delete student / user account from Firebase */
export async function deleteStudentFromFirestore(studentId) {
  try {
    await deleteDoc(doc(db, 'users', studentId));
  } catch (e) {}

  try {
    await remove(ref(rtdb, 'users/' + studentId));
  } catch (e) {}
}

/** Fetch all registered users (students & admins) from Firebase */
export async function getAllUsersFromFirestore() {
  try {
    const usersCol = collection(db, 'users');
    const fsSnap = await getDocs(usersCol);
    if (!fsSnap.empty) {
      return fsSnap.docs.map(docSnap => ({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() }));
    }
  } catch (error) {}

  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'users'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      const allUsers = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
      return allUsers;
    }
  } catch (err) {}

  return null;
}

/** Update user role in Firebase (admin / student) */
export async function updateUserRoleInFirestore(userId, role) {
  const updates = { role, updatedAt: new Date().toISOString() };

  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (e) {}

  try {
    await update(ref(rtdb, 'users/' + userId), updates);
  } catch (e) {}
}

/** Fetch authorized admin emails from Firebase Realtime DB / Firestore */
export async function getAdminEmailsFromFirestore() {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'adminEmails'));
    if (docSnap.exists() && Array.isArray(docSnap.data().emails)) {
      return docSnap.data().emails;
    }
  } catch (e) {}

  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'settings/adminEmails'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      return Array.isArray(val) ? val : Object.values(val);
    }
  } catch (e) {}
  return [];
}

/** Save authorized admin emails list to Firebase */
export async function saveAdminEmailsToFirestore(emails) {
  try {
    await setDoc(doc(db, 'settings', 'adminEmails'), { emails, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {}

  try {
    await set(ref(rtdb, 'settings/adminEmails'), emails);
  } catch (e) {}
}

/** Sign out user from Firebase Auth */
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out notice:', e.message);
  }
}

/** Listen to auth state changes directly from Firebase Auth */
export function onAuthUserChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

export default app;

