import type { Budget } from "../types/budget";
import type { Category } from "../types/category";
import type { Expense } from "../types/expense";

export function addExpenseIdToBudget(
  budgets: Budget[],
  budgetId: number
): Budget[] {
  return budgets.map((budget: Budget) =>
    budget.id === budgetId
      ? {
          ...budget,
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

export function removeExpenseFromBudgets(budgets: Budget[]): Budget[] {
  return budgets.map((budget) => ({
    ...budget,
  }));
}

export function updateBudget(budgets: Budget[], updatedBudget: Budget): Budget[] {
  return budgets.map((budget) =>
    budget.id === updatedBudget.id ? updatedBudget : budget
  );
}

export function removeBudget(budgets: Budget[], budgetId: number): Budget[] {
  return budgets.filter((budget) => budget.id !== budgetId);
}

export function updateCategory(categories: Category[], updatedCategory: Category): Category[] {
  return categories.map((category) =>
    category.id === updatedCategory.id ? updatedCategory : category
  );
}

export function removeCategory(categories: Category[], categoryId: number): Category[] {
  return categories.filter((category) => category.id !== categoryId);
}

export function getBudgetById(budgets: Budget[], budgetId: number): Budget | undefined {
  return budgets.find((budget) => budget.id === budgetId);
}