import { catalogBooks } from './booksCatalog.js';
import { getDriveFileIdForFilename, getDriveShareUrl } from './driveBookMap.js';

const catalogByTitle = new Map(
  catalogBooks.map((book) => [book.title.toLowerCase().trim(), book])
);

const catalogByFilename = new Map(
  catalogBooks.map((book) => {
    const filename = (book.localPath || book.pdfUrl || '').split('/').pop();
    return [filename?.toLowerCase(), book];
  }).filter(([key]) => key)
);

/**
 * Merge catalog PDF/Drive metadata into a book record from Firebase or cache.
 */
export function enrichBookWithPdfSource(book) {
  if (!book) return book;

  const titleKey = book.title?.toLowerCase().trim();
  const filenameKey = (book.localPath || book.pdfUrl || book.title || '')
    .split('/')
    .pop()
    ?.toLowerCase();

  const catalogMatch = catalogByTitle.get(titleKey) || catalogByFilename.get(filenameKey);

  if (catalogMatch) {
    return {
      ...book,
      pdfUrl: catalogMatch.pdfUrl || book.pdfUrl,
      localPath: catalogMatch.localPath || book.localPath,
      driveFileId: catalogMatch.driveFileId || book.driveFileId,
      fileType: catalogMatch.fileType || book.fileType,
      category: catalogMatch.category || book.category,
      program: catalogMatch.program || book.program
    };
  }

  const driveId = getDriveFileIdForFilename(filenameKey || `${book.title}.pdf`);
  if (driveId && (!book.pdfUrl || book.pdfUrl.includes('tracemonkey') || book.pdfUrl.startsWith('/uploads/'))) {
    return {
      ...book,
      pdfUrl: getDriveShareUrl(driveId),
      driveFileId: driveId,
      fileType: 'drive'
    };
  }

  return book;
}

export function enrichBooksCatalog(books) {
  if (!Array.isArray(books)) return catalogBooks;
  return books.map(enrichBookWithPdfSource);
}

export function hasValidPdfUrl(book) {
  if (!book?.pdfUrl) return false;
  return !book.pdfUrl.includes('tracemonkey-pldi-09');
}

export function preferCatalogIfStale(books) {
  if (!Array.isArray(books) || books.length === 0) return catalogBooks;
  const validCount = books.filter(hasValidPdfUrl).length;
  if (validCount < books.length * 0.5) return catalogBooks;
  return enrichBooksCatalog(books);
}
