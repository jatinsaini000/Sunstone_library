const fs = require('fs');
const path = require('path');

const dataStorePath = path.join(__dirname, 'data_store.json');
const uploadsBooksDir = path.join(__dirname, 'uploads', 'books');

// Read existing data
let dataStore = { users: [], books: [], borrowRequests: [], userNotes: [] };
try {
  const raw = fs.readFileSync(dataStorePath, 'utf8');
  dataStore = JSON.parse(raw);
} catch (e) {
  console.error('Error reading data_store.json:', e);
}

// Clear old books
dataStore.books = [];

// Read all pdfs from uploads/books
let newBooks = [];
try {
  const files = fs.readdirSync(uploadsBooksDir);
  let idCounter = 1;
  for (const file of files) {
    if (file.toLowerCase().endsWith('.pdf')) {
      const title = file.replace(/\.pdf$/i, '').replace(/_/g, ' ');
      newBooks.push({
        id: 'bk_tech_' + Date.now() + '_' + idCounter,
        title: title,
        author: "Unknown Author",
        program: "All Programs",
        category: "Technical",
        coverUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80",
        fileType: "file",
        pdfUrl: "/uploads/books/" + file,
        downloadable: true,
        isbn: "ISBN-" + Math.floor(100000000 + Math.random() * 900000000),
        rating: 4.8,
        pages: 350,
        publishedYear: 2024,
        quickSummary: {
          highlights: ["Comprehensive technical material.", "Practical examples and case studies.", "Industry standard practices."],
          keyTakeaways: ["Master core technical concepts.", "Apply learning to real-world projects."],
          estimatedReadingTime: "12 Hours",
          difficultyLevel: "Intermediate to Advanced"
        },
        description: `A comprehensive technical guide: ${title}. Perfect for enhancing your skills and knowledge.`
      });
      idCounter++;
    }
  }
} catch (e) {
  console.error('Error reading uploads/books:', e);
}

// Update data store
dataStore.books = newBooks;

try {
  fs.writeFileSync(dataStorePath, JSON.stringify(dataStore, null, 2), 'utf8');
  console.log(`Successfully replaced books. Total new books: ${newBooks.length}`);
} catch (e) {
  console.error('Error writing data_store.json:', e);
}
