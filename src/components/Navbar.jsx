import React from 'react';
import { BookOpen, Search, User, ShieldCheck, Sun, Moon, LogOut, Bookmark } from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  searchQuery,
  setSearchQuery,
  currentView,
  setCurrentView,
  theme,
  setTheme
}) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="navbar">
      {/* Brand Logo & Name */}
      <div className="brand-container" onClick={() => setCurrentView('catalog')}>
        <div className="brand-logo">S</div>
        <div className="brand-text">
          <h1>Sunstone Library</h1>
          <div className="brand-tag">⚡ Prayas Lab Innovation</div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search books by title, author, program, or interest (e.g. AI, Finance, Java)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Actions & Navigation */}
      <div className="nav-actions">
        {/* Theme Toggle */}
        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* View Switchers */}
        <button
          className={`btn-secondary ${currentView === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentView('catalog')}
        >
          <BookOpen size={16} /> Catalog
        </button>

        {user && user.role === 'student' && (
          <button
            className={`btn-secondary ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            <Bookmark size={16} /> My Shelf
          </button>
        )}

        <button
          className={`btn-secondary ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentView('admin')}
          style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--accent-prayas)' }}
        >
          <ShieldCheck size={16} /> Admin Console
        </button>

        {/* User Account / Login */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {user.name} ({user.role})
            </span>
            <button className="btn-icon" onClick={onLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            <User size={16} /> Login / Register
          </button>
        )}
      </div>
    </header>
  );
}
