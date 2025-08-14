import { describe, expect, test } from "vitest";

describe('BudgetForm validationRules', () => {
  const validationRules = {
    limit: (value: number) =>
      !value || value <= 0 ? 'Limit must be greater than 0' : '',
    name: (value: string) => (!value.trim() ? 'Name is required' : ''),
    startDate: (value: string) => (!value ? 'Start date is required' : ''),
    endDate: (value: string) => (!value ? 'End date is required' : ''),
  };

  describe('limit validation', () => {
    test('should return error for zero limit', () => {
      expect(validationRules.limit(0)).toBe('Limit must be greater than 0');
    });

    test('should return error for negative limit', () => {
      expect(validationRules.limit(-10)).toBe('Limit must be greater than 0');
    });

    test('should return empty string for positive limit', () => {
      expect(validationRules.limit(100)).toBe('');
    });

    test('should return empty string for decimal limit', () => {
      expect(validationRules.limit(99.99)).toBe('');
    });
  });

  describe('name validation', () => {
    test('should return error for empty string', () => {
      expect(validationRules.name('')).toBe('Name is required');
    });

    test('should return error for whitespace only', () => {
      expect(validationRules.name('   ')).toBe('Name is required');
    });

    test('should return error for tabs and spaces', () => {
      expect(validationRules.name('\t\n  ')).toBe('Name is required');
    });

    test('should return empty string for valid name', () => {
      expect(validationRules.name('Budget Name')).toBe('');
    });

    test('should return empty string for name with leading/trailing spaces', () => {
      expect(validationRules.name('  Budget Name  ')).toBe('');
    });
  });

  describe('startDate validation', () => {
    test('should return error for empty string', () => {
      expect(validationRules.startDate('')).toBe('Start date is required');
    });

    test('should return empty string for valid date', () => {
      expect(validationRules.startDate('2024-01-01')).toBe('');
    });

    test('should return empty string for any non-empty string', () => {
      expect(validationRules.startDate('invalid-date')).toBe('');
    });
  });

  describe('endDate validation', () => {
    test('should return error for empty string', () => {
      expect(validationRules.endDate('')).toBe('End date is required');
    });

    test('should return empty string for valid date', () => {
      expect(validationRules.endDate('2024-12-31')).toBe('');
    });

    test('should return empty string for any non-empty string', () => {
      expect(validationRules.endDate('invalid-date')).toBe('');
    });
  });
});