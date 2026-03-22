import { budgetDB } from "../budget-service/budget.service";
import { categoryDB } from "../category-service/category.service";
import { expenseDB } from "../expense-service/expense.service";

export const initializeDatabase = async () => {
  try {
    await Promise.all([
      expenseDB.initDB(),
      categoryDB.initDB(),
      budgetDB.initDB()
    ]);
    return true;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to initialize database');
  }
};