import { useState } from 'react';
import { startOfDay, parseISO, isWithinInterval } from 'date-fns';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Budget } from '../../types/budget';
import type { Category } from '../../types/category';
import type { Expense } from '../../types/expense';

const DEFAULT_BUDGET_STATE: Budget = {
  id: 0,
  limit: 0,
  name: '',
  category: '',
  categoryIds: [],
  startDate: '',
  endDate: '',
  expenseIds: [],
};

export function useBudgetManagement(
  categories: Category[],
  expenses: Expense[],
  budgets: Budget[],
  nextBudgetId: number
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<Budget>({
    ...DEFAULT_BUDGET_STATE,
    category: categories[0]?.name || '',
    categoryIds: categories[0] ? [categories[0].id] : [],
  });
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const dispatch = useAppDispatch();

  const handleSaveBudget = () => {
    const categoryId = categories.find(
      (category: Category) => category.name === formState.category
    )?.id;

    // Only include expenses that aren't already assigned to other budgets
    const relevantExpenses = expenses.filter((expense: Expense) => {
      // Skip if expense is already assigned to another budget
      const isAlreadyAssigned = budgets.some((budget) =>
        budget.expenseIds.includes(expense.id)
      );
      if (isAlreadyAssigned) return false;

      // Skip if category doesn't match
      if (expense.categoryId !== categoryId) return false;

      const expenseDate = startOfDay(parseISO(expense.createdAt));
      const budgetStart = startOfDay(parseISO(formState.startDate));
      const budgetEnd = startOfDay(parseISO(formState.endDate));

      return isWithinInterval(expenseDate, {
        start: budgetStart,
        end: budgetEnd,
      });
    });

    const newBudget = {
      ...formState,
      id: nextBudgetId,
      limit: Number(formState.limit),
      categoryIds: categoryId ? [categoryId] : [],
      expenseIds: relevantExpenses.map((expense: Expense) => expense.id),
    };

    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
    setFormState({
      ...DEFAULT_BUDGET_STATE,
      category: categories[0]?.name || '',
    });
    setIsModalOpen(false);
  };

  const calculateSpentAmount = (budget: Budget) => {
    return expenses
    .filter((expense: Expense) => {
      return budget.expenseIds.includes(expense.id);
    })
      .reduce((total: number, expense: Expense) => total + expense.amount, 0);
  };

  const handleBudgetEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setFormState({
      ...budget,
      category:
        categories.find(
          (category: Category) => category.id === budget.categoryIds?.[0]
        )?.name || '',
    });
  };

  const handleSaveChanges = () => {
    if (budgetToEdit) {
      dispatch({ type: 'UPDATE_BUDGET', payload: budgetToEdit });
      setBudgetToEdit(null);
    }
  };

  const handleDeleteBudget = (budgetId: number) => {
    dispatch({ type: 'REMOVE_BUDGET', payload: { id: budgetId } });
    setBudgetToEdit(null);
  };

  const handleFieldChange = (field: string, value: string | number) => {
   setFormState((prev: Budget) => ({ ...prev, [field]: value }));
  };

  return {
    isModalOpen,
    formState,
    budgetToEdit,
    setIsModalOpen,
    setBudgetToEdit,
    handleFieldChange,
    handleSaveBudget,
    calculateSpentAmount,
    handleBudgetEdit,
    handleSaveChanges,
    handleDeleteBudget,
  };
}
