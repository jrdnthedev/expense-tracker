import type { Category } from "../../types/category";

class CategoryDBService {
  private dbName = 'expenseTrackerDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject('Error opening database');
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          categoryStore.createIndex('name', 'name');
        }
      };
    });
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(category);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject('Error adding category');
    });
  }

  async getCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching categories');
    });
  }

  async updateCategory(category: Category): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put(category);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error updating category');
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error deleting category');
    });
  }
}

export const categoryDB = new CategoryDBService();