/**
 * Google Drive Link Converter Helper for Sunstone Library
 * Automatically converts normal Google Drive share links into embeddable PDF preview URLs.
 */

/**
 * Converts any Google Drive share link into a direct PDF preview URL suitable for the reader.
 * @param {string} url - Google Drive share link (e.g. https://drive.google.com/file/d/1A2B3C.../view?usp=sharing)
 * @returns {string} Converted embeddable preview URL or original URL
 */
export function convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Extract File ID from standard Google Drive URLs
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
}

/**
 * Converts a Google Drive image share link into a direct image rendering URL.
 * @param {string} url - Google Drive share link for cover image
 * @returns {string} Direct image URL
 */
export function convertGoogleDriveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;

  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}
