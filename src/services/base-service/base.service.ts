export class BaseDBService<T extends { id: number }> {
  private dbName = 'expenseTrackerDB';
  private version = 1;
  protected db: IDBDatabase | null = null;
  protected storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(`Error opening database for ${this.storeName}`);
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
    });
  }

  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction([this.storeName], mode);
    return transaction.objectStore(this.storeName);
  }

  async add(item: Omit<T, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite');
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(`Error adding item to ${this.storeName}`);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAll(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readonly');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(`Error fetching from ${this.storeName}`);
      } catch (err) {
        reject(err);
      }
    });
  }

  async update(item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite');
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error updating item in ${this.storeName}`);
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Error deleting from ${this.storeName}`);
      } catch (err) {
        reject(err);
      }
    });
  }
}
