import React from 'react';
import { Home, Bookmark, Sun, Moon, LogOut, User, Send, BarChart2, ShieldCheck } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';

export default function Sidebar({
  user,
  currentView,
  setCurrentView,
  theme,
  setTheme,
  onOpenAuth,
  onLogout,
  setProfileSubTab
}) {
  return (
    <aside className="sunstone-sidebar">
      {/* Official Sunstone Brand Header */}
      <div className="sidebar-header" onClick={() => setCurrentView('catalog')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo" style={{ background: '#ffffff', padding: '4px' }}>
          <SunstoneLogo size={28} color="#16203b" />
        </div>
        <div className="sidebar-brand-text">Sunstone</div>
      </div>

      {/* Main Navigation Menu */}
      <div className="sidebar-nav">
        <div className="sidebar-section-title">LIBRARY PORTAL</div>
        <button
          className={`sidebar-link ${currentView === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentView('catalog')}
        >
          <Home size={18} />
          <span>Home Catalog</span>
        </button>

        {user && user.role === 'admin' && (
          <button
            className={`sidebar-link ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            <ShieldCheck size={18} color={currentView === 'admin' ? 'var(--accent-sunstone-red)' : '#94a3b8'} />
            <span>Admin Portal</span>
          </button>
        )}

        {user && user.role === 'student' && (
          <>
            <button
              className={`sidebar-link ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('profile');
                if (setProfileSubTab) setProfileSubTab('shelf');
              }}
            >
              <Bookmark size={18} />
              <span>My Shelf & Notes</span>
            </button>

            <button
              className="sidebar-link"
              onClick={() => {
                setCurrentView('profile');
                if (setProfileSubTab) setProfileSubTab('requests');
              }}
            >
              <Send size={18} />
              <span>My Borrow Requests</span>
            </button>

            <button
              className="sidebar-link"
              onClick={() => {
                setCurrentView('profile');
                if (setProfileSubTab) setProfileSubTab('notes');
              }}
            >
              <BarChart2 size={18} />
              <span>Reading Analytics</span>
            </button>
          </>
        )}

        <div className="sidebar-section-title">PREFERENCES</div>
        <button className="sidebar-link" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Sunstone Light Mode' : 'Netflix Dark Mode'}</span>
        </button>
      </div>

      {/* User Footer */}
      <div className="sidebar-user-footer">
        {user ? (
          <>
            {user.photoUrl || user.photoURL ? (
              <img
                src={user.photoUrl || user.photoURL}
                alt={user.displayName || user.name || 'User'}
                className="user-avatar-circle"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="user-avatar-circle">
                {(user.displayName || user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-info-text">
              <div className="user-info-name">{user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'User')}</div>
              <div className="user-info-role">{user.program || user.academic?.program || user.role}</div>
            </div>
            <button
              onClick={onLogout}
              style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '4px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px' }}
          >
            <User size={14} /> Sign In with Google
          </button>
        )}
      </div>
    </aside>
  );
}
