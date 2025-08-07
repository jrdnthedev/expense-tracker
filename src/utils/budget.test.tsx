import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBudgetStartDate,
  calculateAllRemainingBudgets,
  checkBudgetThreshold,
} from './budget';
import type { Budget } from '../types/budget';
import type { Expense } from '../types/expense';

// Mock data
const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Food Budget',
    limit: 500,
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    categoryIds: [1, 2],
    category: 'Food',
    expenseIds: [],
  },
  {
    id: 2,
    name: 'Entertainment Budget',
    limit: 200,
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    categoryIds: [3],
    category: 'Entertainment',
    expenseIds: [],
  },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 50,
    categoryId: 1,
    description: 'Groceries',
    createdAt: '2025-08-05',
    updatedAt: '2025-08-05',
    budgetId: 1,
    budget: 'Food Budget',
    category: 'Food',
  },
  {
    id: 2,
    amount: 100,
    categoryId: 2,
    description: 'Restaurant',
    createdAt: '2025-08-06',
    updatedAt: '2025-08-06',
    budgetId: 1,
    budget: 'Food Budget',
    category: 'Food',
  },
  {
    id: 3,
    amount: 30,
    categoryId: 3,
    description: 'Movie',
    createdAt: '2025-08-07',
    updatedAt: '2025-08-07',
    budgetId: 2,
    budget: 'Entertainment Budget',
    category: 'Entertainment',
  },
];

describe('getBudgetStartDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-07'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should return start date when budget exists for category', () => {
    const result = getBudgetStartDate(1, mockBudgets);
    expect(result).toBe('2025-08-01');
  });

  test('should return start date for category in multiple budget categoryIds', () => {
    const result = getBudgetStartDate(2, mockBudgets);
    expect(result).toBe('2025-08-01');
  });

  test('should return current date when no budget exists for category', () => {
    const result = getBudgetStartDate(999, mockBudgets);
    expect(result).toBe('2025-08-07');
  });

  test('should return current date when budgets array is empty', () => {
    const result = getBudgetStartDate(1, []);
    expect(result).toBe('2025-08-07');
  });
});

describe('calculateAllRemainingBudgets', () => {
  test('should calculate correct remaining budget with positive result', () => {
    const result = calculateAllRemainingBudgets(mockBudgets, mockExpenses);
    expect(result).toBe(520); // (500 + 200) - (50 + 100 + 30)
  });

  test('should calculate correct remaining budget with negative result (overspent)', () => {
    const overspentExpenses: Expense[] = [
      {
        id: 1,
        amount: 400,
        categoryId: 1,
        description: 'Expensive meal',
        createdAt: '2025-08-05',
        updatedAt: '2025-08-05',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
      {
        id: 2,
        amount: 350,
        categoryId: 2,
        description: 'Another expense',
        createdAt: '2025-08-06',
        updatedAt: '2025-08-06',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
    ];
    const result = calculateAllRemainingBudgets(mockBudgets, overspentExpenses);
    expect(result).toBe(-50); // (500 + 200) - (400 + 350)
  });

  test('should return zero when budgets and expenses are equal', () => {
    const equalExpenses: Expense[] = [
      {
        id: 1,
        amount: 700,
        categoryId: 1,
        description: 'Equal expense',
        createdAt: '2025-08-05',
        updatedAt: '2025-08-05',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
    ];
    const result = calculateAllRemainingBudgets(mockBudgets, equalExpenses);
    expect(result).toBe(0);
  });

  test('should return total budget when no expenses', () => {
    const result = calculateAllRemainingBudgets(mockBudgets, []);
    expect(result).toBe(700);
  });

  test('should return negative total expenses when no budgets', () => {
    const result = calculateAllRemainingBudgets([], mockExpenses);
    expect(result).toBe(-180);
  });

  test('should return zero when both arrays are empty', () => {
    const result = calculateAllRemainingBudgets([], []);
    expect(result).toBe(0);
  });
});

describe('checkBudgetThreshold', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-07T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should calculate normal spending scenario', () => {
    const budget = mockBudgets[0];
    const relevantExpenses = mockExpenses.filter((e) =>
      [1, 2].includes(e.categoryId)
    );

    const result = checkBudgetThreshold(budget, relevantExpenses);

    expect(result.remainingBudget).toBe(350);
    expect(result.percentageUsed).toBe(30);
    expect(result.remainingDays).toBe(24);
    expect(result.isApproachingLimit).toBe(false);
    expect(result.isOverBudget).toBe(false);
    expect(result.isEndingSoon).toBe(false);
    expect(result.isCritical).toBe(false);
  });

  test('should detect approaching limit (80%+ usage)', () => {
    const budget = mockBudgets[0];
    const highExpenses: Expense[] = [
      {
        id: 1,
        amount: 420,
        categoryId: 1,
        description: 'High expense',
        createdAt: '2025-08-05',
        updatedAt: '2025-08-05',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
    ];

    const result = checkBudgetThreshold(budget, highExpenses);

    expect(result.remainingBudget).toBe(80);
    expect(result.percentageUsed).toBe(84);
    expect(result.isApproachingLimit).toBe(true);
    expect(result.isOverBudget).toBe(false);
  });

  test('should detect over budget scenario', () => {
    const budget = mockBudgets[0];
    const overExpenses: Expense[] = [
      {
        id: 1,
        amount: 600,
        categoryId: 1,
        description: 'Over budget',
        createdAt: '2025-08-05',
        updatedAt: '2025-08-05',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
    ];

    const result = checkBudgetThreshold(budget, overExpenses);

    expect(result.remainingBudget).toBe(-100);
    expect(result.percentageUsed).toBe(120);
    expect(result.isOverBudget).toBe(true);
  });

  test('should detect ending soon scenario', () => {
    vi.setSystemTime(new Date('2025-08-26T12:00:00Z'));

    const budget = mockBudgets[0];
    const result = checkBudgetThreshold(budget, []);

    expect(result.remainingDays).toBe(5);
    expect(result.isEndingSoon).toBe(true);
  });

  test('should detect critical scenario (high spending + ending soon)', () => {
    vi.setSystemTime(new Date('2025-08-26T12:00:00Z'));

    const budget = mockBudgets[0];
    const criticalExpenses: Expense[] = [
      {
        id: 1,
        amount: 420,
        categoryId: 1,
        description: 'Critical expense',
        createdAt: '2025-08-05',
        updatedAt: '2025-08-05',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
    ];

    const result = checkBudgetThreshold(budget, criticalExpenses);

    expect(result.percentageUsed).toBe(84);
    expect(result.remainingDays).toBe(5);
    expect(result.isApproachingLimit).toBe(true);
    expect(result.isEndingSoon).toBe(true);
    expect(result.isCritical).toBe(true);
  });

  test('should handle budget with no matching expenses', () => {
    const budget = mockBudgets[1];
    const nonMatchingExpenses: Expense[] = [
      {
        id: 1,
        amount: 100,
        categoryId: 1,
        description: 'Food expense',
        createdAt: '2025-08-05',
        updatedAt: '2025-08-05',
        budgetId: 1,
        budget: 'Food Budget',
        category: 'Food',
      },
    ];

    const result = checkBudgetThreshold(budget, nonMatchingExpenses);

    expect(result.remainingBudget).toBe(200);
    expect(result.percentageUsed).toBe(0);
    expect(result.isApproachingLimit).toBe(false);
    expect(result.isOverBudget).toBe(false);
  });

  test('should handle budget that has already ended', () => {
    vi.setSystemTime(new Date('2025-09-05T12:00:00Z'));

    const budget = mockBudgets[0];
    const result = checkBudgetThreshold(budget, []);

    expect(result.remainingDays).toBe(0);
    expect(result.isEndingSoon).toBe(true);
  });

  test('should calculate percentage time left correctly', () => {
    vi.setSystemTime(new Date('2025-08-15T12:00:00Z'));

    const budget = mockBudgets[0];
    const result = checkBudgetThreshold(budget, []);

    expect(result.percentageTimeLeft).toBeCloseTo(51.67, 1);
  });
});
