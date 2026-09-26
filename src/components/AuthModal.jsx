import React, { useState } from 'react';
import { X, User, Lock, Mail, GraduationCap, ShieldCheck, Key, Loader2, UserPlus, LogIn } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';
import { signInWithGooglePopup, addStudentToFirestore } from '../firebase.js';

export default function AuthModal({ onClose, onLoginSuccess, onRegisterSuccess, onAdminLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isAdminLoginMode, setIsAdminLoginMode] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('B.Tech & BCA');

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
        role: cleanEmail === 'admin@sunstone.in' ? 'admin' : 'student',
        program,
        status: 'Active',
        authProvider: 'google',
        createdAt: new Date().toISOString()
      };
      let authToken = null;

      // Sync with server if available (with 5-second timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const serverRes = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            name: gName || cleanEmail.split('@')[0],
            photoUrl: gPhoto,
            googleId: gUid,
            program
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

      onLoginSuccess(authenticatedUser, authToken);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Google Authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setFormLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            program
          })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorMsg(data.error || 'Registration failed. Please check your details.');
          setFormLoading(false);
          return;
        }

        onRegisterSuccess(data.user, data.token);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorMsg(data.error || 'Invalid email or password.');
          setFormLoading(false);
          return;
        }

        if (data.user.role === 'admin') {
          onAdminLoginSuccess(data.user, data.token);
        } else {
          onLoginSuccess(data.user, data.token);
        }
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminId || !adminPass) {
      setErrorMsg('Please enter both Admin ID and Security Key.');
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
      setErrorMsg('Invalid administrative credentials. Please verify your password.');
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
              {isAdminLoginMode
                ? 'Prayas Admin Portal'
                : isRegisterMode
                ? 'Student Registration'
                : 'Student Sign In'}
            </h3>
            <p className="auth-subtitle">
              {isAdminLoginMode
                ? 'Authorized Library Coordinators Only'
                : 'Sunstone Prayas Lab Knowledge Portal'}
            </p>
          </div>

          {/* Mode Switcher */}
          {!isAdminLoginMode && (
            <div style={{
              display: 'flex',
              background: 'var(--sunstone-border-light)',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '18px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: !isRegisterMode ? 'var(--sunstone-card-bg)' : 'transparent',
                  color: !isRegisterMode ? 'var(--sunstone-text-primary)' : 'var(--sunstone-text-secondary)',
                  fontWeight: !isRegisterMode ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: !isRegisterMode ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: isRegisterMode ? 'var(--sunstone-card-bg)' : 'transparent',
                  color: isRegisterMode ? 'var(--sunstone-text-primary)' : 'var(--sunstone-text-secondary)',
                  fontWeight: isRegisterMode ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isRegisterMode ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserPlus size={15} /> Register
              </button>
            </div>
          )}

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
                  <Key size={13} /> Admin Master Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@sunstone.in"
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
            /* STUDENT LOGIN / REGISTRATION */
            <div className="auth-form-wrapper">
              {/* Google Sign In Button - REAL GOOGLE AUTH ONLY */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="btn-google-auth"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--sunstone-border)',
                  background: 'var(--sunstone-card-bg)',
                  color: 'var(--sunstone-text-primary)',
                  fontWeight: '700',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  marginBottom: googleLoading ? '8px' : '16px',
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
                <span>{googleLoading ? 'Opening Google Sign-In...' : isRegisterMode ? 'Sign up with Google' : 'Continue with Google'}</span>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--sunstone-border)' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or with student email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--sunstone-border)' }} />
              </div>

              <form onSubmit={handleStudentSubmit} className="auth-form">
                {isRegisterMode && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <User size={13} /> Full Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Aryan Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <GraduationCap size={13} /> Enrolled Program *
                      </label>
                      <select
                        className="form-control"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                      >
                        <option value="B.Tech & BCA">B.Tech & BCA (Tech & Engineering)</option>
                        <option value="MBA">MBA (Management & Finance)</option>
                        <option value="BBA">BBA (Business Administration)</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={13} /> Sunstone Student Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="student@sunstone.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={13} /> {isRegisterMode ? 'Create Password (min 4 chars) *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={isRegisterMode ? 'Min 4 characters' : '••••••••••••'}
                    value={password}
                    minLength={4}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary auth-submit-btn"
                >
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>{formLoading ? 'Processing...' : isRegisterMode ? 'Create Student Account' : 'Sign In to Sunstone'}</span>
                </button>

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
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
