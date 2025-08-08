import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDB } from './useDB';
import { initializeDatabase } from '../../services/init-service/init.service';

// Mock the initialize database service
vi.mock('../../services/init-service/init.service');

const mockInitializeDatabase = vi.mocked(initializeDatabase);

describe('useDB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should initialize with default state', () => {
    mockInitializeDatabase.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useDB());

    expect(result.current.isDBReady).toBe(false);
    expect(result.current.dbError).toBe(null);
  });

  test('should set isDBReady to true when database initializes successfully', async () => {
    mockInitializeDatabase.mockResolvedValue(true);

    const { result } = renderHook(() => useDB());

    await waitFor(() => {
      expect(result.current.isDBReady).toBe(true);
    });

    expect(result.current.dbError).toBe(null);
    expect(mockInitializeDatabase).toHaveBeenCalledOnce();
  });

  test('should set isDBReady to false when database initialization returns false', async () => {
    mockInitializeDatabase.mockResolvedValue(false);

    const { result } = renderHook(() => useDB());

    await waitFor(() => {
      expect(result.current.isDBReady).toBe(false);
    });

    expect(result.current.dbError).toBe(null);
    expect(mockInitializeDatabase).toHaveBeenCalledOnce();
  });

  test('should set dbError when database initialization throws an Error', async () => {
    const errorMessage = 'Database connection failed';
    mockInitializeDatabase.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDB());

    await waitFor(() => {
      expect(result.current.dbError).toBe(errorMessage);
    });

    expect(result.current.isDBReady).toBe(false);
    expect(mockInitializeDatabase).toHaveBeenCalledOnce();
  });

  test('should handle non-Error objects in catch block', async () => {
    mockInitializeDatabase.mockRejectedValue('String error');

    const { result } = renderHook(() => useDB());

    await waitFor(() => {
      expect(result.current.dbError).toBe('Failed to initialize database');
    });

    expect(result.current.isDBReady).toBe(false);
    expect(mockInitializeDatabase).toHaveBeenCalledOnce();
  });

  test('should handle null/undefined rejection', async () => {
    mockInitializeDatabase.mockRejectedValue(null);

    const { result } = renderHook(() => useDB());

    await waitFor(() => {
      expect(result.current.dbError).toBe('Failed to initialize database');
    });

    expect(result.current.isDBReady).toBe(false);
    expect(mockInitializeDatabase).toHaveBeenCalledOnce();
  });

  test('should only call initializeDatabase once on mount', async () => {
    mockInitializeDatabase.mockResolvedValue(true);

    const { rerender } = renderHook(() => useDB());

    // Rerender the hook
    rerender();
    rerender();

    await waitFor(() => {
      expect(mockInitializeDatabase).toHaveBeenCalledTimes(1);
    });
  });

  test('should not change state after component unmounts', async () => {
    mockInitializeDatabase.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );

    const { result, unmount } = renderHook(() => useDB());

    // Unmount immediately
    unmount();

    // Wait a bit to ensure the async operation would have completed
    await new Promise(resolve => setTimeout(resolve, 150));

    // State should remain in initial state since component was unmounted
    expect(result.current.isDBReady).toBe(false);
    expect(result.current.dbError).toBe(null);
  });
});