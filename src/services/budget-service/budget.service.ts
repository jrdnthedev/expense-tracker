import type { Budget } from "../../types/budget";

class BudgetDBService {
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
        
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          budgetStore.createIndex('category', 'category');
          budgetStore.createIndex('categoryId', 'categoryId');
          budgetStore.createIndex('period', 'period');
          budgetStore.createIndex('startDate', 'startDate');
        }
      };
    });
  }

  async addBudget(budget: Omit<Budget, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['budgets'], 'readwrite');
      const store = transaction.objectStore('budgets');
      const request = store.add(budget);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject('Error adding budget');
    });
  }

  async getBudgets(): Promise<Budget[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['budgets'], 'readonly');
      const store = transaction.objectStore('budgets');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching budgets');
    });
  }

  async updateBudget(budget: Budget): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['budgets'], 'readwrite');
      const store = transaction.objectStore('budgets');
      const request = store.put(budget);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error updating budget');
    });
  }

  async deleteBudget(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction(['budgets'], 'readwrite');
      const store = transaction.objectStore('budgets');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error deleting budget');
    });
  }
}

export const budgetDB = new BudgetDBService();