import { describe, expect, test, vi, beforeEach } from 'vitest';
import { BaseDBService } from './base.service';

// --- Minimal IndexedDB mock ---

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

type TestItem = { id: number; name: string };

function createService(storeName = 'testStore') {
  return new BaseDBService<TestItem>(storeName);
}

describe('BaseDBService', () => {
  let mockStore: Record<string, ReturnType<typeof vi.fn>>;
  let mockTransaction: { objectStore: ReturnType<typeof vi.fn> };
  let mockDb: {
    transaction: ReturnType<typeof vi.fn>;
    objectStoreNames: { contains: ReturnType<typeof vi.fn> };
    createObjectStore: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

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
      createObjectStore: vi.fn(),
    };
  });

  function mockIndexedDBOpen(opts?: {
    triggerUpgrade?: boolean;
    fail?: boolean;
    storeExists?: boolean;
  }) {
    const openRequest: {
      result: unknown;
      onsuccess: ((e: unknown) => void) | null;
      onerror: (() => void) | null;
      onupgradeneeded: ((e: unknown) => void) | null;
    } = {
      result: mockDb,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    };

    vi.stubGlobal('indexedDB', {
      open: vi.fn(() => {
        // Schedule the callback asynchronously so handlers are attached first
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

    return openRequest;
  }

  describe('initDB', () => {
    test('opens the database and stores the reference', async () => {
      mockIndexedDBOpen();
      const service = createService();

      await service.initDB();

      expect(indexedDB.open).toHaveBeenCalledWith('expenseTrackerDB', 1);
    });

    test('creates object store on upgrade if it does not exist', async () => {
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: false });
      const service = createService('myStore');

      await service.initDB();

      expect(mockDb.createObjectStore).toHaveBeenCalledWith('myStore', {
        keyPath: 'id',
        autoIncrement: true,
      });
    });

    test('skips creating object store on upgrade if it already exists', async () => {
      mockIndexedDBOpen({ triggerUpgrade: true, storeExists: true });
      const service = createService('myStore');

      await service.initDB();

      expect(mockDb.createObjectStore).not.toHaveBeenCalled();
    });

    test('rejects when database open fails', async () => {
      mockIndexedDBOpen({ fail: true });
      const service = createService('myStore');

      await expect(service.initDB()).rejects.toBe(
        'Error opening database for myStore'
      );
    });
  });

  describe('add', () => {
    test('adds an item and returns the new id', async () => {
      mockIndexedDBOpen();
      const service = createService();
      await service.initDB();

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = service.add({ name: 'Test' } as Omit<TestItem, 'id'>);
      resolveRequest(addRequest, 42);

      await expect(promise).resolves.toBe(42);
      expect(mockStore.add).toHaveBeenCalledWith({ name: 'Test' });
    });

    test('rejects when add fails', async () => {
      mockIndexedDBOpen();
      const service = createService('items');
      await service.initDB();

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = service.add({ name: 'Test' } as Omit<TestItem, 'id'>);
      rejectRequest(addRequest);

      await expect(promise).rejects.toBe('Error adding item to items');
    });

    test('rejects when database is not initialized', async () => {
      const service = createService();

      await expect(
        service.add({ name: 'Test' } as Omit<TestItem, 'id'>)
      ).rejects.toThrow('Database not initialized');
    });
  });

  describe('getAll', () => {
    test('returns all items from the store', async () => {
      mockIndexedDBOpen();
      const service = createService();
      await service.initDB();

      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];
      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = service.getAll();
      resolveRequest(getAllRequest, items);

      await expect(promise).resolves.toEqual(items);
    });

    test('returns empty array when store is empty', async () => {
      mockIndexedDBOpen();
      const service = createService();
      await service.initDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = service.getAll();
      resolveRequest(getAllRequest, []);

      await expect(promise).resolves.toEqual([]);
    });

    test('rejects when getAll fails', async () => {
      mockIndexedDBOpen();
      const service = createService('items');
      await service.initDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = service.getAll();
      rejectRequest(getAllRequest);

      await expect(promise).rejects.toBe('Error fetching from items');
    });

    test('rejects when database is not initialized', async () => {
      const service = createService();
      await expect(service.getAll()).rejects.toThrow(
        'Database not initialized'
      );
    });
  });

  describe('update', () => {
    test('updates an existing item', async () => {
      mockIndexedDBOpen();
      const service = createService();
      await service.initDB();

      const putRequest = createMockRequest();
      mockStore.put.mockReturnValue(putRequest);

      const item = { id: 1, name: 'Updated' };
      const promise = service.update(item);
      resolveRequest(putRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.put).toHaveBeenCalledWith(item);
    });

    test('rejects when update fails', async () => {
      mockIndexedDBOpen();
      const service = createService('items');
      await service.initDB();

      const putRequest = createMockRequest();
      mockStore.put.mockReturnValue(putRequest);

      const promise = service.update({ id: 1, name: 'Updated' });
      rejectRequest(putRequest);

      await expect(promise).rejects.toBe('Error updating item in items');
    });

    test('rejects when database is not initialized', async () => {
      const service = createService();
      await expect(
        service.update({ id: 1, name: 'Test' })
      ).rejects.toThrow('Database not initialized');
    });
  });

  describe('delete', () => {
    test('deletes an item by id', async () => {
      mockIndexedDBOpen();
      const service = createService();
      await service.initDB();

      const deleteRequest = createMockRequest();
      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = service.delete(5);
      resolveRequest(deleteRequest);

      await expect(promise).resolves.toBeUndefined();
      expect(mockStore.delete).toHaveBeenCalledWith(5);
    });

    test('rejects when delete fails', async () => {
      mockIndexedDBOpen();
      const service = createService('items');
      await service.initDB();

      const deleteRequest = createMockRequest();
      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = service.delete(1);
      rejectRequest(deleteRequest);

      await expect(promise).rejects.toBe('Error deleting from items');
    });

    test('rejects when database is not initialized', async () => {
      const service = createService();
      await expect(service.delete(1)).rejects.toThrow(
        'Database not initialized'
      );
    });
  });

  describe('transaction mode', () => {
    test('add uses readwrite mode', async () => {
      mockIndexedDBOpen();
      const service = createService('myStore');
      await service.initDB();

      const addRequest = createMockRequest();
      mockStore.add.mockReturnValue(addRequest);

      const promise = service.add({ name: 'Test' } as Omit<TestItem, 'id'>);
      resolveRequest(addRequest, 1);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(
        ['myStore'],
        'readwrite'
      );
    });

    test('getAll uses readonly mode', async () => {
      mockIndexedDBOpen();
      const service = createService('myStore');
      await service.initDB();

      const getAllRequest = createMockRequest();
      mockStore.getAll.mockReturnValue(getAllRequest);

      const promise = service.getAll();
      resolveRequest(getAllRequest, []);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(
        ['myStore'],
        'readonly'
      );
    });

    test('update uses readwrite mode', async () => {
      mockIndexedDBOpen();
      const service = createService('myStore');
      await service.initDB();

      const putRequest = createMockRequest();
      mockStore.put.mockReturnValue(putRequest);

      const promise = service.update({ id: 1, name: 'X' });
      resolveRequest(putRequest);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(
        ['myStore'],
        'readwrite'
      );
    });

    test('delete uses readwrite mode', async () => {
      mockIndexedDBOpen();
      const service = createService('myStore');
      await service.initDB();

      const deleteRequest = createMockRequest();
      mockStore.delete.mockReturnValue(deleteRequest);

      const promise = service.delete(1);
      resolveRequest(deleteRequest);
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith(
        ['myStore'],
        'readwrite'
      );
    });
  });
});
