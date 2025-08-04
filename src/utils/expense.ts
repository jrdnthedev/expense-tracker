import type { Expense } from "../types/expense";

export const calculateTotalExpenses = (expenses: Expense[]) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const getRecentExpenses = (expenses: Expense[], limit = 5): Expense[] => {
  return [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getTotalTransactions = (expenses: Expense[]): number => {
  return expenses.length;
};

export const getCurrentMonthExpenses = (expenses: Expense[]): number => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return expenses
    .filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth;
    })
    .reduce((total, expense) => total + expense.amount, 0);
};