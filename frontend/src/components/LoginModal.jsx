import React, { useEffect, useRef, useState } from 'react';

// Accessible modal with backdrop, focus trap, ARIA, and screen reader announcements
export default function LoginModal({ open, onClose, onGuest, onOpenRegister, onOpenLogin }) {
  const modalRef = useRef(null);
  const firstBtnRef = useRef(null);
  const lastBtnRef = useRef(null);
  const srAnnounceRef = useRef(null);
  const [hasAnnounced, setHasAnnounced] = useState(false);

  useEffect(() => {
    if (!open) {
      setHasAnnounced(false);
      return;
    }
    firstBtnRef.current?.focus();
    // Announce only once per open
    if (!hasAnnounced && srAnnounceRef.current) {
      srAnnounceRef.current.textContent = 'Login dialog opened.';
      setHasAnnounced(true);
      setTimeout(() => {
        if (srAnnounceRef.current) srAnnounceRef.current.textContent = '';
      }, 1200);
    }
    // Focus trap
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    modalRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown);
      if (srAnnounceRef.current) srAnnounceRef.current.textContent = '';
    };
  }, [open, onClose, hasAnnounced]);

  // Remove announce effect, now handled in main effect above

  if (!open) return null;

  return (
    <div
      id="login-backdrop"
      role="presentation"
      aria-hidden={!open}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}
      onClick={(e) => { if (e.target.id === 'login-backdrop') onClose(); }}
    >
      <section
        id="login-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        aria-describedby="login-desc"
        tabIndex={-1}
        style={{ background: '#fff', padding: 24, borderRadius: 8, width: 'min(560px, 95%)' }}
      >
        <h2 id="login-title">Welcome to ChatApp</h2>
        <p id="login-desc">Sign in to save conversations, or continue as a guest to try the chat.</p>

        <nav aria-label="Login options" style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button ref={firstBtnRef} onClick={onOpenLogin} className="btn btn-primary" aria-label="Sign in with your account">Sign In</button>
            <button onClick={onOpenRegister} className="btn btn-outline-primary" aria-label="Register a new account">Register</button>
          </div>
          <div>
            <button onClick={onGuest} className="btn btn-secondary" aria-label="Continue as guest user">Continue as Guest</button>
          </div>
        </nav>

        <div style={{ marginTop: 12 }}>
          <button ref={lastBtnRef} onClick={onClose} className="btn btn-link" aria-label="Close login dialog">Close</button>
        </div>
  <div ref={srAnnounceRef} className="sr-only" aria-live="polite"></div>
      </section>
    </div>
  );
}
