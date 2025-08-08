import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBudgets } from './useBudget';
import { budgetDB } from '../../services/budget-service/budget.service';
import type { Budget } from '../../types/budget';

// Mock the budget service
vi.mock('../../services/budget-service/budget.service');

const mockBudgetDB = vi.mocked(budgetDB);

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Groceries Budget',
    limit: 500,
    category: 'Food',
    categoryIds: [1],
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    expenseIds: [],
  },
  {
    id: 2,
    name: 'Entertainment Budget',
    limit: 200,
    category: 'Entertainment',
    categoryIds: [2],
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    expenseIds: [],
  },
];

describe('useBudgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should initialize with loading state and fetch budgets successfully', async () => {
    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);

    const { result } = renderHook(() => useBudgets());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.budgets).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.budgets).toEqual(mockBudgets);
    expect(result.current.error).toBe(null);
    expect(mockBudgetDB.getBudgets).toHaveBeenCalledOnce();
  });

  test('should handle error when fetching budgets fails', async () => {
    const errorMessage = 'Failed to fetch budgets';
    mockBudgetDB.getBudgets.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.budgets).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(mockBudgetDB.getBudgets).toHaveBeenCalledOnce();
  });

  test('should add budget successfully', async () => {
    const newBudgetId = 3;
    const newBudget: Omit<Budget, 'id'> = {
      name: 'Transport Budget',
      limit: 300,
      category: 'Transport',
      categoryIds: [3],
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      expenseIds: [],
    };

    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);
    mockBudgetDB.addBudget.mockResolvedValue(newBudgetId);

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const returnedId = await result.current.addBudget(newBudget);

    expect(returnedId).toBe(newBudgetId);
    await waitFor(() => {
      expect(result.current.budgets).toEqual([
        ...mockBudgets,
        { ...newBudget, id: newBudgetId },
      ]);
    });
    expect(mockBudgetDB.addBudget).toHaveBeenCalledWith(newBudget);
  });

  test('should handle error when adding budget fails', async () => {
    const errorMessage = 'Error adding budget';
    const newBudget: Omit<Budget, 'id'> = {
      name: 'Transport Budget',
      limit: 300,
      category: 'Transport',
      categoryIds: [3],
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      expenseIds: [],
    };

    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);
    mockBudgetDB.addBudget.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.addBudget(newBudget)).rejects.toThrow(
      errorMessage
    );
    await waitFor(() => {
      expect(result.current.error).toBe('Error adding budget');
    });
    expect(result.current.budgets).toEqual(mockBudgets);
  });

  test('should update budget successfully', async () => {
    const updatedBudget: Budget = {
      ...mockBudgets[0],
      limit: 600,
    };

    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);
    mockBudgetDB.updateBudget.mockResolvedValue();

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.updateBudget(updatedBudget);
    await waitFor(() => {
      expect(result.current.budgets[0]).toEqual(updatedBudget);
    });
    expect(result.current.budgets[1]).toEqual(mockBudgets[1]);
    expect(mockBudgetDB.updateBudget).toHaveBeenCalledWith(updatedBudget);
  });

  test('should handle error when updating budget fails', async () => {
    const errorMessage = 'Error updating budget';
    const updatedBudget: Budget = {
      ...mockBudgets[0],
      limit: 600,
    };

    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);
    mockBudgetDB.updateBudget.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.updateBudget(updatedBudget)).rejects.toThrow(
      errorMessage
    );
    await waitFor(() => {
      expect(result.current.error).toBe('Error updating budget');
    });
    expect(result.current.budgets).toEqual(mockBudgets);
  });

  test('should delete budget successfully', async () => {
    const budgetIdToDelete = 1;

    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);
    mockBudgetDB.deleteBudget.mockResolvedValue();

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.deleteBudget(budgetIdToDelete);
    await waitFor(() => {
      expect(result.current.budgets).toEqual([mockBudgets[1]]);
    });
    expect(mockBudgetDB.deleteBudget).toHaveBeenCalledWith(budgetIdToDelete);
  });

  test('should handle error when deleting budget fails', async () => {
    const errorMessage = 'Error deleting budget';
    const budgetIdToDelete = 1;

    mockBudgetDB.getBudgets.mockResolvedValue(mockBudgets);
    mockBudgetDB.deleteBudget.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(result.current.deleteBudget(budgetIdToDelete)).rejects.toThrow(
      errorMessage
    );

    // Wait for the error state to be updated
    await waitFor(() => {
      expect(result.current.error).toBe('Error deleting budget');
    });

    expect(result.current.budgets).toEqual(mockBudgets);
  });

  test('should handle non-Error objects in catch blocks', async () => {
    mockBudgetDB.getBudgets.mockRejectedValue('String error');

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('An error occurred');
  });
});
