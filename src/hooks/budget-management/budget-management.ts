import { useState, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Budget } from '../../types/budget';
import type { Category } from '../../types/category';
import type { Expense } from '../../types/expense';
import type { BudgetFormRef } from '../../components/forms/budget-form/budget-form';

// Form data type
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
  budgets: Budget[],
  nextBudgetId: number
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const dispatch = useAppDispatch();

  // Refs to access form data without causing re-renders
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

  // Save new budget - gets data from form ref
  const handleSaveBudget = useCallback(() => {
    const formData = addFormRef.current?.getFormData();
    if (!formData || !addFormRef.current?.isValid()) return;

    const categoryIds = formData.categoryIds;

    const newBudget: Budget = {
      ...formData,
      id: nextBudgetId,
      limit: Number(formData.limit),
      categoryIds: categoryIds,
    };

    dispatch({ type: 'ADD_BUDGET', payload: newBudget });

    // Reset form and close modal
    addFormRef.current?.reset(getInitialFormData());
    setIsModalOpen(false);
  }, [expenses, budgets, nextBudgetId, dispatch, getInitialFormData]);

  // Save budget changes - gets data from edit form ref
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

  const calculateSpentAmount = useCallback(
    (budget: Budget) => {
      return expenses
        .filter((expense: Expense) => expense.budgetId === budget.id)
        .reduce((total: number, expense: Expense) => total + expense.amount, 0);
    },
    [expenses]
  );

  const handleBudgetEdit = useCallback((budget: Budget) => {
    setBudgetToEdit(budget);
  }, []);

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
    handleBudgetEdit,
    handleSaveChanges,
    handleDeleteBudget,
  };
}
