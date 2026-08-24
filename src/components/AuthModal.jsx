import React, { useState } from 'react';
import { X, User, Lock, Mail, GraduationCap, ShieldCheck, Key } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';

export default function AuthModal({ onClose, onLoginSuccess, onRegisterSuccess, onAdminLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isAdminLoginMode, setIsAdminLoginMode] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [program, setProgram] = useState('B.Tech CS');

  // Secure Admin Credentials from Environment with safe defaults
  const SECURE_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@sunstone.in').toLowerCase().trim();
  const SECURE_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'SunstoneAdmin2026!';

  // Admin Specific Fields
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      onRegisterSuccess({
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'student',
        program,
        status: 'Active'
      });
    } else {
      if (email.trim().toLowerCase() === SECURE_ADMIN_EMAIL && password === SECURE_ADMIN_PASSWORD) {
        onAdminLoginSuccess({
          id: 'usr_admin',
          name: 'Prayas Lab Admin',
          email: SECURE_ADMIN_EMAIL,
          role: 'admin',
          program: 'All Programs'
        });
      } else {
        onLoginSuccess({
          id: 'usr_' + Date.now(),
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: 'student',
          program: 'B.Tech CS'
        });
      }
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminId.trim().toLowerCase() === SECURE_ADMIN_EMAIL && adminPass === SECURE_ADMIN_PASSWORD) {
      onAdminLoginSuccess({
        id: 'usr_admin',
        name: 'Prayas Lab Admin',
        email: SECURE_ADMIN_EMAIL,
        role: 'admin',
        program: 'All Programs'
      });
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid administrative credentials. Access restricted to authorized library coordinators.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card bottom-sheet-modal" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        {/* Mobile Drag Handle */}
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
                className="btn-primary auth-submit-btn admin-theme"
              >
                <ShieldCheck size={16} /> Authenticate Admin Access
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
                  ← Back to Student Login
                </button>
              </div>
            </form>
          ) : (
            /* STUDENT LOGIN / REGISTRATION FORM */
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
                      <option value="B.Tech CS">B.Tech CS (Computer Science)</option>
                      <option value="MBA">MBA (Management & Finance)</option>
                      <option value="BCA">BCA (Software Development)</option>
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
                  placeholder="student@sunstone.edu.in"
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
                  <Lock size={13} /> Password *
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
              >
                {isRegisterMode ? 'Complete Registration' : 'Sign In to Sunstone'}
              </button>

              <div className="auth-mode-toggle">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMsg('');
                  }}
                  className="auth-toggle-link"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Register as Student"}
                </button>
              </div>

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
          )}
        </div>
      </div>
    </div>
  );
}
