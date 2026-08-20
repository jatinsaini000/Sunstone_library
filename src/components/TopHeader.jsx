import React from 'react';
import { Search, GraduationCap, User, Tag, ShieldCheck, LogOut } from 'lucide-react';

export default function TopHeader({
  user,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onLogout,
  currentView,
  setCurrentView
}) {
  const userName = user ? user.name.split(' ')[0] : '';
  const userProgram = user ? (user.program === 'All Programs' ? 'Sunstone Admin' : user.program) : '';

  const popularTags = [
    { label: 'Python', query: 'Python' },
    { label: 'FinTech', query: 'Finance' },
    { label: 'React & Web', query: 'React' },
    { label: 'Deep Learning', query: 'AI' },
    { label: 'Case Studies', query: 'Case Studies' },
    { label: 'Research Journals', query: 'Journals' }
  ];

  return (
    <header className="top-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '20px' }}>
        <div className="greeting-text">
          <h1>
            {user ? (
              <>Hello, {userName} <span style={{ fontSize: '24px' }}>🌟</span></>
            ) : (
              <>Sunstone Library <span style={{ fontSize: '24px' }}>📚</span></>
            )}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '580px' }}>
          {/* Global Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sunstone-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search books by title, author, course (MBA, B.Tech CS, BCA) or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '30px', paddingLeft: '40px', background: 'var(--sunstone-card-bg)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--sunstone-text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Header Navigation & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Admin Portal Button */}
          <button
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '20px',
              background: currentView === 'admin' ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
              color: currentView === 'admin' ? '#ffffff' : 'var(--sunstone-text-primary)',
              border: '1px solid var(--sunstone-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setCurrentView('admin')}
            title="Access Prayas Lab Admin Portal"
          >
            <ShieldCheck size={14} color={currentView === 'admin' ? '#ffffff' : 'var(--accent-blue)'} />
            <span>Admin Portal</span>
          </button>

          {/* Logged In User State vs Login Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => {
                  if (user.role === 'student') setCurrentView('profile');
                  else setCurrentView('admin');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--sunstone-card-bg)',
                  border: '1px solid var(--sunstone-border)',
                  borderRadius: '25px',
                  padding: '4px 12px 4px 6px',
                  cursor: 'pointer'
                }}
                title="View Profile & Bookshelf"
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: user.role === 'admin' ? 'var(--accent-sunstone-red)' : 'var(--accent-blue)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sunstone-text-primary)', lineHeight: 1.1 }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--sunstone-text-muted)', fontWeight: '600' }}>
                    {userProgram}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '20px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '12px', borderRadius: '20px' }}
              onClick={onOpenAuth}
            >
              <User size={13} /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Popular Clickable Interest Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sunstone-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tag size={12} /> Popular Topics:
        </span>
        {popularTags.map((tag) => {
          const isSelected = searchQuery.toLowerCase() === tag.query.toLowerCase();
          return (
            <button
              key={tag.label}
              onClick={() => setSearchQuery(isSelected ? '' : tag.query)}
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                border: isSelected ? '1px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
                background: isSelected ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
                color: isSelected ? '#ffffff' : 'var(--sunstone-text-secondary)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              #{tag.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
