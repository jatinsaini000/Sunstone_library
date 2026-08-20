import React from 'react';
import { Play, Info, Zap, Sparkles, BookOpen } from 'lucide-react';

export default function HeroBanner({ book, onOpenReader, onOpenQuickSummary }) {
  if (!book) return null;

  return (
    <div className="hero-billboard">
      <img
        src={book.coverUrl}
        alt={book.title}
        className="billboard-bg-img"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80';
        }}
      />
      <div className="billboard-overlay"></div>

      <div className="billboard-content">
        <div className="billboard-tag">
          <Sparkles size={13} /> FEATURED IN PRAYAS LAB • {book.program}
        </div>
        <h2 className="billboard-title">{book.title}</h2>
        <p className="billboard-desc">
          {book.description || 'Essential academic textbook curated for Sunstone scholars with interactive digital reader and personal study note tools.'}
        </p>

        <div className="billboard-actions">
          <button className="btn-play-netflix" onClick={() => onOpenReader(book)}>
            <Play size={18} fill="#0f172a" /> Read Online Now
          </button>
          <button className="btn-info-netflix" onClick={() => onOpenQuickSummary(book)}>
            <Zap size={18} color="var(--accent-gold)" /> Quick Summary & Takeaways
          </button>
        </div>
      </div>
    </div>
  );
}
