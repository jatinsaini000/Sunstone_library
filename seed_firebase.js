/**
 * Firebase Realtime Database Seed Script for Sunstone Library
 * Usage: node seed_firebase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, 'data_store.json');
const dbUrl = 'https://sunstone-library-cbf2d-default-rtdb.asia-southeast1.firebasedatabase.app/';

async function seedFirebase() {
  if (!fs.existsSync(dataFilePath)) {
    console.error('data_store.json file not found!');
    return;
  }

  const rawData = fs.readFileSync(dataFilePath, 'utf-8');
  const jsonData = JSON.parse(rawData);

  console.log('Seeding data to Firebase Realtime Database at:', dbUrl);
  console.log(`Books count: ${jsonData.books ? jsonData.books.length : 0}`);

  try {
    const res = await fetch(`${dbUrl}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData)
    });

    if (res.ok) {
      console.log('SUCCESS! Firebase Realtime Database seeded successfully!');
    } else {
      const errText = await res.text();
      console.log('Firebase Response Status:', res.status, errText);
      console.log('NOTE: If you got a permission error, ensure your Realtime DB Rules allow read/write in test mode.');
    }
  } catch (error) {
    console.error('Seed Error:', error.message);
  }
}

seedFirebase();
