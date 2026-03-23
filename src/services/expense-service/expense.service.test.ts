import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { Expense } from '../../types/expense';

let mockStore: Record<string, ReturnType<typeof vi.fn>>;
let mockTransaction: { objectStore: ReturnType<typeof vi.fn> };
let mockDb: {
  transaction: ReturnType<typeof vi.fn>;
  objectStoreNames: { contains: ReturnType<typeof vi.fn> };
  createObjectStore: ReturnType<typeof vi.fn>;
};
let mockObjectStore: { createIndex: ReturnType<typeof vi.fn> };

function setupMocks() {
  mockObjectStore = { createIndex: vi.fn() };

  mockStore = {
    add: vi.fn(),
    getAll: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  mockTransaction = {
    objectStore: vi.fn().mockReturnValue(mockStore),
  };

  mockDb = {
    transaction: vi.fn().mockReturnValue(mockTransaction),
    objectStoreNames: { contains: vi.fn().mockReturnValue(false) },
    createObjectStore: vi.fn().mockReturnValue(mockObjectStore),
  };
}

function mockIndexedDBOpen(opts?: {
  triggerUpgrade?: boolean;
  fail?: boolean;
  storeExists?: boolean;
}) {
  const openRequest = {
    result: mockDb,
    onsuccess: null as ((e: unknown) => void) | null,
    onerror: null as (() => void) | null,
    onupgradeneeded: null as ((e: unknown) => void) | null,
  };

  vi.stubGlobal('indexedDB', {
    open: vi.fn(() => {
      queueMicrotask(() => {
        if (opts?.fail) {
          openRequest.onerror?.();
        } else {
          if (opts?.triggerUpgrade) {
            mockDb.objectStoreNames.contains.mockReturnValue(
              opts?.storeExists ?? false
            );
            openRequest.onupgradeneeded?.({
              target: { result: mockDb },
            });
          }
          openRequest.onsuccess?.({ target: { result: mockDb } });
        }
      });
      return openRequest;
    }),
  });
}

interface MockIDBRequest {
  result: unknown;
  onsuccess: ((event: unknown) => void) | null;
  onerror: (() => void) | null;
}

function createMockRequest(result: unknown = undefined): MockIDBRequest {
  return { result, onsuccess: null, onerror: null };
}

function resolveRequest(req: MockIDBRequest, result?: unknown) {
  if (result !== undefined) req.result = result;
  req.onsuccess?.({});
}

function rejectRequest(req: MockIDBRequest) {
  req.onerror?.();
}

async function freshExpenseDB() {
  vi.resetModules();
  setupMocks();
  mockIndexedDBOpen();
  const { expenseDB } = await import('./expense.service');
  await expenseDB.initDB();
  return expenseDB;
}

describe('ExpenseDBService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  const sampleExpense = {
    amount: 25.5,
    description: 'Lunch',
    category: 'Food',
    categoryId: 1,
    budget: 'Monthly',
    budgetId: 1,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  } as Omit<Expense, 'id'>;

  describe('initDB', () => {
    test('opens the expenseTrackerDB database', async () => {
      mockIndexedDBOpen();
      const { expenseDB } = await import('./expense.service');
      await expenseDB.initDB();

      expect(indexedDB.open).toHaveBeenCalledWith('expenseTrackerDB', 1);
    });

    test('creates expenses store with all indexes on upgrade', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: false });
      const { expenseDB } = await import('./expense.service');
      await expenseDB.initDB();

      expect(mockDb.createObjectStore).toHaveBeenCalledWith('expenses', {
        keyPath: 'id',
        autoIncrement: true,
      });
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('date', 'date');
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('category', 'category');
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('categoryId', 'categoryId');
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('createdAt', 'createdAt');
      expect(mockObjectStore.createIndex).toHaveBeenCalledTimes(4);
    });

    test('skips store creation if expenses store already exists', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: true });
      const { expenseDB } = await import('./expense.service');
      await expenseDB.initDB();

      expect(mockDb.createObjectStore).not.toHaveBeenCalled();
    });

    test('rejects when database open fails', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ fail: true });
      const { expenseDB } = await import('./expense.service');

      await expect(expenseDB.initDB()).rejects.toBe('Error opening database');
    });
  });

  describe('addExpense', () => {
    test('adds an expense and returns the new id', async () => {
      const expenseDB = await freshExpenseDB();

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = expenseDB.addExpense(sampleExpense);
      resolveRequest(addRequest, 7);

      await expect(promise).resolves.toBe(7);
      expect(mockStore.add).toHaveBeenCalledWith(sampleExpense);
    });

    test('rejects when add fails', async () => {
      const expenseDB = await freshExpenseDB();

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = expenseDB.addExpense(sampleExpense);
      rejectRequest(addRequest);

      await expect(promise).rejects.toBe('Error adding item to expenses');
    });
  });

  describe('getExpenses', () => {
    test('returns all expenses', async () => {
      const expenseDB = await freshExpenseDB();
      const expenses = [{ id: 1, ...sampleExpense }];

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = expenseDB.getExpenses();
      resolveRequest(getAllRequest, expenses);

      await expect(promise).resolves.toEqual(expenses);
    });

    test('returns empty array when no expenses exist', async () => {
      const expenseDB = await freshExpenseDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = expenseDB.getExpenses();
      resolveRequest(getAllRequest, []);

      await expect(promise).resolves.toEqual([]);
    });
  });

  describe('updateExpense', () => {
    test('updates an existing expense', async () => {
      const expenseDB = await freshExpenseDB();
      const expense = { id: 1, ...sampleExpense } as Expense;

      const putRequest = createMockRequest();
      mockStore.put.mockReturnValue(putRequest);

      const promise = expenseDB.updateExpense(expense);
      resolveRequest(putRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.put).toHaveBeenCalledWith(expense);
    });
  });

  describe('deleteExpense', () => {
    test('deletes an expense by id', async () => {
      const expenseDB = await freshExpenseDB();

      const deleteRequest = createMockRequest();
      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = expenseDB.deleteExpense(3);
      resolveRequest(deleteRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.delete).toHaveBeenCalledWith(3);
    });
  });

  describe('store name', () => {
    test('uses expenses as the store name', async () => {
      const expenseDB = await freshExpenseDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = expenseDB.getExpenses();
      resolveRequest(getAllRequest, []);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['expenses'], 'readonly');
    });
  });
});
