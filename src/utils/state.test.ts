import { describe, test, expect } from 'vitest';
import {
  addExpenseIdToBudget,
  updateExpense,
  removeExpenseFromList,
  removeExpenseFromBudgets,
  updateBudget,
  removeBudget,
  updateCategory,
  removeCategory
} from './state';
import type { Budget } from '../types/budget';
import type { Category } from '../types/category';
import type { Expense } from '../types/expense';

// Mock data
const mockBudgets: Budget[] = [
  {
    id: 1,
    category: 'Food',
    name: 'Food Budget',
    categoryIds: [1, 2],
    limit: 500,
    startDate: '2025-08-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    expenseIds: [1, 2]
  },
  {
    id: 2,
    category: 'Entertainment',
    name: 'Entertainment Budget',
    categoryIds: [3],
    limit: 200,
    startDate: '2025-08-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    expenseIds: [3]
  }
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 50.25,
    description: 'Groceries',
    category: 'Food',
    categoryId: 1,
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z',
    budget: 'Food Budget',
    budgetId: 1
  },
  {
    id: 2,
    amount: 120.00,
    description: 'Restaurant dinner',
    category: 'Dining',
    categoryId: 2,
    createdAt: '2025-08-05T19:30:00Z',
    updatedAt: '2025-08-05T19:30:00Z',
    budget: 'Food Budget',
    budgetId: 1
  },
  {
    id: 3,
    amount: 30.75,
    description: 'Movie tickets',
    category: 'Entertainment',
    categoryId: 3,
    createdAt: '2025-08-03T14:15:00Z',
    updatedAt: '2025-08-03T14:15:00Z',
    budget: 'Entertainment Budget',
    budgetId: 2
  }
];

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Food',
    icon: 'food',
  },
  {
    id: 2,
    name: 'Dining',
    icon: 'dining',
  },
  {
    id: 3,
    name: 'Entertainment',
    icon: 'entertainment',
  }
];

describe('addExpenseIdToBudget', () => {
  test('should add expense ID to correct budget', () => {
    const result = addExpenseIdToBudget(mockBudgets, 4, 1);
    
    expect(result[0].expenseIds).toEqual([1, 2, 4]);
    expect(result[1].expenseIds).toEqual([3]); // Other budget unchanged
  });

  test('should not modify original budgets array', () => {
    const originalBudgets = [...mockBudgets];
    addExpenseIdToBudget(mockBudgets, 4, 1);
    
    expect(mockBudgets).toEqual(originalBudgets);
  });

  test('should return unchanged array if budget ID not found', () => {
    const result = addExpenseIdToBudget(mockBudgets, 4, 999);
    
    expect(result).toEqual(mockBudgets);
  });

  test('should handle empty budgets array', () => {
    const result = addExpenseIdToBudget([], 1, 1);
    
    expect(result).toEqual([]);
  });

  test('should add expense ID to budget with empty expenseIds', () => {
    const budgetWithNoExpenses: Budget[] = [
      { ...mockBudgets[0], expenseIds: [] }
    ];
    
    const result = addExpenseIdToBudget(budgetWithNoExpenses, 5, 1);
    
    expect(result[0].expenseIds).toEqual([5]);
  });
});

describe('updateExpense', () => {
  test('should update existing expense', () => {
    const updatedExpense: Expense = {
      ...mockExpenses[0],
      amount: 75.50,
      description: 'Updated groceries'
    };
    
    const result = updateExpense(mockExpenses, updatedExpense);
    
    expect(result[0]).toEqual(updatedExpense);
    expect(result[1]).toEqual(mockExpenses[1]); // Other expenses unchanged
    expect(result[2]).toEqual(mockExpenses[2]);
  });

  test('should not modify original expenses array', () => {
    const originalExpenses = [...mockExpenses];
    const updatedExpense = { ...mockExpenses[0], amount: 100 };
    
    updateExpense(mockExpenses, updatedExpense);
    
    expect(mockExpenses).toEqual(originalExpenses);
  });

  test('should return unchanged array if expense ID not found', () => {
    const nonExistentExpense: Expense = {
      ...mockExpenses[0],
      id: 999,
      amount: 100
    };
    
    const result = updateExpense(mockExpenses, nonExistentExpense);
    
    expect(result).toEqual(mockExpenses);
  });

  test('should handle empty expenses array', () => {
    const updatedExpense = mockExpenses[0];
    const result = updateExpense([], updatedExpense);
    
    expect(result).toEqual([]);
  });
});

describe('removeExpenseFromList', () => {
  test('should remove expense with matching ID', () => {
    const result = removeExpenseFromList(mockExpenses, 2);
    
    expect(result).toHaveLength(2);
    expect(result.find(expense => expense.id === 2)).toBeUndefined();
    expect(result[0]).toEqual(mockExpenses[0]);
    expect(result[1]).toEqual(mockExpenses[2]);
  });

  test('should not modify original expenses array', () => {
    const originalExpenses = [...mockExpenses];
    removeExpenseFromList(mockExpenses, 1);
    
    expect(mockExpenses).toEqual(originalExpenses);
  });

  test('should return unchanged array if expense ID not found', () => {
    const result = removeExpenseFromList(mockExpenses, 999);
    
    expect(result).toEqual(mockExpenses);
  });

  test('should handle empty expenses array', () => {
    const result = removeExpenseFromList([], 1);
    
    expect(result).toEqual([]);
  });

  test('should remove all expenses if they have the same ID', () => {
    const duplicateExpenses = [mockExpenses[0], mockExpenses[0]];
    const result = removeExpenseFromList(duplicateExpenses, 1);
    
    expect(result).toEqual([]);
  });
});

describe('removeExpenseFromBudgets', () => {
  test('should remove expense ID from all budgets', () => {
    const result = removeExpenseFromBudgets(mockBudgets, 1);
    
    expect(result[0].expenseIds).toEqual([2]); // Removed expense ID 1
    expect(result[1].expenseIds).toEqual([3]); // Unchanged
  });

  test('should not modify original budgets array', () => {
    const originalBudgets = [...mockBudgets];
    removeExpenseFromBudgets(mockBudgets, 1);
    
    expect(mockBudgets).toEqual(originalBudgets);
  });

  test('should handle expense ID not in any budget', () => {
    const result = removeExpenseFromBudgets(mockBudgets, 999);
    
    expect(result).toEqual(mockBudgets);
  });

  test('should handle empty budgets array', () => {
    const result = removeExpenseFromBudgets([], 1);
    
    expect(result).toEqual([]);
  });

  test('should remove expense ID from multiple budgets', () => {
    const budgetsWithSharedExpense: Budget[] = [
      { ...mockBudgets[0], expenseIds: [1, 2, 5] },
      { ...mockBudgets[1], expenseIds: [3, 5] }
    ];
    
    const result = removeExpenseFromBudgets(budgetsWithSharedExpense, 5);
    
    expect(result[0].expenseIds).toEqual([1, 2]);
    expect(result[1].expenseIds).toEqual([3]);
  });
});

describe('updateBudget', () => {
  test('should update existing budget', () => {
    const updatedBudget: Budget = {
      ...mockBudgets[0],
      limit: 600,
      name: 'Updated Food Budget'
    };
    
    const result = updateBudget(mockBudgets, updatedBudget);
    
    expect(result[0]).toEqual(updatedBudget);
    expect(result[1]).toEqual(mockBudgets[1]); // Other budget unchanged
  });

  test('should not modify original budgets array', () => {
    const originalBudgets = [...mockBudgets];
    const updatedBudget = { ...mockBudgets[0], amount: 700 };
    
    updateBudget(mockBudgets, updatedBudget);
    
    expect(mockBudgets).toEqual(originalBudgets);
  });

  test('should return unchanged array if budget ID not found', () => {
    const nonExistentBudget: Budget = {
      ...mockBudgets[0],
      id: 999
    };
    
    const result = updateBudget(mockBudgets, nonExistentBudget);
    
    expect(result).toEqual(mockBudgets);
  });

  test('should handle empty budgets array', () => {
    const result = updateBudget([], mockBudgets[0]);
    
    expect(result).toEqual([]);
  });
});

describe('removeBudget', () => {
  test('should remove budget with matching ID', () => {
    const result = removeBudget(mockBudgets, 1);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockBudgets[1]);
    expect(result.find(budget => budget.id === 1)).toBeUndefined();
  });

  test('should not modify original budgets array', () => {
    const originalBudgets = [...mockBudgets];
    removeBudget(mockBudgets, 1);
    
    expect(mockBudgets).toEqual(originalBudgets);
  });

  test('should return unchanged array if budget ID not found', () => {
    const result = removeBudget(mockBudgets, 999);
    
    expect(result).toEqual(mockBudgets);
  });

  test('should handle empty budgets array', () => {
    const result = removeBudget([], 1);
    
    expect(result).toEqual([]);
  });
});

describe('updateCategory', () => {
  test('should update existing category', () => {
    const updatedCategory: Category = {
      ...mockCategories[0],
      name: 'Updated Food',
    };
    
    const result = updateCategory(mockCategories, updatedCategory);
    
    expect(result[0]).toEqual(updatedCategory);
    expect(result[1]).toEqual(mockCategories[1]); // Other categories unchanged
    expect(result[2]).toEqual(mockCategories[2]);
  });

  test('should not modify original categories array', () => {
    const originalCategories = [...mockCategories];
    const updatedCategory = { ...mockCategories[0], name: 'Modified' };
    
    updateCategory(mockCategories, updatedCategory);
    
    expect(mockCategories).toEqual(originalCategories);
  });

  test('should return unchanged array if category ID not found', () => {
    const nonExistentCategory: Category = {
      ...mockCategories[0],
      id: 999
    };
    
    const result = updateCategory(mockCategories, nonExistentCategory);
    
    expect(result).toEqual(mockCategories);
  });

  test('should handle empty categories array', () => {
    const result = updateCategory([], mockCategories[0]);
    
    expect(result).toEqual([]);
  });
});

describe('removeCategory', () => {
  test('should remove category with matching ID', () => {
    const result = removeCategory(mockCategories, 2);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockCategories[0]);
    expect(result[1]).toEqual(mockCategories[2]);
    expect(result.find(category => category.id === 2)).toBeUndefined();
  });

  test('should not modify original categories array', () => {
    const originalCategories = [...mockCategories];
    removeCategory(mockCategories, 1);
    
    expect(mockCategories).toEqual(originalCategories);
  });

  test('should return unchanged array if category ID not found', () => {
    const result = removeCategory(mockCategories, 999);
    
    expect(result).toEqual(mockCategories);
  });

  test('should handle empty categories array', () => {
    const result = removeCategory([], 1);
    
    expect(result).toEqual([]);
  });
});