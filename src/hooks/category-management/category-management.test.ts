import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategoryManagement } from './category-management';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Category } from '../../types/category';

// Mock the dispatch hook
vi.mock('../../context/app-state-hooks');

const mockDispatch = vi.fn();
const mockUseAppDispatch = vi.mocked(useAppDispatch);

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
  { id: 3, name: 'Entertainment', icon: '🎬' },
];

describe('useCategoryManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    expect(result.current.selectedCategory).toBe(null);
    expect(result.current.previousSelectedCategory).toBe(mockCategories[0]);
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.isConfirmModalOpen).toBe(false);
    expect(result.current.formState).toEqual({
      name: '',
      icon: '➕',
      id: 1,
    });
    expect(result.current.addCategoryFormState).toEqual({
      name: '',
      icon: '➕',
      id: 4,
    });
  });

  test('should initialize with null previousSelectedCategory when no categories exist', () => {
    const { result } = renderHook(() => 
      useCategoryManagement([], 1)
    );

    expect(result.current.previousSelectedCategory).toBe(null);
  });

  test('should handle selected category change', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    act(() => {
      result.current.handleSelectedCategoryChange(mockCategories[1]);
    });

    expect(result.current.selectedCategory).toBe(mockCategories[1]);
    expect(result.current.previousSelectedCategory).toBe(null);
    expect(result.current.formState).toEqual({
      name: 'Transport',
      icon: '🚗',
      id: 2,
    });
  });

  test('should update previous category when changing selection multiple times', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    // First selection
    act(() => {
      result.current.handleSelectedCategoryChange(mockCategories[0]);
    });

    // Second selection
    act(() => {
      result.current.handleSelectedCategoryChange(mockCategories[1]);
    });

    expect(result.current.selectedCategory).toBe(mockCategories[1]);
    expect(result.current.previousSelectedCategory).toBe(mockCategories[0]);
  });

  test('should delete selected category and reset to previous', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    // Select a category first
    act(() => {
      result.current.handleSelectedCategoryChange(mockCategories[1]);
    });

    // Delete the category
    act(() => {
      result.current.handleDeleteCategory();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_CATEGORY',
      payload: { id: 2 },
    });
    expect(result.current.selectedCategory).toBe(null);
    expect(result.current.isConfirmModalOpen).toBe(false);
  });

  test('should not delete when no category is selected', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    act(() => {
      result.current.handleDeleteCategory();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.current.isConfirmModalOpen).toBe(false);
  });

  test('should save changes to selected category', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    // Select a category and modify form state
    act(() => {
      result.current.handleSelectedCategoryChange(mockCategories[0]);
    });

    act(() => {
      result.current.handleFormChange('name', 'Updated Food');
    });

    act(() => {
      result.current.handleSaveChanges();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CATEGORY',
      payload: {
        id: 1,
        name: 'Updated Food',
        icon: '🍕',
      },
    });
  });

  test('should not save changes when no category is selected', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    act(() => {
      result.current.handleSaveChanges();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('should add new category and reset form', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    // Update add form state
    act(() => {
      result.current.handleAddFormChange('name', 'Shopping');
      result.current.handleAddFormChange('icon', '🛒');
    });

    act(() => {
      result.current.handleAddCategory();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_CATEGORY',
      payload: {
        id: 4,
        name: 'Shopping',
        icon: '🛒',
      },
    });
    expect(result.current.addCategoryFormState).toEqual({
      name: '',
      icon: '➕',
      id: 5,
    });
    expect(result.current.isModalOpen).toBe(false);
  });

  test('should handle form field changes', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    act(() => {
      result.current.handleFormChange('name', 'New Name');
    });

    expect(result.current.formState.name).toBe('New Name');

    act(() => {
      result.current.handleFormChange('icon', '🎯');
    });

    expect(result.current.formState.icon).toBe('🎯');
  });

  test('should handle add form field changes', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    act(() => {
      result.current.handleAddFormChange('name', 'Health');
    });

    expect(result.current.addCategoryFormState.name).toBe('Health');

    act(() => {
      result.current.handleAddFormChange('icon', '💊');
    });

    expect(result.current.addCategoryFormState.icon).toBe('💊');
  });

  test('should manage modal states', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    act(() => {
      result.current.setIsModalOpen(true);
    });

    expect(result.current.isModalOpen).toBe(true);

    act(() => {
      result.current.setIsConfirmModalOpen(true);
    });

    expect(result.current.isConfirmModalOpen).toBe(true);
  });

  test('should handle category selection with form state update correctly', () => {
    const { result } = renderHook(() => 
      useCategoryManagement(mockCategories, 4)
    );

    const selectedCategory = mockCategories[2];

    act(() => {
      result.current.handleSelectedCategoryChange(selectedCategory);
    });

    expect(result.current.selectedCategory).toBe(selectedCategory);
    expect(result.current.formState).toEqual({
      name: selectedCategory.name,
      icon: selectedCategory.icon,
      id: selectedCategory.id,
    });
  });
});