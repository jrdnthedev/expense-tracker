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
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();
  
  return expenses
    .filter(expense => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate.getUTCMonth() === currentMonth && 
             expenseDate.getUTCFullYear() === currentYear;
    })
    .reduce((total, expense) => total + expense.amount, 0);
};