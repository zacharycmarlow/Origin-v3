import { useUser, useClerk } from "@clerk/react";
import { useLocation } from "wouter";

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

interface AuthBarProps {
  onMigrate?: () => void;
  hasMigrationPrompt?: boolean;
}

export default function AuthBar({ onMigrate, hasMigrationPrompt }: AuthBarProps) {
  const { user, isLoaded } = useUser();
  const { openSignIn, signOut } = useClerk();
  const [, setLocation] = useLocation();

  if (!isLoaded) return null;

  if (!user) {
    return (
      <button
        className="auth-btn auth-btn--signin"
        onClick={() => openSignIn({ fallbackRedirectUrl: `${basePath}/` })}
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

  const initials = user.firstName
    ? user.firstName[0]
    : (user.primaryEmailAddress?.emailAddress[0] ?? "?");

  return (
    <div className="auth-user">
      {hasMigrationPrompt && onMigrate && (
        <button className="auth-migrate-pill" onClick={onMigrate} title="Save your local journey to your account">
          save journey
        </button>
      )}
      <button
        className="auth-avatar"
        title={`Signed in as ${user.primaryEmailAddress?.emailAddress ?? user.firstName}`}
        onClick={() => {
          if (confirm("Sign out of The Origin?")) {
            signOut(() => setLocation("/"));
          }
        }}
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={initials} className="auth-avatar-img" />
        ) : (
          <span className="auth-avatar-initials">{initials.toUpperCase()}</span>
        )}
      </button>
    </div>
  );
}
