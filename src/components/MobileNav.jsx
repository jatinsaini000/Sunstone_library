import React from 'react';
import { Home, Bookmark, Send, ShieldCheck, User } from 'lucide-react';

export default function MobileNav({
  currentView,
  setCurrentView,
  profileSubTab,
  setProfileSubTab,
  user,
  onOpenAuth,
  savedCount = 0,
  requestCount = 0
}) {
  const isCatalog = currentView === 'catalog';
  const isShelf = currentView === 'profile' && profileSubTab === 'shelf';
  const isRequests = currentView === 'profile' && profileSubTab === 'requests';
  const isProfileOrAdmin = currentView === 'admin' || (currentView === 'profile' && profileSubTab === 'notes');

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Explore / Home */}
      <button
        type="button"
        className={`mobile-nav-item ${isCatalog ? 'active' : ''}`}
        onClick={() => {
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <div className="mobile-nav-icon-box">
          <Home size={20} />
        </div>
        <span className="mobile-nav-label">Explore</span>
      </button>



      {/* 3. My Shelf (with saved count badge) */}
      <button
        type="button"
        className={`mobile-nav-item ${isShelf ? 'active' : ''}`}
        onClick={() => {
          if (!user) {
            onOpenAuth();
          } else {
            setCurrentView('profile');
            if (setProfileSubTab) setProfileSubTab('shelf');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        <div className="mobile-nav-icon-box">
          <Bookmark size={20} />
          {savedCount > 0 && (
            <span className="mobile-nav-badge">{savedCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">My Shelf</span>
      </button>

      {/* 4. Requests */}
      <button
        type="button"
        className={`mobile-nav-item ${isRequests ? 'active' : ''}`}
        onClick={() => {
          if (!user) {
            onOpenAuth();
          } else {
            setCurrentView('profile');
            if (setProfileSubTab) setProfileSubTab('requests');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        <div className="mobile-nav-icon-box">
          <Send size={20} />
          {requestCount > 0 && (
            <span className="mobile-nav-badge warning">{requestCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Requests</span>
      </button>

      {/* 5. Account / Admin Portal */}
      <button
        type="button"
        className={`mobile-nav-item ${isProfileOrAdmin ? 'active' : ''}`}
        onClick={() => {
          if (!user) {
            onOpenAuth();
          } else if (user.role === 'admin') {
            setCurrentView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setCurrentView('profile');
            if (setProfileSubTab) setProfileSubTab('notes');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        <div className="mobile-nav-icon-box">
          {user && user.role === 'admin' ? (
            <ShieldCheck size={20} />
          ) : (
            <User size={20} />
          )}
        </div>
        <span className="mobile-nav-label">
          {!user ? 'Login' : user.role === 'admin' ? 'Admin' : 'Account'}
        </span>
      </button>
    </nav>
  );
}
