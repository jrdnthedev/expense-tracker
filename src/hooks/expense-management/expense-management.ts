import { useState, useCallback } from 'react';
import type { Expense } from '../../types/expense';
import type { Category } from '../../types/category';
import type { Budget } from '../../types/budget';
import { useAppDispatch } from '../../context/app-state-hooks';

const DEFAULT_EXPENSE_STATE: Expense = {
  amount: 0,
  description: '',
  category: '',
  categoryId: 1,
  budget: '',
  budgetId: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  id: 0,
};

export function useExpenseManagement(categories: Category[], budgets: Budget[]) {
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [formState, setFormState] = useState<Expense>(DEFAULT_EXPENSE_STATE);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleFieldChange = useCallback(
    (field: string, value: string | number) =>
      setFormState((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleDeleteExpense = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: { id } });
    setExpenseToDelete(null);
  }, [dispatch]);

  const handleSave = useCallback(() => {
    if (!expenseToEdit || typeof expenseToEdit.id !== 'number') return;

    const newCategory = categories.find((cat) => cat.id === formState.categoryId)?.name ?? '';
    const updatedExpense: Expense = {
      ...formState,
      amount: Number(formState.amount),
      category: newCategory.toLowerCase(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    if (expenseToEdit.budgetId !== formState.budgetId) {
      // Remove expense from old budget
      if (expenseToEdit.budgetId) {
        const oldBudget = budgets.find((b) => b.id === expenseToEdit.budgetId);
        if (oldBudget) {
          dispatch({
            type: 'UPDATE_BUDGET',
            payload: {
              ...oldBudget,
              expenseIds: oldBudget.expenseIds.filter(id => id !== expenseToEdit.id),
            },
          });
        }
      }

      // Add expense to new budget
      if (formState.budgetId) {
        const newBudget = budgets.find((b) => b.id === formState.budgetId);
        if (newBudget) {
          dispatch({
            type: 'UPDATE_BUDGET',
            payload: {
              ...newBudget,
              expenseIds: [...newBudget.expenseIds, expenseToEdit.id],
            },
          });
        }
      }
    }
    setExpenseToEdit(null);
  }, [categories, dispatch, expenseToEdit, formState]);

  const handleReset = useCallback(() => {
    setFormState(DEFAULT_EXPENSE_STATE);
    setExpenseToEdit(null);
  }, []);

  const handleFormEdit = useCallback((expense: Expense) => {
    setExpenseToEdit(expense);
    setFormState({
      ...expense,
      amount: Number(expense.amount),
      description: expense.description,
      category: categories.find((cat) => cat.id === expense.categoryId)?.name || '',
      categoryId: expense.categoryId,
    });
  }, [categories]);

  const handleAddExpense = useCallback((id: number) => {
    const newExpense: Expense = {
      id,
      amount: Number(formState.amount),
      description: formState.description,
      category: categories.find((cat) => cat.id === formState.categoryId)?.name || '',
      categoryId: formState.categoryId,
      budget: formState.budget,
      budgetId: formState.budgetId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });

    if (formState.budgetId) {
      const budget = budgets.find((b) => b.id === formState.budgetId);
      if (budget) {
        dispatch({
          type: 'UPDATE_BUDGET',
          payload: {
            ...budget,
            expenseIds: [...budget.expenseIds, newExpense.id],
          },
        });
      }
    }

    setIsAddExpenseModalOpen(false);
    setFormState(DEFAULT_EXPENSE_STATE);
  }, [categories, budgets, dispatch, formState]);

  return {
    expenseToEdit,
    expenseToDelete,
    formState,
    isAddExpenseModalOpen,
    setExpenseToDelete,
    setIsAddExpenseModalOpen,
    handleFieldChange,
    handleDeleteExpense,
    handleSave,
    handleReset,
    handleFormEdit,
    handleAddExpense,
  };
}