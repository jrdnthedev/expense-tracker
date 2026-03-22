import type { Budget } from "../../types/budget";
import { BaseDBService } from "../base-service/base.service";

class BudgetDBService extends BaseDBService<Budget> {
  constructor() {
    super('budgets');
  }

  override async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('expenseTrackerDB', 1);

      request.onerror = () => reject('Error opening database');
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('budgets')) {
          const store = db.createObjectStore('budgets', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('category', 'category');
          store.createIndex('categoryId', 'categoryId');
          store.createIndex('period', 'period');
          store.createIndex('startDate', 'startDate');
        }
      };
    });
  }

  addBudget(budget: Omit<Budget, 'id'>) { return this.add(budget); }
  getBudgets() { return this.getAll(); }
  updateBudget(budget: Budget) { return this.update(budget); }
  deleteBudget(id: number) { return this.delete(id); }
}

export const budgetDB = new BudgetDBService();