import React from 'react';
import { Layers, GraduationCap, Code, Server, Briefcase, Sparkles, BookOpenCheck } from 'lucide-react';

export default function ProgramTabs({ selectedProgram, setSelectedProgram, counts = {} }) {
  const programs = [
    { id: 'All Programs', label: 'All Programs', icon: Layers, color: '#2563eb' },
    { id: 'MBA', label: 'MBA', icon: GraduationCap, color: '#f59e0b' },
    { id: 'B.Tech & BCA', label: 'B.Tech & BCA', icon: Code, color: '#10b981' },
    { id: 'BBA', label: 'BBA', icon: Briefcase, color: '#8b5cf6' },
    { id: 'Special Collections', label: 'Prayas AI Lab', icon: Sparkles, color: '#ff4d5a' },
    { id: 'Journals', label: 'Journals', icon: BookOpenCheck, color: '#ec4899' }
  ];

  return (
    <div id="programs-section" className="programs-scroller-wrap">
      <div className="programs-header-mobile">
        <span className="programs-mobile-title">EXPLORE BY PROGRAM</span>
        <span className="programs-mobile-sub">Curated Sunstone Syllabi</span>
      </div>
      <div className="programs-track">
        {programs.map((p) => {
          const Icon = p.icon;
          const isActive = selectedProgram === p.id;
          const count = counts[p.id] || 0;

          return (
            <button
              type="button"
              key={p.id}
              onClick={() => setSelectedProgram(p.id)}
              className={`program-pill ${isActive ? 'active' : ''}`}
            >
              <div
                className="program-pill-icon"
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : `rgba(37, 99, 235, 0.1)`,
                  color: isActive ? '#ffffff' : (p.color || 'var(--accent-blue)')
                }}
              >
                <Icon size={16} />
              </div>
              <span className="program-pill-label">{p.label}</span>
              <span className={`program-pill-count ${isActive ? 'active' : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
