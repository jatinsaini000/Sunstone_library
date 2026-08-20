import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, child, remove } from 'firebase/database';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration using your provided Realtime Database URL
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForSunstoneLibraryProject",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sunstone-library-cbf2d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://sunstone-library-cbf2d-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sunstone-library-cbf2d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sunstone-library-cbf2d.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456789"
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

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

export default app;
