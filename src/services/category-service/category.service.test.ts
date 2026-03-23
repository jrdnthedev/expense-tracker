import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { Category } from '../../types/category';

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

async function freshCategoryDB() {
  vi.resetModules();
  setupMocks();
  mockIndexedDBOpen();
  const { categoryDB } = await import('./category.service');
  await categoryDB.initDB();
  return categoryDB;
}

describe('CategoryDBService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  describe('initDB', () => {
    test('opens the expenseTrackerDB database', async () => {
      mockIndexedDBOpen();
      const { categoryDB } = await import('./category.service');
      await categoryDB.initDB();

      expect(indexedDB.open).toHaveBeenCalledWith('expenseTrackerDB', 1);
    });

    test('creates categories store with name index on upgrade', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: false });
      const { categoryDB } = await import('./category.service');
      await categoryDB.initDB();

      expect(mockDb.createObjectStore).toHaveBeenCalledWith('categories', {
        keyPath: 'id',
        autoIncrement: true,
      });
      expect(mockObjectStore.createIndex).toHaveBeenCalledWith('name', 'name');
      expect(mockObjectStore.createIndex).toHaveBeenCalledTimes(1);
    });

    test('skips store creation if categories store already exists', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: true });
      const { categoryDB } = await import('./category.service');
      await categoryDB.initDB();

      expect(mockDb.createObjectStore).not.toHaveBeenCalled();
    });

    test('rejects when database open fails', async () => {
      vi.resetModules();
      setupMocks();
      mockIndexedDBOpen({ fail: true });
      const { categoryDB } = await import('./category.service');

      await expect(categoryDB.initDB()).rejects.toBe('Error opening database');
    });
  });

  describe('addCategory', () => {
    test('adds a category and returns the new id', async () => {
      const categoryDB = await freshCategoryDB();
      const category = { name: 'Food', icon: '🍔' } as Omit<Category, 'id'>;

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = categoryDB.addCategory(category);
      resolveRequest(addRequest, 1);

      await expect(promise).resolves.toBe(1);
      expect(mockStore.add).toHaveBeenCalledWith(category);
    });

    test('rejects when add fails', async () => {
      const categoryDB = await freshCategoryDB();

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = categoryDB.addCategory({ name: 'X', icon: '' } as Omit<Category, 'id'>);
      rejectRequest(addRequest);

      await expect(promise).rejects.toBe('Error adding item to categories');
    });
  });

  describe('getCategories', () => {
    test('returns all categories', async () => {
      const categoryDB = await freshCategoryDB();
      const categories = [{ id: 1, name: 'Food', icon: '🍔' }];

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = categoryDB.getCategories();
      resolveRequest(getAllRequest, categories);

      await expect(promise).resolves.toEqual(categories);
    });

    test('returns empty array when no categories exist', async () => {
      const categoryDB = await freshCategoryDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = categoryDB.getCategories();
      resolveRequest(getAllRequest, []);

      await expect(promise).resolves.toEqual([]);
    });
  });

  describe('updateCategory', () => {
    test('updates an existing category', async () => {
      const categoryDB = await freshCategoryDB();
      const category = { id: 1, name: 'Updated', icon: '🍕' } as Category;

      const putRequest = createMockRequest();
      mockStore.put.mockReturnValue(putRequest);

      const promise = categoryDB.updateCategory(category);
      resolveRequest(putRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.put).toHaveBeenCalledWith(category);
    });
  });

  describe('deleteCategory', () => {
    test('deletes a category by id', async () => {
      const categoryDB = await freshCategoryDB();

      const deleteRequest = createMockRequest();
      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = categoryDB.deleteCategory(3);
      resolveRequest(deleteRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.delete).toHaveBeenCalledWith(3);
    });
  });

  describe('store name', () => {
    test('uses categories as the store name', async () => {
      const categoryDB = await freshCategoryDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = categoryDB.getCategories();
      resolveRequest(getAllRequest, []);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(['categories'], 'readonly');
    });
  });
});
