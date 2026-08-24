/**
 * Google Drive Link Converter Helper for Sunstone Library
 * Converts share links and local paths into embeddable PDF viewer URLs.
 */

import {
  getDriveFileIdForFilename,
  getDrivePreviewUrl,
  PRAYAS_DRIVE_FOLDER_URL
} from './driveBookMap.js';

export { PRAYAS_DRIVE_FOLDER_URL };

/**
 * Extract Google Drive file ID from a share or preview URL.
 */
export function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  const fileIdMatch =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  return fileIdMatch?.[1] || null;
}

/**
 * Converts any Google Drive share link into a direct PDF preview URL suitable for the reader iframe.
 */
export function convertGoogleDriveUrl(url) {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) return getDrivePreviewUrl(fileId);
  return url;
}

/**
 * Converts a Google Drive image share link into a direct image rendering URL.
 */
export function convertGoogleDriveImageUrl(url) {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
  return url;
}

/**
 * Extract filename from a local uploads path like /uploads/books/My Book.pdf
 */
export function filenameFromLocalPath(path) {
  if (!path || typeof path !== 'string') return null;
  const parts = path.split('/');
  return parts[parts.length - 1] || null;
}

/**
 * Resolve the best PDF viewer URL for a book.
 * Priority: explicit Drive URL -> Drive map lookup -> local uploads path
 */
export function resolvePdfViewerUrl(pdfUrl, options = {}) {
  const { filename, title } = options;

  if (pdfUrl) {
    const driveId = extractGoogleDriveFileId(pdfUrl);
    if (driveId) return getDrivePreviewUrl(driveId);

    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      if (pdfUrl.toLowerCase().includes('.pdf')) return pdfUrl;
      return pdfUrl;
    }

    if (pdfUrl.startsWith('/uploads/') || pdfUrl.startsWith('/books/')) {
      const localFilename = filenameFromLocalPath(pdfUrl);
      const mappedId = getDriveFileIdForFilename(localFilename || filename);
      if (mappedId) return getDrivePreviewUrl(mappedId);

      // Offline fallback removed per user request
      return null;
    }
  }

  const lookupName = filename || title;
  const mappedId = getDriveFileIdForFilename(lookupName);
  if (mappedId) return getDrivePreviewUrl(mappedId);

  return pdfUrl || null;
}

/**
 * Whether the resolved URL should be shown in an iframe (Drive preview or direct PDF).
 */
export function isEmbeddablePdfUrl(url) {
  if (!url) return false;
  return (
    url.includes('drive.google.com/file/d/') ||
    url.includes('drive.google.com/uc?') ||
    url.toLowerCase().includes('.pdf') ||
    url.startsWith('blob:')
  );
}

export default {
  PRAYAS_DRIVE_FOLDER_URL,
  convertGoogleDriveUrl,
  convertGoogleDriveImageUrl,
  resolvePdfViewerUrl,
  isEmbeddablePdfUrl,
  extractGoogleDriveFileId
};
