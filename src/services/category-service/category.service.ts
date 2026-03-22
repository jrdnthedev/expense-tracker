import type { Category } from "../../types/category";
import { BaseDBService } from "../base-service/base.service";

class CategoryDBService extends BaseDBService<Category> {
  constructor() {
    super('categories');
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
        if (!db.objectStoreNames.contains('categories')) {
          const store = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('name', 'name');
        }
      };
    });
  }

  addCategory(category: Omit<Category, 'id'>) { return this.add(category); }
  getCategories() { return this.getAll(); }
  updateCategory(category: Category) { return this.update(category); }
  deleteCategory(id: number) { return this.delete(id); }
}

export const categoryDB = new CategoryDBService();