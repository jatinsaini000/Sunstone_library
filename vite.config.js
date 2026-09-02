import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, 'uploads');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-uploads-middleware',
      configureServer(server) {
        // Fallback: serve PDFs from uploads/ when Express backend is not running
        server.middlewares.use('/uploads', (req, res, next) => {
          try {
            const relativePath = decodeURIComponent((req.url || '').split('?')[0]);
            const filePath = path.normalize(path.join(uploadsRoot, relativePath));
            if (!filePath.startsWith(uploadsRoot) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
              return next();
            }
            if (filePath.toLowerCase().endsWith('.pdf')) {
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'inline');
            }
            fs.createReadStream(filePath).pipe(res);
          } catch (e) {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
