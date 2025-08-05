import type { Expense } from "../../types/expense";

class ExpenseDBService {
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
        
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          expenseStore.createIndex('date', 'date');
          expenseStore.createIndex('category', 'category');
          expenseStore.createIndex('categoryId', 'categoryId');
          expenseStore.createIndex('createdAt', 'createdAt');
        }
      };
    });
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['expenses'], 'readwrite');
      const store = transaction.objectStore('expenses');
      const request = store.add(expense);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject('Error adding expense');
      };
    });
  }

  async getExpenses(): Promise<Expense[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['expenses'], 'readonly');
      const store = transaction.objectStore('expenses');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject('Error fetching expenses');
      };
    });
  }

  async updateExpense(expense: Expense): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['expenses'], 'readwrite');
      const store = transaction.objectStore('expenses');
      const request = store.put(expense);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject('Error updating expense');
      };
    });
  }

  async deleteExpense(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['expenses'], 'readwrite');
      const store = transaction.objectStore('expenses');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject('Error deleting expense');
      };
    });
  }
}

export const dbService = new ExpenseDBService();