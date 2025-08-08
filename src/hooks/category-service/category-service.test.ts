import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCategories } from './useCategory';
import { categoryDB } from '../../services/category-service/category.service';
import type { Category } from '../../types/category';

// Mock the category service
vi.mock('../../services/category-service/category.service');

const mockCategoryDB = vi.mocked(categoryDB);

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Food',
    icon: '🍕'
  },
  {
    id: 2,
    name: 'Transport',
    icon: '🚗'
  }
];

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should initialize with loading state and fetch categories successfully', async () => {
    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCategories());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBe(null);
    expect(mockCategoryDB.getCategories).toHaveBeenCalledOnce();
  });

  test('should handle error when fetching categories fails', async () => {
    const errorMessage = 'Failed to fetch categories';
    mockCategoryDB.getCategories.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(mockCategoryDB.getCategories).toHaveBeenCalledOnce();
  });

  test('should add category successfully', async () => {
    const newCategoryId = 3;
    const newCategory: Omit<Category, 'id'> = {
      name: 'Entertainment',
      icon: '🎬'
    };

    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);
    mockCategoryDB.addCategory.mockResolvedValue(newCategoryId);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const returnedId = await result.current.addCategory(newCategory);

    expect(returnedId).toBe(newCategoryId);
    
    await waitFor(() => {
      expect(result.current.categories).toEqual([
        ...mockCategories,
        { ...newCategory, id: newCategoryId }
      ]);
    });
    
    expect(mockCategoryDB.addCategory).toHaveBeenCalledWith(newCategory);
  });

  test('should handle error when adding category fails', async () => {
    const errorMessage = 'Error adding category';
    const newCategory: Omit<Category, 'id'> = {
      name: 'Entertainment',
      icon: '🎬'
    };

    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);
    mockCategoryDB.addCategory.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.addCategory(newCategory)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error adding category');
    });
    
    expect(result.current.categories).toEqual(mockCategories);
  });

  test('should update category successfully', async () => {
    const updatedCategory: Category = {
      ...mockCategories[0],
      name: 'Updated Food',
      icon: '🥗'
    };

    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);
    mockCategoryDB.updateCategory.mockResolvedValue();

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.updateCategory(updatedCategory);

    await waitFor(() => {
      expect(result.current.categories[0]).toEqual(updatedCategory);
      expect(result.current.categories[1]).toEqual(mockCategories[1]);
    });
    
    expect(mockCategoryDB.updateCategory).toHaveBeenCalledWith(updatedCategory);
  });

  test('should handle error when updating category fails', async () => {
    const errorMessage = 'Error updating category';
    const updatedCategory: Category = {
      ...mockCategories[0],
      name: 'Updated Food'
    };

    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);
    mockCategoryDB.updateCategory.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.updateCategory(updatedCategory)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error updating category');
    });
    
    expect(result.current.categories).toEqual(mockCategories);
  });

  test('should delete category successfully', async () => {
    const categoryIdToDelete = 1;

    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);
    mockCategoryDB.deleteCategory.mockResolvedValue();

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.deleteCategory(categoryIdToDelete);

    await waitFor(() => {
      expect(result.current.categories).toEqual([mockCategories[1]]);
    });
    
    expect(mockCategoryDB.deleteCategory).toHaveBeenCalledWith(categoryIdToDelete);
  });

  test('should handle error when deleting category fails', async () => {
    const errorMessage = 'Error deleting category';
    const categoryIdToDelete = 1;

    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);
    mockCategoryDB.deleteCategory.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.deleteCategory(categoryIdToDelete)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error deleting category');
    });
    
    expect(result.current.categories).toEqual(mockCategories);
  });

  test('should handle non-Error objects in catch blocks', async () => {
    mockCategoryDB.getCategories.mockRejectedValue('String error');

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('An error occurred');
  });

  test('should clean up state on unmount', () => {
    mockCategoryDB.getCategories.mockResolvedValue(mockCategories);

    const { unmount } = renderHook(() => useCategories());

    unmount();

    // The cleanup function should be called, but we can't directly test state
    // since the component is unmounted. The test verifies the hook doesn't crash.
    expect(mockCategoryDB.getCategories).toHaveBeenCalledOnce();
  });
});