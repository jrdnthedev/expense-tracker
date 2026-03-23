import { describe, test, expect } from 'vitest';
import {
  addExpenseIdToBudget,
  updateExpense,
  removeExpenseFromList,
  removeExpenseFromBudgets,
  updateBudget,
  removeBudget,
  updateCategory,
  removeCategory,
  getBudgetById,
} from './state';
import type { Budget } from '../types/budget';
import type { Expense } from '../types/expense';
import type { Category } from '../types/category';

describe('addExpenseIdToBudget', () => {
  const mockBudgets: Budget[] = [
    { id: 1, name: 'Groceries', limit: 500,categoryIds:[1], startDate:'', endDate:'' },
    { id: 2, name: 'Entertainment', limit: 200,categoryIds:[2], startDate:'', endDate:'' },
    { id: 3, name: 'Transport', limit: 500,categoryIds:[3], startDate:'', endDate:'' }
  ];

  test('should return budget unchanged when matching ID is found', () => {
    const result = addExpenseIdToBudget(mockBudgets, 2);
    
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ id: 2, name: 'Entertainment', limit: 200, categoryIds:[2], startDate:'', endDate:'' });
  });

  test('should return all budgets unchanged when no matching ID is found', () => {
    const result = addExpenseIdToBudget(mockBudgets, 999);
    
    expect(result).toEqual(mockBudgets);
  });

  test('should not mutate the original budgets array', () => {
    const originalBudgets = [...mockBudgets];
    addExpenseIdToBudget(mockBudgets, 1);
    
    expect(mockBudgets).toEqual(originalBudgets);
  });

  test('should return empty array when given empty array', () => {
    const result = addExpenseIdToBudget([], 1);
    
    expect(result).toEqual([]);
  });

  test('should return new array instance', () => {
    const result = addExpenseIdToBudget(mockBudgets, 1);
    
    expect(result).not.toBe(mockBudgets);
  });
});

// --- Shared test data ---

const mockExpenses: Expense[] = [
  { id: 1, amount: 10, description: 'A', category: 'Food', categoryId: 1, budget: '', budgetId: 1, createdAt: '', updatedAt: '' },
  { id: 2, amount: 20, description: 'B', category: 'Fun', categoryId: 2, budget: '', budgetId: 1, createdAt: '', updatedAt: '' },
];

const mockBudgetList: Budget[] = [
  { id: 1, name: 'Monthly', limit: 500, categoryIds: [1], startDate: '2024-01-01', endDate: '2024-01-31' },
  { id: 2, name: 'Weekly', limit: 100, categoryIds: [2], startDate: '2024-01-01', endDate: '2024-01-07' },
];

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Fun', icon: '🎬' },
];

describe('updateExpense', () => {
  test('replaces the expense with the matching id', () => {
    const updated: Expense = { ...mockExpenses[0], amount: 99, description: 'Updated' };
    const result = updateExpense(mockExpenses, updated);

    expect(result[0].amount).toBe(99);
    expect(result[0].description).toBe('Updated');
    expect(result[1]).toEqual(mockExpenses[1]);
  });

  test('returns unchanged list when id does not match', () => {
    const noMatch: Expense = { ...mockExpenses[0], id: 999 };
    const result = updateExpense(mockExpenses, noMatch);

    expect(result).toEqual(mockExpenses);
  });

  test('does not mutate the original array', () => {
    const original = [...mockExpenses];
    updateExpense(mockExpenses, { ...mockExpenses[0], amount: 0 });

    expect(mockExpenses).toEqual(original);
  });
});

describe('removeExpenseFromList', () => {
  test('removes the expense with the given id', () => {
    const result = removeExpenseFromList(mockExpenses, 1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test('returns unchanged list when id does not exist', () => {
    const result = removeExpenseFromList(mockExpenses, 999);

    expect(result).toEqual(mockExpenses);
  });

  test('returns empty array when removing from single-item list', () => {
    const result = removeExpenseFromList([mockExpenses[0]], 1);

    expect(result).toEqual([]);
  });
});

describe('removeExpenseFromBudgets', () => {
  test('returns a shallow copy of all budgets', () => {
    const result = removeExpenseFromBudgets(mockBudgetList);

    expect(result).toEqual(mockBudgetList);
    expect(result).not.toBe(mockBudgetList);
    result.forEach((b, i) => expect(b).not.toBe(mockBudgetList[i]));
  });

  test('returns empty array for empty input', () => {
    expect(removeExpenseFromBudgets([])).toEqual([]);
  });
});

describe('updateBudget', () => {
  test('replaces the budget with the matching id', () => {
    const updated: Budget = { ...mockBudgetList[0], name: 'Updated', limit: 999 };
    const result = updateBudget(mockBudgetList, updated);

    expect(result[0].name).toBe('Updated');
    expect(result[0].limit).toBe(999);
    expect(result[1]).toEqual(mockBudgetList[1]);
  });

  test('returns unchanged list when id does not match', () => {
    const noMatch: Budget = { ...mockBudgetList[0], id: 999 };
    const result = updateBudget(mockBudgetList, noMatch);

    expect(result).toEqual(mockBudgetList);
  });
});

describe('removeBudget', () => {
  test('removes the budget with the given id', () => {
    const result = removeBudget(mockBudgetList, 1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test('returns unchanged list when id does not exist', () => {
    const result = removeBudget(mockBudgetList, 999);

    expect(result).toEqual(mockBudgetList);
  });
});

describe('updateCategory', () => {
  test('replaces the category with the matching id', () => {
    const updated: Category = { id: 1, name: 'Dining', icon: '🍽️' };
    const result = updateCategory(mockCategories, updated);

    expect(result[0]).toEqual({ id: 1, name: 'Dining', icon: '🍽️' });
    expect(result[1]).toEqual(mockCategories[1]);
  });

  test('returns unchanged list when id does not match', () => {
    const noMatch: Category = { id: 999, name: 'X', icon: '❓' };
    const result = updateCategory(mockCategories, noMatch);

    expect(result).toEqual(mockCategories);
  });
});

describe('removeCategory', () => {
  test('removes the category with the given id', () => {
    const result = removeCategory(mockCategories, 2);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  test('returns unchanged list when id does not exist', () => {
    const result = removeCategory(mockCategories, 999);

    expect(result).toEqual(mockCategories);
  });
});

describe('getBudgetById', () => {
  test('returns the budget with the matching id', () => {
    const result = getBudgetById(mockBudgetList, 2);

    expect(result).toEqual(mockBudgetList[1]);
  });

  test('returns undefined when id does not exist', () => {
    expect(getBudgetById(mockBudgetList, 999)).toBeUndefined();
  });

  test('returns undefined for empty array', () => {
    expect(getBudgetById([], 1)).toBeUndefined();
  });
});