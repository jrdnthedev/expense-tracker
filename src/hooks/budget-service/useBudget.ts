import { useEffect, useState } from "react";
import type { Budget } from "../../types/budget";
import { budgetDB } from "../../services/budget-service/budget.service";

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const data = await budgetDB.getBudgets();
        setBudgets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgets();

    return () => {
      setBudgets([]);
      setError(null);
    };
  }, []);

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      setError(null);
      const id = await budgetDB.addBudget(budget);
      setBudgets((prev: Budget[]) => [...prev, { ...budget, id }]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding budget');
      throw err;
    }
  };

  const updateBudget = async (budget: Budget) => {
    try {
      await budgetDB.updateBudget(budget);
      setBudgets((prev: Budget[]) => 
        prev.map((b: Budget) => b.id === budget.id ? budget : b)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating budget');
      throw err;
    }
  };

  const deleteBudget = async (id: number) => {
    try {
      setError(null);
      await budgetDB.deleteBudget(id);
      setBudgets((prev: Budget[]) => prev.filter((budget: Budget) => budget.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting budget');
      throw err;
    }
  };

  return {
    budgets,
    isLoading,
    error,
    addBudget,
    updateBudget,
    deleteBudget
  };
};