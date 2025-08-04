import type { Budget } from "../types/budget";
import type { Expense } from "../types/expense";

export function getBudgetStartDate(categoryId: number, budgets: Budget[]): string{
    const matchingBudget = budgets.find(
      (budget) => budget.categoryId === categoryId
    );
    return matchingBudget?.startDate || new Date().toISOString().split('T')[0];
  };

export function calculateAllRemainingBudgets(budgets: Budget[], expenses: Expense[]): number {
  const totalBudget = budgets.reduce((total, budget) => total + budget.limit, 0);
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  return totalBudget - totalExpenses;
}

export const checkBudgetThreshold = (budget: Budget, expenses: Expense[]) => {
  // Calculate spending threshold
  const totalSpent = expenses
    .filter(expense => expense.categoryId === budget.categoryId)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const remainingBudget = budget.limit - totalSpent;
  const percentageUsed = (totalSpent / budget.limit) * 100;

  // Calculate time remaining
  const now = new Date();
  const endDate = new Date(budget.endDate);
  const totalDays = (new Date(budget.endDate).getTime() - new Date(budget.startDate).getTime()) / (1000 * 3600 * 24);
  const remainingDays = (endDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
  const percentageTimeLeft = (remainingDays / totalDays) * 100;

  return {
    remainingBudget,
    percentageUsed,
    remainingDays: Math.max(0, Math.ceil(remainingDays)),
    isApproachingLimit: percentageUsed >= 80,
    isOverBudget: percentageUsed > 100,
    isEndingSoon: remainingDays <= 7,
    isCritical: percentageUsed >= 80 && remainingDays <= 7,
    percentageTimeLeft
  };
};