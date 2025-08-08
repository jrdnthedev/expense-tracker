import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useBudgetManagement } from "./budget-management";
import type { Expense } from "../../types/expense";
import type { Budget } from "../../types/budget";
import type { Category } from "../../types/category";

describe('handleBudgetEdit', () => {
  test('should set budget to edit and update form state', () => {
    const mockCategories: Category[] = [
      { id: 1, name: 'Food', icon: '' },
      { id: 2, name: 'Transport', icon: '' }
    ];
    const mockExpenses: Expense[] = [];
    const mockBudgets: Budget[] = [];

    const { result } = renderHook(() =>
      useBudgetManagement(mockCategories, mockExpenses, mockBudgets, 1)
    );

    const budgetToEdit = {
      id: 1,
      name: 'Monthly Food Budget',
      limit: 500,
      category: '',
      categoryIds: [1],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      expenseIds: []
    };

    act(() => {
      result.current.handleBudgetEdit(budgetToEdit);
    });

    expect(result.current.budgetToEdit).toEqual(budgetToEdit);
    expect(result.current.formState).toEqual({
      ...budgetToEdit,
      category: 'Food'
    });
  });

  test('should handle budget with no category ID', () => {
    const mockCategories: Category[] = [
      { id: 1, name: 'Food', icon: '' }
    ];
    const mockExpenses: Expense[] = [];
    const mockBudgets: Budget[] = [];

    const { result } = renderHook(() =>
      useBudgetManagement(mockCategories, mockExpenses, mockBudgets, 1)
    );

    const budgetToEdit = {
      id: 1,
      name: 'Test Budget',
      limit: 300,
      category: '',
      categoryIds: [],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      expenseIds: []
    };

    act(() => {
      result.current.handleBudgetEdit(budgetToEdit);
    });

    expect(result.current.budgetToEdit).toEqual(budgetToEdit);
    expect(result.current.formState.category).toBe('');
  });

  test('should handle budget with non-existent category ID', () => {
    const mockCategories: Category[] = [
      { id: 1, name: 'Food', icon: '' }
    ];
    const mockExpenses: Expense[] = [];
    const mockBudgets: Budget[] = [];

    const { result } = renderHook(() =>
      useBudgetManagement(mockCategories, mockExpenses, mockBudgets, 1)
    );

    const budgetToEdit = {
      id: 1,
      name: 'Test Budget',
      limit: 300,
      category: '',
      categoryIds: [999], // Non-existent category ID
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      expenseIds: []
    };

    act(() => {
      result.current.handleBudgetEdit(budgetToEdit);
    });

    expect(result.current.budgetToEdit).toEqual(budgetToEdit);
    expect(result.current.formState.category).toBe('');
  });

  test('should map first category ID when multiple category IDs exist', () => {
    const mockCategories: Category[] = [
      { id: 1, name: 'Food', icon: '' },
      { id: 2, name: 'Transport', icon: '' },
      { id: 3, name: 'Entertainment', icon: '' }
    ];
    const mockExpenses: Expense[] = [];
    const mockBudgets: Budget[] = [];

    const { result } = renderHook(() =>
      useBudgetManagement(mockCategories, mockExpenses, mockBudgets, 1)
    );

    const budgetToEdit = {
      id: 1,
      name: 'Multi Category Budget',
      limit: 800,
      category: '',
      categoryIds: [2, 3], // Multiple category IDs
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      expenseIds: []
    };

    act(() => {
      result.current.handleBudgetEdit(budgetToEdit);
    });

    expect(result.current.budgetToEdit).toEqual(budgetToEdit);
    expect(result.current.formState.category).toBe('Transport'); // First category ID
  });
});