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
    console.log('initialized database:');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};