import { useState, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Budget } from '../../types/budget';
import type { Category } from '../../types/category';
import type { Expense } from '../../types/expense';
import type { BudgetFormRef } from '../../components/forms/budget-form/budget-form';

type BudgetFormData = {
  id?: number;
  limit: number;
  name: string;
  categoryIds: number[];
  startDate: string;
  endDate: string;
};

export function useBudgetManagement(
  categories: Category[],
  expenses: Expense[],
  nextBudgetId: number
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const dispatch = useAppDispatch();

  const addFormRef = useRef<BudgetFormRef>(null);
  const editFormRef = useRef<BudgetFormRef>(null);

  // Get initial form data
  const getInitialFormData = useCallback(
    (): BudgetFormData => ({
      id: 0,
      limit: 0,
      name: '',
      categoryIds: categories[0] ? [categories[0].id] : [],
      startDate: '',
      endDate: '',
    }),
    [categories]
  );

  // Convert Budget to form data
  const budgetToFormData = useCallback(
    (budget: Budget): BudgetFormData => ({
      id: budget.id,
      limit: budget.limit,
      name: budget.name,
      categoryIds: budget.categoryIds,
      startDate: budget.startDate,
      endDate: budget.endDate,
    }),
    []
  );

  // Save new budget
  const handleSaveBudget = useCallback(() => {
    const formData = addFormRef.current?.getFormData();
    if (!formData || !addFormRef.current?.isValid()) return;

    const newBudget: Budget = {
      ...formData,
      id: nextBudgetId,
      limit: Number(formData.limit),
    };

    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
    addFormRef.current?.reset(getInitialFormData());
    setIsModalOpen(false);
  }, [nextBudgetId, dispatch, getInitialFormData]);

  // Save budget changes
  const handleSaveChanges = useCallback(() => {
    const formData = editFormRef.current?.getFormData();
    if (!formData || !editFormRef.current?.isValid()) return;

    const updatedBudget: Budget = {
      ...formData,
      id: formData.id || 0,
      limit: Number(formData.limit),
    };

    dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
    setBudgetToEdit(null);
  }, [dispatch]);

  // Calculate spent amount for a budget
  const calculateSpentAmount = useCallback(
    (budget: Budget) => {
      return expenses
        .filter((expense) => expense.budgetId === budget.id)
        .reduce((total, expense) => total + expense.amount, 0);
    },
    [expenses]
  );

  // Delete budget
  const handleDeleteBudget = useCallback(
    (budgetId: number) => {
      dispatch({ type: 'REMOVE_BUDGET', payload: { id: budgetId } });
      setBudgetToEdit(null);
    },
    [dispatch]
  );

  return {
    isModalOpen,
    budgetToEdit,
    addFormRef,
    editFormRef,
    setIsModalOpen,
    setBudgetToEdit,
    getInitialFormData,
    budgetToFormData,
    handleSaveBudget,
    calculateSpentAmount,
    handleBudgetEdit: setBudgetToEdit,
    handleSaveChanges,
    handleDeleteBudget,
  };
}
