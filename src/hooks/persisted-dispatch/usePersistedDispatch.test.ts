import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedDispatch } from './usePersistedDispatch';
import { useAppDispatch } from '../../context/app-state-hooks';
import { expenseDB } from '../../services/expense-service/expense.service';
import { budgetDB } from '../../services/budget-service/budget.service';
import { categoryDB } from '../../services/category-service/category.service';
import type { Action } from '../../context/app-state-context';

vi.mock('../../context/app-state-hooks', () => ({
  useAppDispatch: vi.fn(),
}));

vi.mock('../../services/expense-service/expense.service', () => ({
  expenseDB: {
    addExpense: vi.fn().mockResolvedValue(undefined),
    updateExpense: vi.fn().mockResolvedValue(undefined),
    deleteExpense: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../services/budget-service/budget.service', () => ({
  budgetDB: {
    addBudget: vi.fn().mockResolvedValue(undefined),
    updateBudget: vi.fn().mockResolvedValue(undefined),
    deleteBudget: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../services/category-service/category.service', () => ({
  categoryDB: {
    addCategory: vi.fn().mockResolvedValue(undefined),
    updateCategory: vi.fn().mockResolvedValue(undefined),
    deleteCategory: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockDispatch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
});

describe('usePersistedDispatch', () => {
  test('returns a function', () => {
    const { result } = renderHook(() => usePersistedDispatch());
    expect(typeof result.current).toBe('function');
  });

  describe('dispatches action to context for all action types', () => {
    const expense = {
      id: 1,
      amount: 50,
      description: 'Lunch',
      category: 'Food',
      categoryId: 1,
      budget: 'Monthly',
      budgetId: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const budget = {
      id: 1,
      name: 'Monthly',
      categoryIds: [1],
      limit: 500,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    const category = { id: 1, name: 'Food', icon: '🍔' };

    test('dispatches ADD_EXPENSE and persists', async () => {
      const action: Action = { type: 'ADD_EXPENSE', payload: expense };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(expenseDB.addExpense).toHaveBeenCalledWith(expense);
    });

    test('dispatches UPDATE_EXPENSE and persists', async () => {
      const action: Action = { type: 'UPDATE_EXPENSE', payload: expense };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(expenseDB.updateExpense).toHaveBeenCalledWith(expense);
    });

    test('dispatches REMOVE_EXPENSE and persists', async () => {
      const action: Action = { type: 'REMOVE_EXPENSE', payload: { id: 1 } };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(expenseDB.deleteExpense).toHaveBeenCalledWith(1);
    });

    test('dispatches ADD_BUDGET and persists', async () => {
      const action: Action = { type: 'ADD_BUDGET', payload: budget };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(budgetDB.addBudget).toHaveBeenCalledWith(budget);
    });

    test('dispatches UPDATE_BUDGET and persists', async () => {
      const action: Action = { type: 'UPDATE_BUDGET', payload: budget };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(budgetDB.updateBudget).toHaveBeenCalledWith(budget);
    });

    test('dispatches REMOVE_BUDGET and persists', async () => {
      const action: Action = { type: 'REMOVE_BUDGET', payload: { id: 1 } };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(budgetDB.deleteBudget).toHaveBeenCalledWith(1);
    });

    test('dispatches ADD_CATEGORY and persists', async () => {
      const action: Action = { type: 'ADD_CATEGORY', payload: category };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(categoryDB.addCategory).toHaveBeenCalledWith(category);
    });

    test('dispatches UPDATE_CATEGORY and persists', async () => {
      const action: Action = { type: 'UPDATE_CATEGORY', payload: category };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(categoryDB.updateCategory).toHaveBeenCalledWith(category);
    });

    test('dispatches REMOVE_CATEGORY and persists', async () => {
      const action: Action = {
        type: 'REMOVE_CATEGORY',
        payload: { id: 1 },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(categoryDB.deleteCategory).toHaveBeenCalledWith(1);
    });
  });

  describe('non-persisted actions', () => {
    test('dispatches SET_CURRENCY without calling any DB service', async () => {
      const action: Action = {
        type: 'SET_CURRENCY',
        payload: { code: 'EUR', symbol: '€', decimals: 2, label: 'Euro', id: 2 },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(expenseDB.addExpense).not.toHaveBeenCalled();
      expect(budgetDB.addBudget).not.toHaveBeenCalled();
      expect(categoryDB.addCategory).not.toHaveBeenCalled();
    });

    test('dispatches SET_THEME without calling any DB service', async () => {
      const action: Action = { type: 'SET_THEME', payload: 'dark' };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(expenseDB.addExpense).not.toHaveBeenCalled();
      expect(budgetDB.addBudget).not.toHaveBeenCalled();
      expect(categoryDB.addCategory).not.toHaveBeenCalled();
    });

    test('dispatches SET_DEFAULT_CATEGORY without calling any DB service', async () => {
      const action: Action = {
        type: 'SET_DEFAULT_CATEGORY',
        payload: { categoryId: 3 },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      await act(() => result.current(action));

      expect(mockDispatch).toHaveBeenCalledWith(action);
      expect(expenseDB.addExpense).not.toHaveBeenCalled();
      expect(budgetDB.addBudget).not.toHaveBeenCalled();
      expect(categoryDB.addCategory).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('still dispatches to context before DB failure', async () => {
      vi.mocked(expenseDB.addExpense).mockRejectedValueOnce(
        new Error('DB write failed')
      );
      const action: Action = {
        type: 'ADD_EXPENSE',
        payload: {
          id: 1,
          amount: 50,
          description: 'Lunch',
          category: 'Food',
          categoryId: 1,
          budget: 'Monthly',
          budgetId: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      await expect(act(() => result.current(action))).rejects.toThrow(
        'DB write failed'
      );
      expect(mockDispatch).toHaveBeenCalledWith(action);
    });

    test('re-throws Error instances as-is', async () => {
      const dbError = new Error('Connection lost');
      vi.mocked(budgetDB.addBudget).mockRejectedValueOnce(dbError);
      const action: Action = {
        type: 'ADD_BUDGET',
        payload: {
          id: 1,
          name: 'Monthly',
          categoryIds: [1],
          limit: 500,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      await expect(act(() => result.current(action))).rejects.toThrow(
        'Connection lost'
      );
    });

    test('wraps non-Error throws in a new Error', async () => {
      vi.mocked(categoryDB.addCategory).mockRejectedValueOnce(
        'string error'
      );
      const action: Action = {
        type: 'ADD_CATEGORY',
        payload: { id: 1, name: 'Food', icon: '🍔' },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      await expect(act(() => result.current(action))).rejects.toThrow(
        'Failed to persist ADD_CATEGORY'
      );
    });
  });

  describe('dispatch ordering', () => {
    test('dispatches to context synchronously before awaiting DB', async () => {
      let dbResolveFn: (value: number) => void;
      const dbPromise = new Promise<number>((resolve) => {
        dbResolveFn = resolve;
      });
      vi.mocked(expenseDB.addExpense).mockReturnValueOnce(dbPromise);

      const action: Action = {
        type: 'ADD_EXPENSE',
        payload: {
          id: 1,
          amount: 50,
          description: 'Lunch',
          category: 'Food',
          categoryId: 1,
          budget: 'Monthly',
          budgetId: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };
      const { result } = renderHook(() => usePersistedDispatch());

      const promise = act(() => result.current(action));

      // dispatch is called immediately, before the DB promise resolves
      expect(mockDispatch).toHaveBeenCalledWith(action);

      dbResolveFn!(1);
      await promise;
    });
  });
});
