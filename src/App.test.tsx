import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// --- Mocks ---

vi.mock('./hooks/db/useDB', () => ({
  useDB: vi.fn(() => ({ isDBReady: true, dbError: null })),
}));

vi.mock('./hooks/theme/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
    isDark: false,
    isLight: true,
  })),
}));

vi.mock('./utils/local-storage', () => ({
  LocalStorage: {
    get: vi.fn(() => true), // onboardingComplete = true by default
    set: vi.fn(),
  },
}));

vi.mock('./components/layout/landing/landing', () => ({
  default: () => <div data-testid="landing">Landing</div>,
}));

vi.mock('./components/layout/onboarding/onboarding', () => ({
  default: ({ setOnboardingComplete }: { setOnboardingComplete: (v: boolean) => void }) => (
    <div data-testid="onboarding">
      <button onClick={() => setOnboardingComplete(true)}>Complete</button>
    </div>
  ),
}));

vi.mock('./components/layout/header/header', () => ({
  default: ({ onboardingComplete }: { onboardingComplete: boolean }) => (
    <header data-testid="header" data-onboarding={String(onboardingComplete)}>
      Header
    </header>
  ),
}));

vi.mock('./components/ui/loading-stencil/loading-stencil', () => ({
  default: () => <div data-testid="loading-stencil">Loading...</div>,
}));

vi.mock('./components/ui/error-screen/error-screen', () => ({
  ErrorScreen: ({ title, message, actionLabel, onAction }: {
    title: string;
    message: string;
    actionLabel: string;
    onAction: () => void;
  }) => (
    <div data-testid="error-screen">
      <h1>{title}</h1>
      <p>{message}</p>
      <button onClick={onAction}>{actionLabel}</button>
    </div>
  ),
}));

vi.mock('./constants/protected-routes', () => ({
  protectedRoutes: [
    {
      path: '/dashboard',
      element: <div data-testid="dashboard">Dashboard</div>,
    },
  ],
}));

vi.mock('./components/routing/requireOnboarding', () => ({
  RequireOnboarding: ({
    onboardingComplete,
    children,
  }: {
    onboardingComplete: boolean;
    children: React.ReactNode;
  }) => (onboardingComplete ? <>{children}</> : <div data-testid="onboarding-redirect">Redirected</div>),
}));

import { useDB } from './hooks/db/useDB';
import { useTheme } from './hooks/theme/useTheme';
import { LocalStorage } from './utils/local-storage';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDB).mockReturnValue({ isDBReady: true, dbError: null });
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
      isDark: false,
      isLight: true,
    });
    vi.mocked(LocalStorage.get).mockReturnValue(true);
  });

  test('renders landing page at root path', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByTestId('landing')).toBeInTheDocument();
  });

  test('renders header when DB is ready', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('shows loading stencil while DB is not ready', () => {
    vi.mocked(useDB).mockReturnValue({ isDBReady: false, dbError: null });
    render(<App />);

    expect(screen.getByTestId('loading-stencil')).toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  test('shows error screen when DB has an error', () => {
    vi.mocked(useDB).mockReturnValue({ isDBReady: false, dbError: 'Connection failed' });
    render(<App />);

    expect(screen.getByTestId('error-screen')).toBeInTheDocument();
    expect(screen.getByText('Database Error')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  test('renders protected route when onboarding is complete', () => {
    vi.mocked(LocalStorage.get).mockReturnValue(true);
    window.history.pushState({}, '', '/dashboard');
    render(<App />);

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('redirects protected route when onboarding is not complete', () => {
    vi.mocked(LocalStorage.get).mockReturnValue(false);
    window.history.pushState({}, '', '/dashboard');
    render(<App />);

    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    expect(screen.getByTestId('onboarding-redirect')).toBeInTheDocument();
  });

  test('renders onboarding page at /onboarding path', () => {
    window.history.pushState({}, '', '/onboarding');
    render(<App />);

    expect(screen.getByTestId('onboarding')).toBeInTheDocument();
  });

  test('renders 404 for unknown routes', () => {
    window.history.pushState({}, '', '/nonexistent');
    render(<App />);

    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });

  test('passes onboardingComplete to header', () => {
    vi.mocked(LocalStorage.get).mockReturnValue(true);
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-onboarding',
      'true'
    );
  });

  test('applies dark class when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
      isDark: true,
      isLight: false,
    });
    window.history.pushState({}, '', '/');
    const { container } = render(<App />);

    const wrapper = container.querySelector('.dark');
    expect(wrapper).toBeInTheDocument();
  });

  test('does not apply dark class when theme is light', () => {
    window.history.pushState({}, '', '/');
    const { container } = render(<App />);

    // The top-level container should not have the 'dark' class suffix from theme
    const wrapper = container.firstElementChild?.firstElementChild;
    expect(wrapper?.className).not.toContain(' dark');
  });

  test('ErrorFallback renders error message and try again button', () => {
    // Force an error inside AppContent to trigger ErrorBoundary
    vi.mocked(useDB).mockImplementation(() => {
      throw new Error('Boom');
    });

    render(<App />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});
