import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { Budget } from '../../types/budget';

// We need to mock indexedDB before importing the module since it
// instantiates BudgetDBService at the module level.

let mockStore: Record<string, ReturnType<typeof vi.fn>>;
let mockTransaction: { objectStore: ReturnType<typeof vi.fn> };
let mockDb: {
  transaction: ReturnType<typeof vi.fn>;
  objectStoreNames: { contains: ReturnType<typeof vi.fn> };
  createObjectStore: ReturnType<typeof vi.fn>;
};
let mockObjectStore: { createIndex: ReturnType<typeof vi.fn> };

function setupMocks() {
  mockObjectStore = {
    createIndex: vi.fn(),
  };

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
          openRequest.onsuccess?.({
            target: { result: mockDb },
          });
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

describe('BudgetDBService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  describe('initDB', () => {
    test('opens the expenseTrackerDB database', async () => {
      mockIndexedDBOpen();
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      expect(indexedDB.open).toHaveBeenCalledWith('expenseTrackerDB', 1);
    });

    test('creates budgets store with indexes on upgrade', async () => {
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: false });

      // Re-import to get a fresh instance
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: false });
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      expect(mockDb.createObjectStore).toHaveBeenCalledWith('budgets', {
        keyPath: 'id',
        autoIncrement: true,
      });
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith(
        'category',
        'category'
      );
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith(
        'categoryId',
        'categoryId'
      );
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith(
        'period',
        'period'
      );
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith(
        'startDate',
        'startDate'
      );
    });

    test('skips store creation if budgets store already exists', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: true });
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      expect(mockDb.createObjectStore).not.toHaveBeenCalled();
    });

    test('rejects when database open fails', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ fail: true });
      const { budgetDB } = await import('./budget.service');

      await expect(budgetDB.initDB()).rejects.toBe(
        'Error opening database'
      );
    });
  });

  describe('addBudget', () => {
    test('delegates to base add method', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen();
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      const budget = {
        name: 'Monthly',
        categoryIds: [1],
        limit: 500,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      } as Omit<Budget, 'id'>;

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = budgetDB.addBudget(budget);
      resolveRequest(addRequest, 1);

      await expect(promise).resolves.toBe(1);
      expect(mockStore.add).toHaveBeenCalledWith(budget);
    });
  });

  describe('getBudgets', () => {
    test('delegates to base getAll method', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen();
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      const budgets = [
        { id: 1, name: 'A', categoryIds: [], limit: 100, startDate: '', endDate: '' },
      ];
      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = budgetDB.getBudgets();
      resolveRequest(getAllRequest, budgets);

      await expect(promise).resolves.toEqual(budgets);
    });
  });

  describe('updateBudget', () => {
    test('delegates to base update method', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen();
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      const budget = {
        id: 1,
        name: 'Updated',
        categoryIds: [1],
        limit: 600,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      } as Budget;

      const putRequest = createMockRequest();
      mockStore.put.mockReturnValue(putRequest);

      const promise = budgetDB.updateBudget(budget);
      resolveRequest(putRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.put).toHaveBeenCalledWith(budget);
    });
  });

  describe('deleteBudget', () => {
    test('delegates to base delete method', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen();
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      const deleteRequest = createMockRequest();
      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = budgetDB.deleteBudget(5);
      resolveRequest(deleteRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.delete).toHaveBeenCalledWith(5);
    });
  });

  describe('store name', () => {
    test('uses budgets as the store name for transactions', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen();
      const { budgetDB } = await import('./budget.service');
      await budgetDB.initDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = budgetDB.getBudgets();
      resolveRequest(getAllRequest, []);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(
        ['budgets'],
        'readonly'
      );
    });
  });
});
