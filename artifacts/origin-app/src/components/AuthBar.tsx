import { useAuth } from '../auth/AuthContext';

interface AuthBarProps {
  onMigrate?: () => void;
  hasMigrationPrompt?: boolean;
}

export default function AuthBar({ onMigrate, hasMigrationPrompt }: AuthBarProps) {
  const { ready, authenticated, user, login, logout } = useAuth();

  if (!ready) return null;

  if (!authenticated || !user) {
    return (
      <button
        className="auth-btn auth-btn--signin"
        onClick={login}
        title="Sign in to save your journey"
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M2 17c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span>sign in</span>
        {hasMigrationPrompt && <span className="auth-migrate-dot" />}
      </button>
    );
  }

  const initials = (user.name || user.email || user.phone || '?')[0]?.toUpperCase() || '?';

  return (
    <div className="auth-user">
      {hasMigrationPrompt && onMigrate && (
        <button className="auth-migrate-pill" onClick={onMigrate} title="Save your local journey to your account">
          save journey
        </button>
      )}
      <button
        className="auth-avatar"
        title={`Signed in as ${user.email || user.phone || user.name}`}
        onClick={() => {
          if (confirm('Sign out of The Origin?')) {
            logout();
          }
        }}
      >
        <span className="auth-avatar-initials">{initials}</span>
      </button>
    </div>
  );
}
