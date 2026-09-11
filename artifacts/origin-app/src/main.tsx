import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { ErrorBoundary } from "react-error-boundary";
import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { BrowserLLMProvider } from "./api/BrowserLLMProvider";
import { reportWebVitals } from "./lib/webVitals";
import "./i18n";
import "./index.css";

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

// Privy app ID — this is a public client-side identifier, safe to expose.
// The app secret is kept server-side only (in .env, never in frontend code).
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function AppWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <Switch>
      <Route component={App} />
    </Switch>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1510', color: '#e8dcc6', fontFamily: 'Georgia, serif', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
        <svg viewBox="0 0 120 120" width="48" height="48">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#c89838" strokeWidth=".6"/>
          <circle cx="60" cy="60" r="3" fill="#c89838"/>
          <line x1="60" y1="6" x2="60" y2="34" stroke="#c89838" strokeWidth=".6"/>
          <line x1="60" y1="86" x2="60" y2="114" stroke="#c89838" strokeWidth=".6"/>
          <line x1="6" y1="60" x2="34" y2="60" stroke="#c89838" strokeWidth=".6"/>
          <line x1="86" y1="60" x2="114" y2="60" stroke="#c89838" strokeWidth=".6"/>
        </svg>
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.5rem', color: '#c89838' }}>Something broke.</h2>
      <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1.5rem', maxWidth: '28rem', textAlign: 'center' }}>
        The page hit an unexpected error. Your writing is safe — it's saved locally.
      </p>
      <button
        onClick={resetErrorBoundary}
        style={{ background: 'transparent', border: '1px solid #c89838', color: '#c89838', padding: '0.5rem 1.5rem', borderRadius: '2px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}
      >
        try again
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <HelmetProvider>
      <WouterRouter base={basePath}>
        <PrivyProvider
        appId={privyAppId}
        config={{
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
          // Enable email, wallet, and social logins
          loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord', 'apple'],
          appearance: {
            theme: 'dark',
            accentColor: '#c89838',
            loginMessage: 'Sign in to save your journey',
          },
        }}
      >
        <AuthProvider>
          <BrowserLLMProvider>
            <AppWithRoutes />
          </BrowserLLMProvider>
        </AuthProvider>
      </PrivyProvider>
      </WouterRouter>
    </HelmetProvider>
  </ErrorBoundary>,
);

// Report Core Web Vitals in development.
reportWebVitals();
