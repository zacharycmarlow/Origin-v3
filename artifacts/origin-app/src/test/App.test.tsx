import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

/* Mock external dependencies so the smoke test doesn't require
   network access, Privy, or browser AI models. */

vi.mock('@privy-io/react-auth', () => ({
  PrivyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePrivy: () => ({
    ready: true,
    authenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue(null),
  }),
  useLogin: () => ({ login: vi.fn() }),
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    ready: true,
    authenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    getAuthToken: vi.fn().mockResolvedValue(null),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../api/BrowserLLMProvider', () => ({
  BrowserLLMProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../api/readings', () => ({
  fetchMorpho: vi.fn().mockResolvedValue(null),
  fetchSage: vi.fn().mockResolvedValue(null),
  setBrowserLLM: vi.fn(),
}));

vi.mock('../api/userApi', () => ({
  pullAll: vi.fn().mockResolvedValue(null),
  pushAll: vi.fn().mockResolvedValue(null),
  pushSnapshot: vi.fn().mockResolvedValue(null),
  captureLocalSnapshot: vi.fn().mockReturnValue(null),
  hasSubstantialLocalData: vi.fn().mockReturnValue(false),
  setAuthToken: vi.fn(),
}));

vi.mock('../hooks/useUserStorage', () => ({
  useStorageNamespace: vi.fn().mockReturnValue(''),
  migrateGuestToUser: vi.fn(),
}));

import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    // The topbar always renders "THE · ORIGIN" text
    expect(container.textContent).toContain('THE · ORIGIN');
  });
});
