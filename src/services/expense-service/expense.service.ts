import type { Expense } from "../../types/expense";
import { BaseDBService } from "../base-service/base.service";

class ExpenseDBService extends BaseDBService<Expense> {
  constructor() {
    super('expenses');
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
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('date', 'date');
          store.createIndex('category', 'category');
          store.createIndex('categoryId', 'categoryId');
          store.createIndex('createdAt', 'createdAt');
        }
      };
    });
  }

  addExpense(expense: Omit<Expense, 'id'>) { return this.add(expense); }
  getExpenses() { return this.getAll(); }
  updateExpense(expense: Expense) { return this.update(expense); }
  deleteExpense(id: number) { return this.delete(id); }
}

export const expenseDB = new ExpenseDBService();