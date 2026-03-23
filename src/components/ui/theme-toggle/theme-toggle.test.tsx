import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './theme-toggle';

const mockToggleTheme = vi.fn();

vi.mock('../../../hooks/theme/useTheme', () => ({
  useTheme: vi.fn(() => ({
    toggleTheme: mockToggleTheme,
    isDark: false,
  })),
}));

import { useTheme } from '../../../hooks/theme/useTheme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTheme).mockReturnValue({
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
      isDark: false,
      isLight: true,
      theme: 'light',
    });
  });

  test('renders a button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('shows "Switch to dark mode" label in light mode', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByLabelText('Switch to dark mode')
    ).toBeInTheDocument();
  });

  test('shows "Switch to light mode" label in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
      isDark: true,
      isLight: false,
      theme: 'dark',
    });

    render(<ThemeToggle />);
    expect(
      screen.getByLabelText('Switch to light mode')
    ).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('renders moon icon in light mode', () => {
    render(<ThemeToggle />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('text-gray-700');
  });

  test('renders sun icon in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
      isDark: true,
      isLight: false,
      theme: 'dark',
    });

    render(<ThemeToggle />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('text-yellow-500');
  });
});
