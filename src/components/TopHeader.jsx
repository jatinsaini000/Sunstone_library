import React from 'react';
import { Search, User, Tag, LogOut, Sun, Moon, MapPin, X } from 'lucide-react';
import SunstoneLogo from './SunstoneLogo.jsx';

export default function TopHeader({
  user,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onLogout,
  currentView,
  setCurrentView,
  theme,
  setTheme,
  setSelectedProgram
}) {
  const userName = user ? user.name.split(' ')[0] : '';
  const userProgram = user ? (user.program === 'All Programs' ? 'Sunstone Admin' : user.program) : '';

  const popularTags = [
    { label: 'Python', query: 'Python' },
    { label: 'FinTech', query: 'Finance' },
    { label: 'React & Web', query: 'React' },
    { label: 'Deep Learning', query: 'AI' },
    { label: 'Case Studies', query: 'Case Studies' },
    { label: 'Research Journals', query: 'Journals' },
    { label: 'Algorithms', query: 'Algorithms' },
    { label: 'Marketing', query: 'Marketing' }
  ];

  return (
    <header className="top-header">
      {/* Top Bar: Brand, Campus Location Pill & Actions */}
      <div className="header-top-row">
        {/* Left: Mobile Brand & Location Pill */}
        <div className="header-brand-wrap" onClick={() => setCurrentView('catalog')}>
          <div className="mobile-brand-icon">
            <SunstoneLogo size={24} color="#16203b" />
          </div>
          <div className="header-location-box">
            <div className="location-pill">
              <MapPin size={12} color="var(--accent-sunstone-red)" />
              <span>Prayas Lab</span>
              <span className="live-dot"></span>
            </div>
            <h1 className="header-title">
              {user ? (
                <>Hey, {userName} <span className="wave-hand">👋</span></>
              ) : (
                <>Sunstone Library <span className="wave-hand">📚</span></>
              )}
            </h1>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="header-actions-wrap">
          {/* Theme Switcher Button */}
          {setTheme && (
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}



          {/* User Profile Pill or Login CTA */}
          {user ? (
            <div className="user-header-profile-wrap">
              <div
                className="user-profile-chip"
                onClick={() => {
                  if (user.role === 'student') setCurrentView('profile');
                  else setCurrentView('admin');
                }}
                title="View Profile & Bookshelf"
              >
                <div
                  className="user-avatar-mini"
                  style={{
                    background: user.role === 'admin' ? 'var(--accent-sunstone-red)' : 'var(--accent-blue)'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-chip-info">
                  <span className="user-chip-name">{user.name}</span>
                  <span className="user-chip-sub">{userProgram || user.role}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                className="header-logout-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-primary header-login-btn"
              onClick={onOpenAuth}
            >
              <User size={13} /> <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Full-width Swiggy/Zomato Search Bar */}
      <div className="header-search-container">
        <div className="search-bar-inner">
          <Search size={17} className="search-bar-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search books, authors, courses (MBA, CS, BCA)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'catalog') setCurrentView('catalog');
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Swiggy/Zomato Style Horizontal Scrollable Topic Pills */}
      <div className="popular-topics-scroller">
        <div className="popular-topics-label">
          <Tag size={12} />
          <span>TOPICS</span>
        </div>
        <div className="topics-chips-list">
          {popularTags.map((tag) => {
            const isSelected = searchQuery.toLowerCase() === tag.query.toLowerCase();
            return (
              <button
                type="button"
                key={tag.label}
                onClick={() => {
                  if (currentView !== 'catalog') setCurrentView('catalog');
                  if (setSelectedProgram) setSelectedProgram('All Programs');
                  setSearchQuery(isSelected ? '' : tag.query);
                }}
                className={`topic-chip ${isSelected ? 'active' : ''}`}
              >
                #{tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
