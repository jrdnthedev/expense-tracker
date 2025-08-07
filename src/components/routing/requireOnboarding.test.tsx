import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RequireOnboarding } from './requireOnboarding';

// Mock Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate" data-to={to} data-replace={replace} />;
    }
  };
});

// Test component to use as children
const TestChild = () => <div data-testid="test-child">Test Content</div>;

describe('RequireOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render children when onboarding is complete', () => {
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={true}>
          <TestChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(getByTestId('test-child')).toBeInTheDocument();
    expect(queryByTestId('navigate')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should redirect to onboarding when onboarding is not complete', () => {
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={false}>
          <TestChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(queryByTestId('test-child')).not.toBeInTheDocument();
    expect(getByTestId('navigate')).toBeInTheDocument();
    expect(getByTestId('navigate')).toHaveAttribute('data-to', '/onboarding');
    expect(getByTestId('navigate')).toHaveAttribute('data-replace', 'true');
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding', true);
  });

  test('should handle complex children element', () => {
    const ComplexChild = () => (
      <div data-testid="complex-child">
        <h1>Dashboard</h1>
        <p>Welcome to the app</p>
        <button>Click me</button>
      </div>
    );

    const { getByTestId } = render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={true}>
          <ComplexChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(getByTestId('complex-child')).toBeInTheDocument();
    expect(getByTestId('complex-child')).toHaveTextContent('Dashboard');
    expect(getByTestId('complex-child')).toHaveTextContent('Welcome to the app');
  });

  test('should redirect with replace flag to prevent back navigation', () => {
    render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={false}>
          <TestChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding', true);
  });

  test('should work with different child components', () => {
    const AnotherChild = () => <span data-testid="another-child">Another component</span>;

    const { getByTestId } = render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={true}>
          <AnotherChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(getByTestId('another-child')).toBeInTheDocument();
    expect(getByTestId('another-child')).toHaveTextContent('Another component');
  });

  test('should handle onboardingComplete prop changes', () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={false}>
          <TestChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    // Initially should redirect
    expect(queryByTestId('test-child')).not.toBeInTheDocument();
    expect(getByTestId('navigate')).toBeInTheDocument();

    // After rerender with onboardingComplete=true, should show children
    rerender(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={true}>
          <TestChild />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(getByTestId('test-child')).toBeInTheDocument();
    expect(queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('should handle JSX element with props', () => {
    const ChildWithProps = ({ title }: { title: string }) => (
      <div data-testid="child-with-props">{title}</div>
    );

    const { getByTestId } = render(
      <MemoryRouter>
        <RequireOnboarding onboardingComplete={true}>
          <ChildWithProps title="Test Title" />
        </RequireOnboarding>
      </MemoryRouter>
    );

    expect(getByTestId('child-with-props')).toBeInTheDocument();
    expect(getByTestId('child-with-props')).toHaveTextContent('Test Title');
  });
});