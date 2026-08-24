const fs = require('fs');
const path = require('path');

const dataStorePath = path.join(__dirname, 'data_store.json');
const FIREBASE_DB_URL = 'https://sunstone-library-cbf2d-default-rtdb.asia-southeast1.firebasedatabase.app';

async function updateFirebase() {
  let dataStore = {};
  try {
    const raw = fs.readFileSync(dataStorePath, 'utf8');
    dataStore = JSON.parse(raw);
  } catch (e) {
    console.error('Error reading data_store.json:', e);
    return;
  }

  try {
    const res = await fetch(`${FIREBASE_DB_URL}/books.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataStore.books)
    });
    
    if (res.ok) {
      console.log('Successfully pushed books to Firebase.');
    } else {
      console.error('Failed to push to Firebase:', await res.text());
    }
  } catch (e) {
    console.error('Firebase put error:', e);
  }
}

updateFirebase();
