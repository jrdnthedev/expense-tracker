import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExpenses } from './useExpense';
import { expenseDB } from '../../services/expense-service/expense.service';
import type { Expense } from '../../types/expense';

// Mock the expense service
vi.mock('../../services/expense-service/expense.service');

const mockExpenseDB = vi.mocked(expenseDB);

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 25.50,
    description: 'Lunch',
    category: 'Food',
    categoryId: 1,
    budget: 'Monthly Food',
    budgetId: 1,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 2,
    amount: 15.00,
    description: 'Bus fare',
    category: 'Transport',
    categoryId: 2,
    budget: 'Transport Budget',
    budgetId: 2,
    createdAt: '2025-01-01T11:00:00.000Z',
    updatedAt: '2025-01-01T11:00:00.000Z',
  }
];

describe('useExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should initialize with loading state and fetch expenses successfully', async () => {
    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);

    const { result } = renderHook(() => useExpenses());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.expenses).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.expenses).toEqual(mockExpenses);
    expect(result.current.error).toBe(null);
    expect(mockExpenseDB.getExpenses).toHaveBeenCalledOnce();
  });

  test('should handle error when fetching expenses fails', async () => {
    const errorMessage = 'Failed to fetch expenses';
    mockExpenseDB.getExpenses.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.expenses).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(mockExpenseDB.getExpenses).toHaveBeenCalledOnce();
  });

  test('should add expense successfully', async () => {
    const newExpenseId = 3;
    const newExpense: Omit<Expense, 'id'> = {
      amount: 50.00,
      description: 'Movie tickets',
      category: 'Entertainment',
      categoryId: 3,
      budget: 'Entertainment Budget',
      budgetId: 3,
      createdAt: '2025-01-01T12:00:00.000Z',
      updatedAt: '2025-01-01T12:00:00.000Z',
    };

    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.addExpense.mockResolvedValue(newExpenseId);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const returnedId = await result.current.addExpense(newExpense);

    expect(returnedId).toBe(newExpenseId);
    
    await waitFor(() => {
      expect(result.current.expenses).toEqual([
        ...mockExpenses,
        { ...newExpense, id: newExpenseId }
      ]);
    });
    
    expect(mockExpenseDB.addExpense).toHaveBeenCalledWith(newExpense);
  });

  test('should handle error when adding expense fails', async () => {
    const errorMessage = 'Error adding expense';
    const newExpense: Omit<Expense, 'id'> = {
      amount: 50.00,
      description: 'Movie tickets',
      category: 'Entertainment',
      categoryId: 3,
      budget: 'Entertainment Budget',
      budgetId: 3,
      createdAt: '2025-01-01T12:00:00.000Z',
      updatedAt: '2025-01-01T12:00:00.000Z',
    };

    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.addExpense.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.addExpense(newExpense)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error adding expense');
    });
    
    expect(result.current.expenses).toEqual(mockExpenses);
  });

  test('should update expense successfully', async () => {
    const updatedExpense: Expense = {
      ...mockExpenses[0],
      amount: 30.00,
      description: 'Updated lunch'
    };

    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.updateExpense.mockResolvedValue();

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.updateExpense(updatedExpense);

    await waitFor(() => {
      expect(result.current.expenses[0]).toEqual(updatedExpense);
      expect(result.current.expenses[1]).toEqual(mockExpenses[1]);
    });
    
    expect(mockExpenseDB.updateExpense).toHaveBeenCalledWith(updatedExpense);
  });

  test('should handle error when updating expense fails', async () => {
    const errorMessage = 'Error updating expense';
    const updatedExpense: Expense = {
      ...mockExpenses[0],
      amount: 30.00
    };

    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.updateExpense.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.updateExpense(updatedExpense)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error updating expense');
    });
    
    expect(result.current.expenses).toEqual(mockExpenses);
  });

  test('should delete expense successfully', async () => {
    const expenseIdToDelete = 1;

    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.deleteExpense.mockResolvedValue();

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.deleteExpense(expenseIdToDelete);

    await waitFor(() => {
      expect(result.current.expenses).toEqual([mockExpenses[1]]);
    });
    
    expect(mockExpenseDB.deleteExpense).toHaveBeenCalledWith(expenseIdToDelete);
  });

  test('should handle error when deleting expense fails', async () => {
    const errorMessage = 'Error deleting expense';
    const expenseIdToDelete = 1;

    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.deleteExpense.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.deleteExpense(expenseIdToDelete)).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Error deleting expense');
    });
    
    expect(result.current.expenses).toEqual(mockExpenses);
  });

  test('should handle non-Error objects in catch blocks', async () => {
    mockExpenseDB.getExpenses.mockRejectedValue('String error');

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('An error occurred');
  });

  test('should clean up state on unmount', () => {
    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);

    const { unmount } = renderHook(() => useExpenses());

    unmount();

    // The cleanup function should be called, but we can't directly test state
    // since the component is unmounted. The test verifies the hook doesn't crash.
    expect(mockExpenseDB.getExpenses).toHaveBeenCalledOnce();
  });

  test('should handle adding multiple expenses', async () => {
    const firstExpense: Omit<Expense, 'id'> = {
      amount: 10.00,
      description: 'Coffee',
      category: 'Food',
      categoryId: 1,
      budget: '',
      budgetId: 0,
      createdAt: '2025-01-01T13:00:00.000Z',
      updatedAt: '2025-01-01T13:00:00.000Z',
    };

    const secondExpense: Omit<Expense, 'id'> = {
      amount: 20.00,
      description: 'Parking',
      category: 'Transport',
      categoryId: 2,
      budget: '',
      budgetId: 0,
      createdAt: '2025-01-01T14:00:00.000Z',
      updatedAt: '2025-01-01T14:00:00.000Z',
    };

    mockExpenseDB.getExpenses.mockResolvedValue([]);
    mockExpenseDB.addExpense.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.addExpense(firstExpense);
    await result.current.addExpense(secondExpense);

    await waitFor(() => {
      expect(result.current.expenses).toHaveLength(2);
      expect(result.current.expenses[0]).toEqual({ ...firstExpense, id: 1 });
      expect(result.current.expenses[1]).toEqual({ ...secondExpense, id: 2 });
    });
  });

  test('should maintain expense order when updating', async () => {
    mockExpenseDB.getExpenses.mockResolvedValue(mockExpenses);
    mockExpenseDB.updateExpense.mockResolvedValue();

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updatedSecondExpense: Expense = {
      ...mockExpenses[1],
      amount: 25.00
    };

    await result.current.updateExpense(updatedSecondExpense);

    await waitFor(() => {
      expect(result.current.expenses[0]).toEqual(mockExpenses[0]);
      expect(result.current.expenses[1]).toEqual(updatedSecondExpense);
    });
  });
});