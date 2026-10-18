import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';
import { signInWithGooglePopup, syncGoogleUser } from '../firebase.js';

export default function AuthModal({ onClose, onLoginSuccess, onAdminLoginSuccess, adminEmails = [] }) {
  const [googleLoading, setGoogleLoading] = useState(false);
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

      // Sync/initialize scalable user profile directly with Firebase
      const authenticatedUser = await syncGoogleUser(res.user, adminEmails);

      // Route based on role
      if (authenticatedUser.role === 'admin') {
        if (onAdminLoginSuccess) onAdminLoginSuccess(authenticatedUser);
        else onLoginSuccess(authenticatedUser);
      } else {
        onLoginSuccess(authenticatedUser);
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Google Authentication failed.');
    } finally {
      setGoogleLoading(false);
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
          <div className="auth-header-brand" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div className="auth-brand-badge" style={{ margin: '0 auto 12px' }}>
              <SunstoneLogo size={32} color="#16203b" />
            </div>
            <h3 className="auth-title" style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px', color: 'var(--sunstone-text-primary)' }}>
              Sign In to Sunstone Library
            </h3>
            <p className="auth-subtitle" style={{ fontSize: '13px', color: 'var(--sunstone-text-secondary)', margin: 0 }}>
              Access Prayas Lab collection, request books & unlock your reading desk.
            </p>
          </div>

          {errorMsg && (
            <div className="auth-error-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '18px' }}>
              {errorMsg}
            </div>
          )}

          {/* ONE-CLICK GOOGLE LOGIN ONLY */}
          <div className="auth-form-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="btn-google-auth"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1.5px solid var(--sunstone-border)',
                background: 'var(--sunstone-card-bg)',
                color: 'var(--sunstone-text-primary)',
                fontWeight: '700',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: googleLoading ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.03 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {googleLoading && (
              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--sunstone-text-secondary)', lineHeight: '1.4' }}>
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
                  Window didn't appear? Click to Cancel / Retry
                </button>
              </div>
            )}

            <div style={{
              background: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginTop: '8px'
            }}>
              <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: 'var(--sunstone-text-secondary)', lineHeight: '1.4' }}>
                <strong>Single Sign-On:</strong> Passwords are disabled. Sign in with any Google account. Authorized administrator emails are granted full Admin Console privileges automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
