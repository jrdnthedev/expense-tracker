import type { Budget } from "../types/budget";

export function getBudgetStartDate(categoryId: number, budgets: Budget[]): string{
    const matchingBudget = budgets.find(
      (budget) => budget.categoryId === categoryId
    );
    return matchingBudget?.startDate || new Date().toISOString().split('T')[0];
  };
