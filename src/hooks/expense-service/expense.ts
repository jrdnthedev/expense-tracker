import { useEffect, useState } from "react";
import type { Expense } from "../../types/expense";
import { dbService } from "../../services/expense-service/expense.service";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await dbService.initDB();
        const data = await dbService.getExpenses();
        setExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDB();

    return () => {
      setExpenses([]);
      setError(null);
    };
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const id = await dbService.addExpense(expense);
      setExpenses(prev => [...prev, { ...expense, id }]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding expense');
      throw err;
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      await dbService.updateExpense(expense);
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
      await dbService.deleteExpense(id);
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