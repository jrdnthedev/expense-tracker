import { describe, test, expect } from 'vitest';
import { addExpenseIdToBudget } from './state';
import type { Budget } from '../types/budget';

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