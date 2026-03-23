import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { useAppDispatch, useAppState } from '../../context/app-state-hooks';
import { ThemeUtils } from '../../utils/theme';

vi.mock('../../context/app-state-hooks', () => ({
  useAppState: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('../../utils/theme', () => ({
  ThemeUtils: {
    getInitialTheme: vi.fn().mockReturnValue('light'),
    applyTheme: vi.fn(),
    saveTheme: vi.fn(),
    toggleTheme: vi.fn(),
    watchSystemTheme: vi.fn().mockReturnValue(vi.fn()),
  },
}));

const mockDispatch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
  vi.mocked(useAppState).mockReturnValue({ theme: 'light' } as ReturnType<typeof useAppState>);
  vi.mocked(ThemeUtils.getInitialTheme).mockReturnValue('light');
  vi.mocked(ThemeUtils.toggleTheme).mockReturnValue('dark');
  vi.mocked(ThemeUtils.watchSystemTheme).mockReturnValue(vi.fn());
});

describe('useTheme', () => {
  describe('return values', () => {
    test('returns theme from state', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
    });

    test('returns isDark false and isLight true for light theme', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(false);
      expect(result.current.isLight).toBe(true);
    });

    test('returns isDark true and isLight false for dark theme', () => {
      vi.mocked(useAppState).mockReturnValue({ theme: 'dark' } as ReturnType<typeof useAppState>);
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    test('returns toggleTheme and setTheme functions', () => {
      const { result } = renderHook(() => useTheme());
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });
  });

  describe('initialization', () => {
    test('calls getInitialTheme on mount', () => {
      renderHook(() => useTheme());
      expect(ThemeUtils.getInitialTheme).toHaveBeenCalledOnce();
    });

    test('applies initial theme on mount', () => {
      renderHook(() => useTheme());
      expect(ThemeUtils.applyTheme).toHaveBeenCalledWith('light');
    });

    test('dispatches SET_THEME if initial theme differs from state', () => {
      vi.mocked(useAppState).mockReturnValue({ theme: 'light' } as ReturnType<typeof useAppState>);
      vi.mocked(ThemeUtils.getInitialTheme).mockReturnValue('dark');

      renderHook(() => useTheme());

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_THEME',
        payload: 'dark',
      });
    });

    test('does not dispatch if initial theme matches state', () => {
      vi.mocked(useAppState).mockReturnValue({ theme: 'light' } as ReturnType<typeof useAppState>);
      vi.mocked(ThemeUtils.getInitialTheme).mockReturnValue('light');

      renderHook(() => useTheme());

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SET_THEME' })
      );
    });
  });

  describe('theme change effect', () => {
    test('applies and saves theme when theme changes', () => {
      vi.mocked(useAppState).mockReturnValue({ theme: 'dark' } as ReturnType<typeof useAppState>);

      renderHook(() => useTheme());

      expect(ThemeUtils.applyTheme).toHaveBeenCalledWith('dark');
      expect(ThemeUtils.saveTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('system theme watcher', () => {
    test('registers system theme watcher on mount', () => {
      renderHook(() => useTheme());
      expect(ThemeUtils.watchSystemTheme).toHaveBeenCalledOnce();
      expect(ThemeUtils.watchSystemTheme).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    test('dispatches SET_THEME when system theme callback fires', () => {
      let capturedCallback: ((theme: 'light' | 'dark') => void) | undefined;
      vi.mocked(ThemeUtils.watchSystemTheme).mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      renderHook(() => useTheme());

      act(() => {
        capturedCallback!('dark');
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_THEME',
        payload: 'dark',
      });
    });

    test('calls cleanup on unmount', () => {
      const cleanupFn = vi.fn();
      vi.mocked(ThemeUtils.watchSystemTheme).mockReturnValue(cleanupFn);

      const { unmount } = renderHook(() => useTheme());
      unmount();

      expect(cleanupFn).toHaveBeenCalledOnce();
    });
  });

  describe('toggleTheme', () => {
    test('dispatches toggled theme', () => {
      vi.mocked(ThemeUtils.toggleTheme).mockReturnValue('dark');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(ThemeUtils.toggleTheme).toHaveBeenCalledWith('light');
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_THEME',
        payload: 'dark',
      });
    });

    test('toggles from dark to light', () => {
      vi.mocked(useAppState).mockReturnValue({ theme: 'dark' } as ReturnType<typeof useAppState>);
      vi.mocked(ThemeUtils.toggleTheme).mockReturnValue('light');
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(ThemeUtils.toggleTheme).toHaveBeenCalledWith('dark');
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_THEME',
        payload: 'light',
      });
    });
  });

  describe('setTheme', () => {
    test('dispatches the provided theme', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_THEME',
        payload: 'dark',
      });
    });

    test('dispatches light theme', () => {
      vi.mocked(useAppState).mockReturnValue({ theme: 'dark' } as ReturnType<typeof useAppState>);
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_THEME',
        payload: 'light',
      });
    });
  });
});
