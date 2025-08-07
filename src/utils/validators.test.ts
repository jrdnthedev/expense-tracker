import { describe, test, expect } from 'vitest';
import { validateEndDate, validateBudgetForm, formatDate } from './validators';
import type { Budget } from '../types/budget';

// Mock Budget data
const createMockBudget = (overrides: Partial<Budget> = {}): Budget => ({
  id: 1,
  category: 'Food',
  name: 'Test Budget',
  categoryIds: [1],
  limit: 500,
  startDate: '2025-08-01T00:00:00Z',
  endDate: '2025-08-31T23:59:59Z',
  expenseIds: [],
  ...overrides
});

describe('validateEndDate', () => {
  test('should return true when end date is after start date', () => {
    const budget = createMockBudget({
      startDate: '2025-08-01T00:00:00Z',
      endDate: '2025-08-31T23:59:59Z'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });

  test('should return false when end date is before start date', () => {
    const budget = createMockBudget({
      startDate: '2025-08-31T00:00:00Z',
      endDate: '2025-08-01T23:59:59Z'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when end date equals start date', () => {
    const budget = createMockBudget({
      startDate: '2025-08-15T12:00:00Z',
      endDate: '2025-08-15T12:00:00Z'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(false);
  });

  test('should return true when start date is missing', () => {
    const budget = createMockBudget({
      startDate: '',
      endDate: '2025-08-31T23:59:59Z'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });

  test('should return true when end date is missing', () => {
    const budget = createMockBudget({
      startDate: '2025-08-01T00:00:00Z',
      endDate: ''
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });

  test('should return true when both dates are missing', () => {
    const budget = createMockBudget({
      startDate: '',
      endDate: ''
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });

  test('should handle different date formats correctly', () => {
    const budget = createMockBudget({
      startDate: '2025-08-01',
      endDate: '2025-08-31'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });

  test('should handle dates across years', () => {
    const budget = createMockBudget({
      startDate: '2025-12-01T00:00:00Z',
      endDate: '2026-01-31T23:59:59Z'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });

  test('should handle same day but different times', () => {
    const budget = createMockBudget({
      startDate: '2025-08-15T09:00:00Z',
      endDate: '2025-08-15T17:00:00Z'
    });
    
    const result = validateEndDate(budget);
    
    expect(result).toBe(true);
  });
});

describe('validateBudgetForm', () => {
  test('should return true for valid budget form', () => {
    const validBudget = createMockBudget();
    
    const result = validateBudgetForm(validBudget);
    
    expect(result).toBe(true);
  });

  test('should return false when name is missing', () => {
    const budget = createMockBudget({ name: '' });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when name is whitespace only', () => {
    const budget = createMockBudget({ name: '   ' });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when start date is missing', () => {
    const budget = createMockBudget({ startDate: '' });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when end date is missing', () => {
    const budget = createMockBudget({ endDate: '' });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when limit is zero', () => {
    const budget = createMockBudget({ limit: 0 });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when limit is negative', () => {
    const budget = createMockBudget({ limit: -100 });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return true when limit is positive decimal', () => {
    const budget = createMockBudget({ limit: 250.75 });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(true);
  });

  test('should return false when end date is before start date', () => {
    const budget = createMockBudget({
      startDate: '2025-08-31T00:00:00Z',
      endDate: '2025-08-01T23:59:59Z'
    });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return false when multiple fields are invalid', () => {
    const budget = createMockBudget({
      name: '',
      limit: 0,
      startDate: '',
      endDate: ''
    });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });

  test('should return true with minimum valid values', () => {
    const budget = createMockBudget({
      name: 'A',
      limit: 0.01,
      startDate: '2025-08-01T00:00:00Z',
      endDate: '2025-08-01T00:00:01Z'
    });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(true);
  });

  test('should handle string limit values', () => {
    const budget = createMockBudget({ limit: 500 });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(true);
  });

  test('should return false for string limit of zero', () => {
    const budget = createMockBudget({ limit: 0 });
    
    const result = validateBudgetForm(budget);
    
    expect(result).toBe(false);
  });
});

describe('formatDate', () => {
  test('should format ISO date string correctly', () => {
    const result = formatDate('2025-08-15T12:30:45Z');
    
    expect(result).toBe('Aug 15, 2025');
  });

  test('should format date without time correctly', () => {
    const result = formatDate('2025-12-25');
    
    expect(result).toBe('Dec 25, 2025');
  });

  test('should handle first day of year', () => {
    const result = formatDate('2025-01-01T00:00:00Z');
    
    expect(result).toBe('Jan 1, 2025');
  });

  test('should handle last day of year', () => {
    const result = formatDate('2025-12-31T23:59:59Z');
    
    expect(result).toBe('Dec 31, 2025');
  });

  test('should handle leap year date', () => {
    const result = formatDate('2024-02-29T12:00:00Z');
    
    expect(result).toBe('Feb 29, 2024');
  });

  test('should format single digit day correctly', () => {
    const result = formatDate('2025-03-05T10:00:00Z');
    
    expect(result).toBe('Mar 5, 2025');
  });

  test('should format single digit month correctly', () => {
    const result = formatDate('2025-02-15T10:00:00Z');
    
    expect(result).toBe('Feb 15, 2025');
  });

  test('should handle different time zones in ISO string', () => {
    const result = formatDate('2025-08-15T12:30:45+05:30');
    
    expect(result).toBe('Aug 15, 2025');
  });

  test('should handle negative timezone offset', () => {
    const result = formatDate('2025-08-15T12:30:45-07:00');
    
    expect(result).toBe('Aug 15, 2025');
  });
});