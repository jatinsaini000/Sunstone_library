import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, Key, Loader2 } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';
import { signInWithGooglePopup, addStudentToFirestore } from '../firebase.js';

export default function AuthModal({ onClose, onLoginSuccess, onRegisterSuccess, onAdminLoginSuccess }) {
  const [isAdminLoginMode, setIsAdminLoginMode] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Admin Specific Fields
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');

    try {
      const res = await signInWithGooglePopup();
      if (!res.success) {
        if (res.code === 'auth/popup-closed-by-user') {
          setGoogleLoading(false);
          return;
        }
        throw new Error(res.error || 'Google Sign-In failed. Please try again.');
      }

      const { email: gEmail, displayName: gName, photoURL: gPhoto, uid: gUid } = res.user;
      const cleanEmail = gEmail.toLowerCase().trim();

      let authenticatedUser = {
        id: 'usr_' + (gUid ? gUid.substring(0, 16) : Date.now()),
        name: gName || cleanEmail.split('@')[0],
        email: cleanEmail,
        photoUrl: gPhoto,
        role: 'student',
        program: 'B.Tech & BCA',
        status: 'Active',
        authProvider: 'google',
        createdAt: new Date().toISOString()
      };
      let authToken = null;

      // Sync with server (server determines the role, including admin)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const serverRes = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            name: gName || cleanEmail.split('@')[0],
            photoUrl: gPhoto,
            googleId: gUid,
            program: 'B.Tech & BCA'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (serverRes.ok) {
          const data = await serverRes.json().catch(() => ({}));
          if (data.user) {
            authenticatedUser = data.user;
            authToken = data.token;
          }
        }
      } catch (e) {
        console.warn('Server sync notice:', e.message);
      }

      // Persist directly to Firebase database with a 5-second timeout
      try {
        const dbPromise = addStudentToFirestore(authenticatedUser);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase DB timeout')), 5000));
        await Promise.race([dbPromise, timeoutPromise]);
      } catch (e) {
        console.warn('Firebase sync notice:', e.message);
      }

      // Route based on role returned by server
      if (authenticatedUser.role === 'admin') {
        onAdminLoginSuccess(authenticatedUser, authToken);
      } else {
        onLoginSuccess(authenticatedUser, authToken);
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Google Authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminId || !adminPass) {
      setErrorMsg('Please enter both Admin Email and Security Key.');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminId.trim().toLowerCase(),
          password: adminPass
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user && data.user.role === 'admin') {
        onAdminLoginSuccess(data.user, data.token);
        return;
      }

      setErrorMsg(data.error || 'Invalid administrative credentials. Access restricted.');
    } catch (err) {
      setErrorMsg('Connection error. Please check your network and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bottom-sheet-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-drag-handle"></div>

        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="auth-modal-content">
          {/* Header Icon & Brand */}
          <div className="auth-header-brand">
            <div className={`auth-brand-badge ${isAdminLoginMode ? 'admin' : ''}`}>
              {isAdminLoginMode ? (
                <ShieldCheck size={28} />
              ) : (
                <SunstoneLogo size={28} color="#16203b" />
              )}
            </div>
            <h3 className="auth-title">
              {isAdminLoginMode ? 'Prayas Admin Portal' : 'Student Sign In'}
            </h3>
            <p className="auth-subtitle">
              {isAdminLoginMode
                ? 'Authorized Library Coordinators Only'
                : 'Sunstone Prayas Lab Knowledge Portal'}
            </p>
          </div>

          {errorMsg && (
            <div className="auth-error-banner">
              {errorMsg}
            </div>
          )}

          {isAdminLoginMode ? (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleAdminSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={13} /> Admin Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@example.com"
                  value={adminId}
                  onChange={(e) => {
                    setAdminId(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} /> Master Security Key
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••••••"
                  value={adminPass}
                  onChange={(e) => {
                    setAdminPass(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="btn-primary auth-submit-btn admin-theme"
              >
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                <span>{formLoading ? 'Authenticating...' : 'Authenticate Admin Access'}</span>
              </button>

              <div className="auth-mode-toggle">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminLoginMode(false);
                    setErrorMsg('');
                  }}
                  className="auth-toggle-link"
                >
                  ← Back to Student Portal
                </button>
              </div>
            </form>
          ) : (
            /* STUDENT GOOGLE LOGIN ONLY */
            <div className="auth-form-wrapper">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="btn-google-auth"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--sunstone-border)',
                  background: 'var(--sunstone-card-bg)',
                  color: 'var(--sunstone-text-primary)',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  marginBottom: googleLoading ? '8px' : '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease'
                }}
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.03 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                )}
                <span>{googleLoading ? 'Opening Google Sign-In...' : 'Continue with Google'}</span>
              </button>

              {googleLoading && (
                <div style={{ textAlign: 'center', marginBottom: '14px', fontSize: '12px', color: 'var(--sunstone-text-secondary)', lineHeight: '1.4' }}>
                  Please select your Google account in the popup window.
                  <br />
                  <button
                    type="button"
                    onClick={() => setGoogleLoading(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginTop: '4px',
                      fontSize: '12px'
                    }}
                  >
                    Window didn't appear? Click here to Cancel / Retry
                  </button>
                </div>
              )}

              <div className="auth-admin-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminLoginMode(true);
                    setErrorMsg('');
                  }}
                  className="auth-admin-link"
                >
                  <ShieldCheck size={14} /> Library Coordinator / Admin Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
