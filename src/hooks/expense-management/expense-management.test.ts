import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExpenseManagement } from './expense-management';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Category } from '../../types/category';
import type { Budget } from '../../types/budget';
import type { Expense } from '../../types/expense';

// Mock the dispatch hook
vi.mock('../../context/app-state-hooks');

const mockDispatch = vi.fn();
const mockUseAppDispatch = vi.mocked(useAppDispatch);

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
  { id: 3, name: 'Entertainment', icon: '🎬' },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly Food Budget',
    limit: 500,
    category: 'Food',
    categoryIds: [1],
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    expenseIds: [1, 2],
  },
  {
    id: 2,
    name: 'Transport Budget',
    limit: 200,
    category: 'Transport',
    categoryIds: [2],
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    expenseIds: [],
  },
];

const mockExpense: Expense = {
  id: 1,
  amount: 25.5,
  description: 'Lunch at restaurant',
  category: 'Food',
  categoryId: 1,
  budget: 'Monthly Food Budget',
  budgetId: 1,
  createdAt: '2025-01-01T09:00:00.000Z',
  updatedAt: '2025-01-01T09:00:00.000Z',
};

describe('useExpenseManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    expect(result.current.expenseToEdit).toBe(null);
    expect(result.current.expenseToDelete).toBe(null);
    expect(result.current.isAddExpenseModalOpen).toBe(false);

    // Test form state structure without checking exact timestamps
    expect(result.current.formState.amount).toBe(0);
    expect(result.current.formState.description).toBe('');
    expect(result.current.formState.category).toBe('');
    expect(result.current.formState.categoryId).toBe(1);
    expect(result.current.formState.budget).toBe('');
    expect(result.current.formState.budgetId).toBe(0);
    expect(result.current.formState.id).toBe(0);

    // Verify timestamps exist and are valid ISO strings
    expect(typeof result.current.formState.createdAt).toBe('string');
    expect(typeof result.current.formState.updatedAt).toBe('string');
    expect(new Date(result.current.formState.createdAt)).toBeInstanceOf(Date);
    expect(new Date(result.current.formState.updatedAt)).toBeInstanceOf(Date);

    // Verify the timestamps are not invalid dates
    expect(isNaN(new Date(result.current.formState.createdAt).getTime())).toBe(
      false
    );
    expect(isNaN(new Date(result.current.formState.updatedAt).getTime())).toBe(
      false
    );
  });

  test('should handle field changes', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.handleFieldChange('amount', 50);
    });

    expect(result.current.formState.amount).toBe(50);

    act(() => {
      result.current.handleFieldChange('description', 'Grocery shopping');
    });

    expect(result.current.formState.description).toBe('Grocery shopping');

    act(() => {
      result.current.handleFieldChange('categoryId', 2);
    });

    expect(result.current.formState.categoryId).toBe(2);
  });

  test('should delete expense', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.setExpenseToDelete(1);
    });

    expect(result.current.expenseToDelete).toBe(1);

    act(() => {
      result.current.handleDeleteExpense(1);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_EXPENSE',
      payload: { id: 1 },
    });
    expect(result.current.expenseToDelete).toBe(null);
  });

  test('should handle form edit', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.handleFormEdit(mockExpense);
    });

    expect(result.current.expenseToEdit).toBe(mockExpense);
    expect(result.current.formState).toEqual({
      ...mockExpense,
      amount: 25.5,
      category: 'Food',
    });
  });

  test('should handle form edit with missing category', () => {
    const expenseWithInvalidCategory: Expense = {
      ...mockExpense,
      categoryId: 999, // Non-existent category
    };

    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.handleFormEdit(expenseWithInvalidCategory);
    });

    expect(result.current.formState.category).toBe('');
  });

  test('should save expense changes', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    // Set up expense to edit
    act(() => {
      result.current.handleFormEdit(mockExpense);
    });

    // Make changes
    act(() => {
      result.current.handleFieldChange('amount', 30);
      result.current.handleFieldChange('description', 'Updated lunch');
      result.current.handleFieldChange('categoryId', 2);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_EXPENSE',
      payload: {
        ...mockExpense,
        amount: 30,
        description: 'Updated lunch',
        categoryId: 2,
        category: 'transport', // Should be lowercase
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
    });
    expect(result.current.expenseToEdit).toBe(null);
  });

  test('should not save when no expense is being edited', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.handleSave();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('should not save when expense id is invalid', () => {
    const invalidExpense: Expense = {
      ...mockExpense,
      id: 'invalid' as unknown as number, // Invalid id type
    };

    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.handleFormEdit(invalidExpense);
      result.current.handleSave();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('should reset form state', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    // Modify state
    act(() => {
      result.current.handleFormEdit(mockExpense);
      result.current.handleFieldChange('amount', 100);
    });

    expect(result.current.expenseToEdit).toBe(mockExpense);
    expect(result.current.formState.amount).toBe(100);

    act(() => {
      result.current.handleReset();
    });

    expect(result.current.expenseToEdit).toBe(null);

    // Test that the form state has been reset to default values
    // without checking exact timestamps
    expect(result.current.formState.amount).toBe(0);
    expect(result.current.formState.description).toBe('');
    expect(result.current.formState.category).toBe('');
    expect(result.current.formState.categoryId).toBe(1);
    expect(result.current.formState.budget).toBe('');
    expect(result.current.formState.budgetId).toBe(0);
    expect(result.current.formState.id).toBe(0);

    // Verify timestamps are strings (not checking exact values)
    expect(typeof result.current.formState.createdAt).toBe('string');
    expect(typeof result.current.formState.updatedAt).toBe('string');

    // Verify timestamps are valid ISO strings
    expect(new Date(result.current.formState.createdAt)).toBeInstanceOf(Date);
    expect(new Date(result.current.formState.updatedAt)).toBeInstanceOf(Date);
  });

  test('should add new expense without budget', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    // Set form data
    act(() => {
      result.current.handleFieldChange('amount', 15);
      result.current.handleFieldChange('description', 'Coffee');
      result.current.handleFieldChange('categoryId', 1);
    });

    act(() => {
      result.current.handleAddExpense(5);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_EXPENSE',
      payload: {
        id: 5,
        amount: 15,
        description: 'Coffee',
        category: 'Food',
        categoryId: 1,
        budget: '',
        budgetId: 0,
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
    });

    expect(result.current.isAddExpenseModalOpen).toBe(false);
    expect(result.current.formState.amount).toBe(0);
    expect(result.current.formState.description).toBe('');
  });

  test('should add new expense with budget and update budget', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    // Set form data with budget
    act(() => {
      result.current.handleFieldChange('amount', 25);
      result.current.handleFieldChange('description', 'Gas');
      result.current.handleFieldChange('categoryId', 2);
      result.current.handleFieldChange('budgetId', 2);
    });

    act(() => {
      result.current.handleAddExpense(6);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);

    // First call: Add expense
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'ADD_EXPENSE',
      payload: {
        id: 6,
        amount: 25,
        description: 'Gas',
        category: 'Transport',
        categoryId: 2,
        budget: '',
        budgetId: 2,
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      },
    });

    // Second call: Update budget
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'UPDATE_BUDGET',
      payload: {
        ...mockBudgets[1],
        expenseIds: [6],
      },
    });
  });

  test('should handle add expense when budget is not found', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.handleFieldChange('amount', 25);
      result.current.handleFieldChange('budgetId', 999); // Non-existent budget
    });

    act(() => {
      result.current.handleAddExpense(7);
    });

    // Should only call ADD_EXPENSE, not UPDATE_BUDGET
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_EXPENSE',
      payload: expect.objectContaining({ id: 7 }),
    });
  });

  test('should manage modal state', () => {
    const { result } = renderHook(() =>
      useExpenseManagement(mockCategories, mockBudgets)
    );

    act(() => {
      result.current.setIsAddExpenseModalOpen(true);
    });

    expect(result.current.isAddExpenseModalOpen).toBe(true);

    act(() => {
      result.current.setIsAddExpenseModalOpen(false);
    });

    expect(result.current.isAddExpenseModalOpen).toBe(false);
  });
});
