import React from 'react';
import { Layers, GraduationCap, Code, Server, Briefcase, Sparkles, BookOpenCheck } from 'lucide-react';

export default function ProgramTabs({ selectedProgram, setSelectedProgram, counts }) {
  const programs = [
    { id: 'All Programs', label: 'All Programs', icon: Layers },
    { id: 'MBA', label: 'MBA', icon: GraduationCap },
    { id: 'B.Tech CS', label: 'B.Tech CS', icon: Code },
    { id: 'BCA', label: 'BCA', icon: Server },
    { id: 'BBA', label: 'BBA', icon: Briefcase },
    { id: 'Special Collections', label: 'Special Collections', icon: Sparkles },
    { id: 'Journals', label: 'Journals', icon: BookOpenCheck }
  ];

  return (
    <div style={{ margin: '0 32px 28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        overflowX: 'auto',
        padding: '6px 4px 12px'
      }}>
        {programs.map((p) => {
          const Icon = p.icon;
          const isActive = selectedProgram === p.id;
          const count = counts[p.id] || 0;

          return (
            <button
              key={p.id}
              onClick={() => setSelectedProgram(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '30px',
                border: isActive ? '2px solid var(--sunstone-navy-dark)' : '1px solid var(--sunstone-border)',
                background: isActive ? 'var(--sunstone-navy-dark)' : 'var(--sunstone-card-bg)',
                color: isActive ? '#ffffff' : 'var(--sunstone-text-primary)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 15px rgba(22, 32, 59, 0.25)' : 'var(--shadow-card)',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#ffffff' : 'var(--accent-blue)'} />
              <span>{p.label}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '12px',
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(37, 99, 235, 0.1)',
                color: isActive ? '#ffffff' : 'var(--accent-blue)',
                marginLeft: '2px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
