import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  test('should debounce string value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });

    // Value should still be the old one before delay
    expect(result.current).toBe('initial');

    // Fast-forward time by 499ms (just before delay)
    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(result.current).toBe('initial');

    // Fast-forward time by 1ms more (completing the delay)
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  test('should debounce number value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 10, delay: 300 } }
    );

    expect(result.current).toBe(10);

    rerender({ value: 20, delay: 300 });
    expect(result.current).toBe(10);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(20);
  });

  test('should debounce object value changes', () => {
    const initialObj = { name: 'John', age: 30 };
    const updatedObj = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj, delay: 200 });
    expect(result.current).toBe(initialObj);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(updatedObj);
  });

  test('should reset timer when value changes before delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // First change
    rerender({ value: 'second', delay: 500 });
    expect(result.current).toBe('first');

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('first');

    // Second change before first delay completes
    rerender({ value: 'third', delay: 500 });
    expect(result.current).toBe('first');

    // Advance time by the full delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have the latest value, not the intermediate one
    expect(result.current).toBe('third');
  });

  test('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change value and delay
    rerender({ value: 'updated', delay: 200 });
    expect(result.current).toBe('initial');

    // Advance by the new delay amount
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  test('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 0 });
    expect(result.current).toBe('initial');

    // Even with 0 delay, it should update after next tick
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  test('should handle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 1, delay: 100 } }
    );

    expect(result.current).toBe(1);

    // Rapid changes
    rerender({ value: 2, delay: 100 });
    rerender({ value: 3, delay: 100 });
    rerender({ value: 4, delay: 100 });
    rerender({ value: 5, delay: 100 });

    // Should still be initial value
    expect(result.current).toBe(1);

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have the final value
    expect(result.current).toBe(5);
  });

  test('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  test('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: true, delay: 150 } }
    );

    expect(result.current).toBe(true);

    rerender({ value: false, delay: 150 });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe(false);
  });

  test('should handle undefined and null values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string | null | undefined; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: undefined as string | null | undefined, delay: 100 } }
    );

    expect(result.current).toBe(undefined);

    rerender({ value: null as string | null | undefined, delay: 100 });
    expect(result.current).toBe(undefined);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(null);
  });
});