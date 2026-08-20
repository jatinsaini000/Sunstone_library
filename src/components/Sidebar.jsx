import React from 'react';
import { Home, Bookmark, Sun, Moon, LogOut, User, Send, BarChart2 } from 'lucide-react';
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
            <div className="user-avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="user-info-text">
              <div className="user-info-name">{user.name}</div>
              <div className="user-info-role">{user.program || user.role}</div>
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
            <User size={14} /> Student Login
          </button>
        )}
      </div>
    </aside>
  );
}
