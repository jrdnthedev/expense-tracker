import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DataImport, type ImportOptions } from './data-import';
import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Category } from '../types/category';
import { CURRENCIES } from '../types/currency';

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 25.5,
    description: 'Lunch',
    category: 'Food',
    categoryId: 1,
    budget: 'Monthly',
    budgetId: 1,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly',
    categoryIds: [1],
    limit: 500,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
];

function makeExportJSON(overrides = {}) {
  return JSON.stringify({
    expenses: mockExpenses,
    budgets: mockBudgets,
    categories: mockCategories,
    currency: CURRENCIES.USD,
    exportDate: '2024-01-20T10:00:00Z',
    version: '1.0',
    ...overrides,
  });
}

describe('DataImport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseJSON', () => {
    test('parses valid JSON export data', () => {
      const result = DataImport.parseJSON(makeExportJSON());

      expect(result.success).toBe(true);
      expect(result.message).toBe('Data parsed successfully');
      expect(result.data?.expenses).toHaveLength(1);
      expect(result.data?.budgets).toHaveLength(1);
      expect(result.data?.categories).toHaveLength(2);
      expect(result.data?.currency).toEqual(CURRENCIES.USD);
    });

    test('returns error for invalid JSON', () => {
      const result = DataImport.parseJSON('not valid json {{{');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid JSON format');
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    test('returns error for unsupported version', () => {
      const result = DataImport.parseJSON(
        makeExportJSON({ version: '99.0' })
      );

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unsupported version: 99.0');
    });

    test('defaults missing arrays to empty', () => {
      const result = DataImport.parseJSON(
        JSON.stringify({ version: '1.0' })
      );

      expect(result.success).toBe(true);
      expect(result.data?.expenses).toEqual([]);
      expect(result.data?.budgets).toEqual([]);
      expect(result.data?.categories).toEqual([]);
    });
  });

  describe('parseExpensesCSV', () => {
    const validCSV = [
      'Date,Description,Amount,Category',
      '2024-01-15,Lunch,25.50,Food',
      '2024-01-16,Bus ticket,15.00,Transport',
    ].join('\n');

    test('parses valid CSV with all required headers', () => {
      const result = DataImport.parseExpensesCSV(validCSV, mockCategories);

      expect(result.success).toBe(true);
      expect(result.data?.expenses).toHaveLength(2);
      expect(result.data!.expenses![0].description).toBe('Lunch');
      expect(result.data!.expenses![0].amount).toBe(25.5);
      expect(result.data!.expenses![1].description).toBe('Bus ticket');
    });

    test('returns error when CSV has only a header', () => {
      const result = DataImport.parseExpensesCSV(
        'Date,Description,Amount,Category',
        mockCategories
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('at least a header and one data row');
    });

    test('returns error when required headers are missing', () => {
      const csv = 'Date,Description\n2024-01-15,Lunch';
      const result = DataImport.parseExpensesCSV(csv, mockCategories);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Missing required headers');
      expect(result.message).toContain('Amount');
      expect(result.message).toContain('Category');
    });

    test('creates new category when not found in existing', () => {
      const csv = [
        'Date,Description,Amount,Category',
        '2024-01-15,Concert,50.00,Entertainment',
      ].join('\n');

      const result = DataImport.parseExpensesCSV(csv, mockCategories);

      expect(result.success).toBe(true);
      expect(result.data!.expenses![0].category).toBe('Entertainment');
    });

    test('matches categories case-insensitively', () => {
      const csv = [
        'Date,Description,Amount,Category',
        '2024-01-15,Lunch,10.00,food',
      ].join('\n');

      const result = DataImport.parseExpensesCSV(csv, mockCategories);

      expect(result.success).toBe(true);
      expect(result.data!.expenses![0].categoryId).toBe(1);
    });

    test('reports row errors without failing entire import', () => {
      const csv = [
        'Date,Description,Amount,Category',
        '2024-01-15,Lunch,25.50,Food',
        '2024-01-16,,not_a_number,',
      ].join('\n');

      const result = DataImport.parseExpensesCSV(csv, mockCategories);

      expect(result.data?.expenses?.length).toBeGreaterThanOrEqual(1);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toContain('Line 3');
    });
  });

  describe('parseCSVLine', () => {
    test('parses simple comma-separated values', () => {
      expect(DataImport.parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    test('handles quoted values containing commas', () => {
      expect(DataImport.parseCSVLine('"hello, world",b,c')).toEqual([
        'hello, world',
        'b',
        'c',
      ]);
    });

    test('handles escaped quotes inside quoted values', () => {
      expect(DataImport.parseCSVLine('"say ""hi""",b')).toEqual([
        'say "hi"',
        'b',
      ]);
    });

    test('trims whitespace around values', () => {
      expect(DataImport.parseCSVLine(' a , b , c ')).toEqual([
        'a',
        'b',
        'c',
      ]);
    });
  });

  describe('parseCSVHeaders', () => {
    test('splits and trims headers', () => {
      expect(DataImport.parseCSVHeaders(' Date , Description ')).toEqual([
        'Date',
        'Description',
      ]);
    });

    test('strips quotes from headers', () => {
      expect(DataImport.parseCSVHeaders('"Date","Amount"')).toEqual([
        'Date',
        'Amount',
      ]);
    });
  });

  describe('validateHeaders', () => {
    test('returns empty array when all required headers present', () => {
      const headers = ['Date', 'Description', 'Amount', 'Category'];
      expect(DataImport.validateHeaders(headers)).toEqual([]);
    });

    test('returns missing headers', () => {
      const headers = ['Date'];
      const missing = DataImport.validateHeaders(headers);
      expect(missing).toContain('Description');
      expect(missing).toContain('Amount');
      expect(missing).toContain('Category');
    });
  });

  describe('validateImportData', () => {
    test('passes for valid data', () => {
      const result = DataImport.validateImportData({
        version: '1.0',
        expenses: [],
        budgets: [],
        categories: [],
      });
      expect(result.success).toBe(true);
    });

    test('fails for null input', () => {
      const result = DataImport.validateImportData(null);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid data format');
    });

    test('fails for non-object input', () => {
      const result = DataImport.validateImportData('string');
      expect(result.success).toBe(false);
    });

    test('fails when expenses is not an array', () => {
      const result = DataImport.validateImportData({
        expenses: 'not-array',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Expenses must be an array');
    });

    test('fails when budgets is not an array', () => {
      const result = DataImport.validateImportData({
        budgets: 'not-array',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Budgets must be an array');
    });

    test('fails when categories is not an array', () => {
      const result = DataImport.validateImportData({
        categories: 42,
      });
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Categories must be an array');
    });

    test('collects multiple validation errors', () => {
      const result = DataImport.validateImportData({
        expenses: 'bad',
        budgets: 'bad',
        categories: 'bad',
      });
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('readFile', () => {
    test('resolves with file content', async () => {
      const content = 'file content';
      const file = new File([content], 'test.csv', { type: 'text/csv' });

      const result = await DataImport.readFile(file);
      expect(result).toBe(content);
    });
  });

  describe('mergeData', () => {
    const existing = {
      expenses: mockExpenses,
      budgets: mockBudgets,
      categories: mockCategories,
    };

    const imported = {
      expenses: [
        {
          id: 99,
          amount: 10,
          description: 'New',
          category: 'Food',
          categoryId: 1,
          budget: '',
          budgetId: 0,
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
      ] as Expense[],
      budgets: [
        {
          id: 99,
          name: 'Weekly',
          categoryIds: [1],
          limit: 100,
          startDate: '2024-02-01',
          endDate: '2024-02-07',
        },
      ] as Budget[],
      categories: [
        { id: 99, name: 'Entertainment', icon: '🎬' },
      ] as Category[],
      currency: CURRENCIES.EUR,
    };

    test('replace mode uses imported data over existing', () => {
      const options: ImportOptions = {
        mergeMode: 'replace',
        skipDuplicates: false,
      };

      const result = DataImport.mergeData(imported, existing, options);

      expect(result.expenses).toEqual(imported.expenses);
      expect(result.budgets).toEqual(imported.budgets);
      expect(result.categories).toEqual(imported.categories);
      expect(result.currency).toEqual(CURRENCIES.EUR);
    });

    test('replace mode keeps existing when imported field is undefined', () => {
      const options: ImportOptions = {
        mergeMode: 'replace',
        skipDuplicates: false,
      };

      const result = DataImport.mergeData(
        { currency: CURRENCIES.GBP },
        existing,
        options
      );

      expect(result.expenses).toEqual(existing.expenses);
      expect(result.budgets).toEqual(existing.budgets);
      expect(result.categories).toEqual(existing.categories);
    });

    test('merge mode combines expenses', () => {
      const options: ImportOptions = {
        mergeMode: 'merge',
        skipDuplicates: false,
      };

      const result = DataImport.mergeData(imported, existing, options);

      expect(result.expenses!.length).toBe(
        existing.expenses.length + imported.expenses!.length
      );
    });

    test('merge mode adds new categories but skips duplicates by name', () => {
      const options: ImportOptions = {
        mergeMode: 'merge',
        skipDuplicates: false,
      };

      const importedWithDup = {
        ...imported,
        categories: [
          { id: 99, name: 'Entertainment', icon: '🎬' },
          { id: 100, name: 'Food', icon: '🥗' }, // duplicate name
        ],
      };

      const result = DataImport.mergeData(importedWithDup, existing, options);

      const names = result.categories!.map((c) => c.name);
      expect(names.filter((n) => n === 'Food')).toHaveLength(1);
      expect(names).toContain('Entertainment');
    });

    test('merge mode skips duplicate budgets when skipDuplicates is true', () => {
      const options: ImportOptions = {
        mergeMode: 'merge',
        skipDuplicates: true,
      };

      const importedWithDupBudget = {
        ...imported,
        budgets: [
          {
            id: 99,
            name: 'Monthly',
            categoryIds: [1],
            limit: 100,
            startDate: '2024-02-01',
            endDate: '2024-02-28',
          },
        ],
      };

      const result = DataImport.mergeData(
        importedWithDupBudget,
        existing,
        options
      );

      const budgetNames = result.budgets!.map((b) => b.name);
      expect(budgetNames.filter((n) => n === 'Monthly')).toHaveLength(1);
    });

    test('merge mode adds duplicate budgets when skipDuplicates is false', () => {
      const options: ImportOptions = {
        mergeMode: 'merge',
        skipDuplicates: false,
      };

      const importedWithDupBudget = {
        ...imported,
        budgets: [
          {
            id: 99,
            name: 'Monthly',
            categoryIds: [1],
            limit: 100,
            startDate: '2024-02-01',
            endDate: '2024-02-28',
          },
        ],
      };

      const result = DataImport.mergeData(
        importedWithDupBudget,
        existing,
        options
      );

      const budgetNames = result.budgets!.map((b) => b.name);
      expect(budgetNames.filter((n) => n === 'Monthly')).toHaveLength(2);
    });

    test('returns existing data when imported is undefined', () => {
      const options: ImportOptions = {
        mergeMode: 'merge',
        skipDuplicates: false,
      };

      const result = DataImport.mergeData(undefined, existing, options);

      expect(result.expenses).toEqual(existing.expenses);
      expect(result.budgets).toEqual(existing.budgets);
      expect(result.categories).toEqual(existing.categories);
    });
  });

  describe('createErrorResult', () => {
    test('creates an error result with message', () => {
      const result = DataImport.createErrorResult('Something went wrong');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Something went wrong');
      expect(result.errors).toBeUndefined();
    });

    test('creates an error result with errors array', () => {
      const result = DataImport.createErrorResult('Failed', [
        'err1',
        'err2',
      ]);

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['err1', 'err2']);
    });
  });
});
