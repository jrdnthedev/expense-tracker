import { describe, test, expect, vi } from 'vitest';
import { DataExport } from './data-export';
import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Category } from '../types/category';
import { CURRENCIES } from '../types/currency';

// Mock data
const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' }
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 25.50,
    description: 'Lunch at restaurant',
    category: 'Food',
    categoryId: 1,
    budget: 'Monthly Food',
    budgetId: 1,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 2,
    amount: 15.00,
    description: 'Bus ticket',
    category: 'Transport',
    categoryId: 2,
    budget: 'Transport Budget',
    budgetId: 2,
    createdAt: '2024-01-16T08:30:00Z',
    updatedAt: '2024-01-16T08:30:00Z'
  }
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly Food',
    categoryIds: [1],
    limit: 500,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  {
    id: 2,
    name: 'Transport Budget',
    categoryIds: [2],
    limit: 200,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }
];

describe('DataExport', () => {
  describe('exportToJSON', () => {
    test('should export data to JSON format', () => {
      const exportData = {
        expenses: mockExpenses,
        budgets: mockBudgets,
        categories: mockCategories,
        currency: CURRENCIES.USD,
        exportDate: '2024-01-20T10:00:00Z',
        version: '1.0'
      };

      const result = DataExport.exportToJSON(exportData);
      const parsed = JSON.parse(result);

      expect(parsed.expenses).toHaveLength(2);
      expect(parsed.budgets).toHaveLength(2);
      expect(parsed.categories).toHaveLength(2);
      expect(parsed.currency).toEqual(CURRENCIES.USD);
      expect(parsed.version).toBe('1.0');
    });
  });

  describe('exportExpensesToCSV', () => {
    test('should export expenses to CSV format', () => {
      const result = DataExport.exportExpensesToCSV(mockExpenses, mockCategories, CURRENCIES.USD);
      
      const lines = result.split('\n');
      expect(lines[0]).toBe('Date,Description,Amount,Currency,Category,Budget,Created At,Updated At');
      expect(lines).toHaveLength(3); // Header + 2 data rows
      
      // Check first expense row
      expect(lines[1]).toContain('25.5');
      expect(lines[1]).toContain('Lunch at restaurant');
      expect(lines[1]).toContain('Food');
      expect(lines[1]).toContain('USD');
    });

    test('should handle empty expenses array', () => {
      const result = DataExport.exportExpensesToCSV([], mockCategories, CURRENCIES.USD);
      expect(result).toBe('No expenses to export');
    });

    test('should escape quotes in descriptions', () => {
      const expenseWithQuotes: Expense[] = [{
        id: 1,
        amount: 10,
        description: 'Lunch at "Best Restaurant"',
        category: 'Food',
        categoryId: 1,
        budget: 'Food Budget',
        budgetId: 1,
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z'
      }];

      const result = DataExport.exportExpensesToCSV(expenseWithQuotes, mockCategories, CURRENCIES.USD);
      expect(result).toContain('"Lunch at ""Best Restaurant"""');
    });
  });

  describe('exportBudgetsToCSV', () => {
    test('should export budgets to CSV format', () => {
      const result = DataExport.exportBudgetsToCSV(mockBudgets, mockCategories, CURRENCIES.USD);
      
      const lines = result.split('\n');
      expect(lines[0]).toBe('Name,Limit,Currency,Categories,Start Date,End Date');
      expect(lines).toHaveLength(3); // Header + 2 data rows
      
      // Check first budget row
      expect(lines[1]).toContain('Monthly Food');
      expect(lines[1]).toContain('500');
      expect(lines[1]).toContain('USD');
      expect(lines[1]).toContain('Food');
    });

    test('should handle empty budgets array', () => {
      const result = DataExport.exportBudgetsToCSV([], mockCategories, CURRENCIES.USD);
      expect(result).toBe('No budgets to export');
    });
  });

  describe('generateFilename', () => {
    test('should generate filename with timestamp', () => {
      const result = DataExport.generateFilename('expenses', 'csv');
      expect(result).toMatch(/^expenses_\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('downloadFile', () => {
    test('should create and trigger download', () => {
      // Mock DOM methods
      const mockLink: Partial<HTMLAnchorElement> = {
        href: '',
        download: '',
        style: { display: '' } as CSSStyleDeclaration,
        click: vi.fn()
      };

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as HTMLAnchorElement);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as Node);

      // Mock URL methods - need to mock the global URL object
      const originalURL = global.URL;
      const mockURL = {
        ...originalURL,
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn()
      };
      global.URL = mockURL as unknown as typeof URL;

      DataExport.downloadFile('test content', 'test.txt', 'text/plain');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      global.URL = originalURL;
    });
  });
});
