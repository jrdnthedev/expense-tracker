import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateTotalExpenses, getRecentExpenses, getTotalTransactions, getCurrentMonthExpenses } from './expense';
import type { Expense } from '../types/expense';

// Mock expense data
const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 50.25,
    categoryId: 1,
    description: 'Groceries',
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z',
    budgetId: 1,
    budget: 'Food Budget',
    category: 'Food'
  },
  {
    id: 2,
    amount: 120.00,
    categoryId: 2,
    description: 'Restaurant dinner',
    createdAt: '2025-08-05T19:30:00Z',
    updatedAt: '2025-08-05T19:30:00Z',
    budgetId: 1,
    budget: 'Food Budget',
    category: 'Dining'
  },
  {
    id: 3,
    amount: 30.75,
    categoryId: 3,
    description: 'Movie tickets',
    createdAt: '2025-08-03T14:15:00Z',
    updatedAt: '2025-08-03T14:15:00Z',
    budgetId: 2,
    budget: 'Entertainment Budget',
    category: 'Entertainment'
  },
  {
    id: 4,
    amount: 75.50,
    categoryId: 1,
    description: 'Weekly groceries',
    createdAt: '2025-07-28T09:00:00Z',
    updatedAt: '2025-07-28T09:00:00Z',
    budgetId: 1,
    budget: 'Food Budget',
    category: 'Food'
  },
  {
    id: 5,
    amount: 15.99,
    categoryId: 4,
    description: 'Coffee',
    createdAt: '2025-08-07T08:30:00Z',
    updatedAt: '2025-08-07T08:30:00Z',
    budgetId: 1,
    budget: 'Food Budget',
    category: 'Coffee'
  }
];

describe('calculateTotalExpenses', () => {
  test('should calculate total of all expenses', () => {
    const result = calculateTotalExpenses(mockExpenses);
    expect(result).toBe(292.49); // 50.25 + 120.00 + 30.75 + 75.50 + 15.99
  });

  test('should return 0 for empty expenses array', () => {
    const result = calculateTotalExpenses([]);
    expect(result).toBe(0);
  });

  test('should handle single expense', () => {
    const singleExpense = [mockExpenses[0]];
    const result = calculateTotalExpenses(singleExpense);
    expect(result).toBe(50.25);
  });

  test('should handle expenses with decimal amounts', () => {
    const decimalExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 10.5 },
      { ...mockExpenses[1], amount: 20.25 },
      { ...mockExpenses[2], amount: 5.99 }
    ];
    const result = calculateTotalExpenses(decimalExpenses);
    expect(result).toBe(36.74);
  });

  test('should handle zero amount expenses', () => {
    const zeroExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 0 },
      { ...mockExpenses[1], amount: 100 }
    ];
    const result = calculateTotalExpenses(zeroExpenses);
    expect(result).toBe(100);
  });
});

describe('getRecentExpenses', () => {
  test('should return expenses sorted by createdAt descending with default limit', () => {
    const result = getRecentExpenses(mockExpenses);
    
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe(5); // 2025-08-07 (most recent)
    expect(result[1].id).toBe(2); // 2025-08-05
    expect(result[2].id).toBe(3); // 2025-08-03
    expect(result[3].id).toBe(1); // 2025-08-01
    expect(result[4].id).toBe(4); // 2025-07-28 (oldest)
  });

  test('should respect custom limit parameter', () => {
    const result = getRecentExpenses(mockExpenses, 3);
    
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(5); // Most recent
    expect(result[1].id).toBe(2);
    expect(result[2].id).toBe(3);
  });

  test('should return all expenses when limit is greater than array length', () => {
    const result = getRecentExpenses(mockExpenses, 10);
    
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe(5); // Still sorted correctly
  });

  test('should return empty array for empty input', () => {
    const result = getRecentExpenses([]);
    expect(result).toEqual([]);
  });

  test('should handle limit of 0', () => {
    const result = getRecentExpenses(mockExpenses, 0);
    expect(result).toEqual([]);
  });

  test('should not mutate original array', () => {
    const originalOrder = [...mockExpenses];
    getRecentExpenses(mockExpenses);
    
    expect(mockExpenses).toEqual(originalOrder);
  });

  test('should handle expenses with same createdAt timestamp', () => {
    const sameTimeExpenses: Expense[] = [
      { ...mockExpenses[0], id: 1, createdAt: '2025-08-05T10:00:00Z' },
      { ...mockExpenses[1], id: 2, createdAt: '2025-08-05T10:00:00Z' },
      { ...mockExpenses[2], id: 3, createdAt: '2025-08-06T10:00:00Z' }
    ];
    
    const result = getRecentExpenses(sameTimeExpenses);
    
    expect(result[0].createdAt).toBe('2025-08-06T10:00:00Z');
    expect(result).toHaveLength(3);
  });
});

describe('getTotalTransactions', () => {
  test('should return correct count of expenses', () => {
    const result = getTotalTransactions(mockExpenses);
    expect(result).toBe(5);
  });

  test('should return 0 for empty array', () => {
    const result = getTotalTransactions([]);
    expect(result).toBe(0);
  });

  test('should return 1 for single expense', () => {
    const result = getTotalTransactions([mockExpenses[0]]);
    expect(result).toBe(1);
  });

  test('should count all expenses regardless of amount', () => {
    const mixedExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 0 },
      { ...mockExpenses[1], amount: 1000 },
      { ...mockExpenses[2], amount: -50 }
    ];
    const result = getTotalTransactions(mixedExpenses);
    expect(result).toBe(3);
  });
});

describe('getCurrentMonthExpenses', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-15T12:00:00Z')); // Set to August 2025
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should calculate total for current month expenses only', () => {
    const result = getCurrentMonthExpenses(mockExpenses);
    
    // August expenses: 50.25 + 120.00 + 30.75 + 15.99 = 217.00
    // July expense (75.50) should be excluded
    expect(result).toBe(216.99);
  });

  test('should return 0 when no expenses in current month', () => {
    const pastExpenses: Expense[] = [
      { ...mockExpenses[0], createdAt: '2025-07-15T10:00:00Z' },
      { ...mockExpenses[1], createdAt: '2025-06-20T10:00:00Z' }
    ];
    
    const result = getCurrentMonthExpenses(pastExpenses);
    expect(result).toBe(0);
  });

  test('should return 0 for empty expenses array', () => {
    const result = getCurrentMonthExpenses([]);
    expect(result).toBe(0);
  });

  test('should handle expenses on first day of month', () => {
    const firstDayExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 100, createdAt: '2025-08-01T00:00:00Z' }
    ];
    
    const result = getCurrentMonthExpenses(firstDayExpenses);
    expect(result).toBe(100);
  });

  test('should handle expenses on last day of month', () => {
    vi.setSystemTime(new Date('2025-08-31T23:59:59Z'));
    
    const lastDayExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 150, createdAt: '2025-08-31T23:59:59Z' }
    ];
    
    const result = getCurrentMonthExpenses(lastDayExpenses);
    expect(result).toBe(150);
  });

  test('should exclude expenses from next month', () => {
    const mixedExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 100, createdAt: '2025-08-15T10:00:00Z' },
      { ...mockExpenses[1], amount: 200, createdAt: '2025-09-01T10:00:00Z' }
    ];
    
    const result = getCurrentMonthExpenses(mixedExpenses);
    expect(result).toBe(100);
  });

  test('should handle different time zones correctly', () => {
    const timezoneExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 50, createdAt: '2025-08-01T23:00:00Z' },
      { ...mockExpenses[1], amount: 75, createdAt: '2025-08-31T01:00:00Z' }
    ];
    
    const result = getCurrentMonthExpenses(timezoneExpenses);
    expect(result).toBe(125);
  });

  test('should work correctly in different months', () => {
    vi.setSystemTime(new Date('2025-02-15T12:00:00Z')); // February
    
    const februaryExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 100, createdAt: '2025-02-10T10:00:00Z' },
      { ...mockExpenses[1], amount: 200, createdAt: '2025-01-25T10:00:00Z' }
    ];
    
    const result = getCurrentMonthExpenses(februaryExpenses);
    expect(result).toBe(100);
  });

  test('should handle leap year February correctly', () => {
    vi.setSystemTime(new Date('2024-02-15T12:00:00Z')); // 2024 is a leap year
    
    const leapYearExpenses: Expense[] = [
      { ...mockExpenses[0], amount: 100, createdAt: '2024-02-29T10:00:00Z' }
    ];
    
    const result = getCurrentMonthExpenses(leapYearExpenses);
    expect(result).toBe(100);
  });
});