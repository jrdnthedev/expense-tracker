import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ThemeUtils } from './theme';
import { LocalStorage } from './local-storage';

vi.mock('./local-storage', () => ({
  LocalStorage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('ThemeUtils', () => {
  let matchMediaSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');

    matchMediaSpy = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaSpy,
    });
  });

  describe('getInitialTheme', () => {
    test('returns saved theme from localStorage when it is "dark"', () => {
      vi.mocked(LocalStorage.get).mockReturnValue('dark');

      expect(ThemeUtils.getInitialTheme()).toBe('dark');
    });

    test('returns saved theme from localStorage when it is "light"', () => {
      vi.mocked(LocalStorage.get).mockReturnValue('light');

      expect(ThemeUtils.getInitialTheme()).toBe('light');
    });

    test('falls back to system dark preference when no saved theme', () => {
      vi.mocked(LocalStorage.get).mockReturnValue(null);
      matchMediaSpy.mockReturnValue({ matches: true });

      expect(ThemeUtils.getInitialTheme()).toBe('dark');
      expect(matchMediaSpy).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
    });

    test('falls back to system light preference when no saved theme', () => {
      vi.mocked(LocalStorage.get).mockReturnValue(null);
      matchMediaSpy.mockReturnValue({ matches: false });

      expect(ThemeUtils.getInitialTheme()).toBe('light');
    });

    test('ignores invalid saved values and uses system preference', () => {
      vi.mocked(LocalStorage.get).mockReturnValue('invalid');
      matchMediaSpy.mockReturnValue({ matches: true });

      expect(ThemeUtils.getInitialTheme()).toBe('dark');
    });
  });

  describe('saveTheme', () => {
    test('saves theme to localStorage', () => {
      ThemeUtils.saveTheme('dark');

      expect(LocalStorage.set).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('applyTheme', () => {
    test('adds "dark" class for dark theme', () => {
      ThemeUtils.applyTheme('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('removes "dark" class for light theme', () => {
      document.documentElement.classList.add('dark');

      ThemeUtils.applyTheme('light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    test('toggles light to dark', () => {
      expect(ThemeUtils.toggleTheme('light')).toBe('dark');
    });

    test('toggles dark to light', () => {
      expect(ThemeUtils.toggleTheme('dark')).toBe('light');
    });
  });

  describe('watchSystemTheme', () => {
    test('registers change listener on matchMedia', () => {
      const addEventListener = vi.fn();
      matchMediaSpy.mockReturnValue({
        matches: false,
        addEventListener,
        removeEventListener: vi.fn(),
      });
      const callback = vi.fn();

      ThemeUtils.watchSystemTheme(callback);

      expect(addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    test('cleanup function removes the listener', () => {
      const removeEventListener = vi.fn();
      matchMediaSpy.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener,
      });

      const cleanup = ThemeUtils.watchSystemTheme(vi.fn());
      cleanup();

      expect(removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    test('calls callback with "dark" when system switches to dark and no saved theme', () => {
      let changeHandler: (e: MediaQueryListEvent) => void = () => {};
      matchMediaSpy.mockReturnValue({
        matches: false,
        addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
          changeHandler = fn;
        },
        removeEventListener: vi.fn(),
      });
      vi.mocked(LocalStorage.get).mockReturnValue(null);
      const callback = vi.fn();

      ThemeUtils.watchSystemTheme(callback);
      changeHandler({ matches: true } as MediaQueryListEvent);

      expect(callback).toHaveBeenCalledWith('dark');
    });

    test('calls callback with "light" when system switches to light and no saved theme', () => {
      let changeHandler: (e: MediaQueryListEvent) => void = () => {};
      matchMediaSpy.mockReturnValue({
        matches: true,
        addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
          changeHandler = fn;
        },
        removeEventListener: vi.fn(),
      });
      vi.mocked(LocalStorage.get).mockReturnValue(null);
      const callback = vi.fn();

      ThemeUtils.watchSystemTheme(callback);
      changeHandler({ matches: false } as MediaQueryListEvent);

      expect(callback).toHaveBeenCalledWith('light');
    });

    test('does not call callback when a theme is saved in localStorage', () => {
      let changeHandler: (e: MediaQueryListEvent) => void = () => {};
      matchMediaSpy.mockReturnValue({
        matches: false,
        addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
          changeHandler = fn;
        },
        removeEventListener: vi.fn(),
      });
      vi.mocked(LocalStorage.get).mockReturnValue('light');
      const callback = vi.fn();

      ThemeUtils.watchSystemTheme(callback);
      changeHandler({ matches: true } as MediaQueryListEvent);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
