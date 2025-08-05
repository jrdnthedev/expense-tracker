import { useEffect, useState } from "react";
import type { Expense } from "../../types/expense";
import { expenseDB } from "../../services/expense-service/expense.service";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await expenseDB.getExpenses();
        setExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();

    return () => {
      setExpenses([]);
      setError(null);
    };
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const id = await expenseDB.addExpense(expense);
      setExpenses(prev => [...prev, { ...expense, id }]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding expense');
      throw err;
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      await expenseDB.updateExpense(expense);
      setExpenses(prev => 
        prev.map(e => e.id === expense.id ? expense : e)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating expense');
      throw err;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await expenseDB.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting expense');
      throw err;
    }
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense
  };
};