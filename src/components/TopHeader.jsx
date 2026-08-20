import React from 'react';
import { Search, GraduationCap, User, Tag } from 'lucide-react';

export default function TopHeader({
  user,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onSwitchUserRole,
  currentView,
  setCurrentView
}) {
  const userName = user ? user.name.split(' ')[0] : 'Jatin';
  const userProgram = user ? (user.program === 'All Programs' ? 'BTECH CS' : user.program) : 'BTECH';

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
            Hello, {userName} <span style={{ fontSize: '24px' }}>🌟</span>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Student Profile Quick Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--sunstone-card-bg)',
            border: '1px solid var(--sunstone-border)',
            borderRadius: '30px',
            padding: '3px'
          }}>
            <button
              onClick={() => onSwitchUserRole('student1')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: 'none',
                background: user && user.id === 'usr_student1' ? 'var(--sunstone-navy-dark)' : 'transparent',
                color: user && user.id === 'usr_student1' ? '#ffffff' : 'var(--sunstone-text-secondary)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Switch to Student Jatin (B.Tech CS)"
            >
              <GraduationCap size={13} /> Jatin (B.Tech)
            </button>

            <button
              onClick={() => onSwitchUserRole('student2')}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: 'none',
                background: user && user.id === 'usr_student2' ? 'var(--sunstone-navy-dark)' : 'transparent',
                color: user && user.id === 'usr_student2' ? '#ffffff' : 'var(--sunstone-text-secondary)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Switch to Student Ananya (MBA)"
            >
              <GraduationCap size={13} /> Ananya (MBA)
            </button>
          </div>

          <div className="student-badge-pill">
            <span>{userProgram} · 2023–27</span>
          </div>

          <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={onOpenAuth}>
            <User size={13} /> Login
          </button>
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
