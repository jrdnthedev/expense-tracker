import { describe, expect, test, vi, beforeEach } from 'vitest';
import { initializeDatabase } from './init.service';
import { expenseDB } from '../expense-service/expense.service';
import { budgetDB } from '../budget-service/budget.service';
import { categoryDB } from '../category-service/category.service';

vi.mock('../expense-service/expense.service', () => ({
  expenseDB: { initDB: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../budget-service/budget.service', () => ({
  budgetDB: { initDB: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../category-service/category.service', () => ({
  categoryDB: { initDB: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(expenseDB.initDB).mockResolvedValue(undefined);
  vi.mocked(budgetDB.initDB).mockResolvedValue(undefined);
  vi.mocked(categoryDB.initDB).mockResolvedValue(undefined);
});

describe('initializeDatabase', () => {
  test('initializes all three database services', async () => {
    await initializeDatabase();

    expect(expenseDB.initDB).toHaveBeenCalledOnce();
    expect(categoryDB.initDB).toHaveBeenCalledOnce();
    expect(budgetDB.initDB).toHaveBeenCalledOnce();
  });

  test('returns true on success', async () => {
    const result = await initializeDatabase();
    expect(result).toBe(true);
  });

  test('throws when expenseDB.initDB fails with an Error', async () => {
    vi.mocked(expenseDB.initDB).mockRejectedValueOnce(new Error('expense init failed'));

    await expect(initializeDatabase()).rejects.toThrow('expense init failed');
  });

  test('throws when budgetDB.initDB fails with an Error', async () => {
    vi.mocked(budgetDB.initDB).mockRejectedValueOnce(new Error('budget init failed'));

    await expect(initializeDatabase()).rejects.toThrow('budget init failed');
  });

  test('throws when categoryDB.initDB fails with an Error', async () => {
    vi.mocked(categoryDB.initDB).mockRejectedValueOnce(new Error('category init failed'));

    await expect(initializeDatabase()).rejects.toThrow('category init failed');
  });

  test('wraps non-Error throws in a new Error', async () => {
    vi.mocked(expenseDB.initDB).mockRejectedValueOnce('string error');

    await expect(initializeDatabase()).rejects.toThrow(
      'Failed to initialize database'
    );
  });

  test('re-throws Error instances as-is', async () => {
    const err = new Error('DB connection lost');
    vi.mocked(categoryDB.initDB).mockRejectedValueOnce(err);

    await expect(initializeDatabase()).rejects.toThrow(err);
  });
});
