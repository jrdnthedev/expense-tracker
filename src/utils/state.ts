import type { Budget } from "../types/budget";
import type { Category } from "../types/category";
import type { Expense } from "../types/expense";

export function addExpenseIdToBudget(
  budgets: Budget[],
  expenseId: number,
  budgetId: number
): Budget[] {
  return budgets.map((budget) =>
    budget.id === budgetId
      ? {
          ...budget,
          expenseIds: [...budget.expenseIds, expenseId],
        }
      : budget
  );
}

export function updateExpense(expenses: Expense[], updatedExpense: Expense): Expense[] {
  return expenses.map((expense) =>
    expense.id === updatedExpense.id ? updatedExpense : expense
  );
}

export function removeExpenseFromList(expenses: Expense[], expenseId: number): Expense[] {
  return expenses.filter((expense) => expense.id !== expenseId);
}

export function removeExpenseFromBudgets(budgets: Budget[], expenseId: number): Budget[] {
  return budgets.map((budget) => ({
    ...budget,
    expenseIds: budget.expenseIds.filter((id) => id !== expenseId),
  }));
}

export function updateBudget(budgets: Budget[], updatedBudget: Budget): Budget[] {
  return budgets.map((budget) =>
    budget.id === updatedBudget.id ? updatedBudget : budget
  );
}

export function updateCategory(categories: Category[], updatedCategory: Category): Category[] {
  return categories.map((category) =>
    category.id === updatedCategory.id ? updatedCategory : category
  );
}

export function removeCategory(categories: Category[], categoryId: number): Category[] {
  return categories.filter((category) => category.id !== categoryId);
}