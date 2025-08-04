import type { Budget } from "../types/budget";
import type { Expense } from "../types/expense";

export function getBudgetStartDate(categoryId: number, budgets: Budget[]): string{
    const matchingBudget = budgets.find(
      (budget) => budget.categoryId === categoryId
    );
    return matchingBudget?.startDate || new Date().toISOString().split('T')[0];
  };

export function calculateAllRemainingBudgets(budgets: Budget[], expenses: Expense[]): number {
  // Calculate total budget limit
  const totalBudget = budgets.reduce((total, budget) => total + budget.limit, 0);
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Return difference
  return totalBudget - totalExpenses;
}