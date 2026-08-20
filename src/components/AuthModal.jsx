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
      // Check if user is logging in as admin through main login form
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
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ padding: '32px', background: 'var(--sunstone-card-bg)' }}>
          {/* Header Icon */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: isAdminLoginMode ? 'var(--accent-sunstone-red)' : '#ffffff',
              border: isAdminLoginMode ? 'none' : '1px solid var(--sunstone-border)',
              boxShadow: 'var(--shadow-card)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              {isAdminLoginMode ? (
                <ShieldCheck size={28} />
              ) : (
                <SunstoneLogo size={32} color="#16203b" />
              )}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--sunstone-text-primary)' }}>
              {isAdminLoginMode ? 'Prayas Lab Admin Portal' : isRegisterMode ? 'Student Registration' : 'Sunstone Student Login'}
            </h2>
            <p style={{ color: 'var(--sunstone-text-secondary)', fontSize: '13px' }}>
              {isAdminLoginMode ? 'Restricted administrative authentication' : 'Sunstone Prayas Lab Digital Library'}
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          {isAdminLoginMode ? (
            <form onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label className="form-label">Admin Email / ID</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@sunstone.in"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px', background: 'var(--accent-sunstone-red)' }}>
                <Key size={16} /> Authenticate Admin Console
              </button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsAdminLoginMode(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--sunstone-text-secondary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ← Back to Student Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStudentSubmit}>
              {isRegisterMode && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@sunstone.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isRegisterMode && (
                <div className="form-group">
                  <label className="form-label">Institute Academic Program</label>
                  <select
                    className="form-control"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    <option value="MBA">MBA</option>
                    <option value="B.Tech CS">B.Tech CS</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px', background: 'var(--sunstone-navy-dark)' }}>
                {isRegisterMode ? 'Create Student Account' : 'Sign In'}
              </button>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--sunstone-text-muted)' }}>
                {isRegisterMode ? 'Already registered? ' : 'New to Prayas Library? '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-sunstone-red)', fontWeight: '800', cursor: 'pointer' }}
                >
                  {isRegisterMode ? 'Sign In Here' : 'Register Account'}
                </button>
              </div>

              {/* Discrete Secret Admin Login Link */}
              <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--sunstone-border)', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsAdminLoginMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--sunstone-text-muted)',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Restricted Admin Login"
                >
                  <ShieldCheck size={12} /> Admin Access
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
