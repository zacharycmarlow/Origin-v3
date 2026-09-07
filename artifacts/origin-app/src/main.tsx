import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";
import { ErrorBoundary } from "react-error-boundary";
import { lazy, Suspense } from "react";
import App from "./App";
import "./index.css";

const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

// Only use an explicitly configured key. Deriving one from the hostname
// (e.g. localhost) synthesizes something that looks valid enough for
// ClerkProvider to attempt loading clerk.localhost's script, which does
// not exist in local dev and throws on every render. With no real key,
// ClerkProvider stays inert (its hooks still work, just signed-out) and
// the app runs in guest mode, which is already the local source of truth.
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignOutUrl={`${basePath}/`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/sign-in/*?" component={() => <Suspense fallback={null}><SignInPage /></Suspense>} />
        <Route path="/sign-up/*?" component={() => <Suspense fallback={null}><SignUpPage /></Suspense>} />
        <Route component={App} />
      </Switch>
    </ClerkProvider>
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
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  </ErrorBoundary>,
);
