import { useState, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Category } from '../../types/category';
import type { Budget } from '../../types/budget';
import type { Expense } from '../../types/expense'; // Adjust import path
import type { ExpenseFormRef } from '../../components/forms/expense-form/expense-form';

// Form data type
type ExpenseFormData = {
  id?: number;
  amount: number;
  description: string;
  categoryId: number;
  category: string;
  budgetId: number;
  budget: string;
  createdAt: string;
};

export function useExpenseManagement(categories: Category[], budgets: Budget[]) {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useAppDispatch();

  // Refs to access form data without causing re-renders
  const addFormRef = useRef<ExpenseFormRef>(null);
  const editFormRef = useRef<ExpenseFormRef>(null);

  // Get initial form data for new expense
  const getInitialFormData = useCallback((): ExpenseFormData => {
    const firstCategory = categories[0];
    const firstBudget = budgets[0];
    
    return {
      id: 0,
      amount: 0,
      description: '',
      categoryId: firstCategory ? firstCategory.id : 0,
      category: firstCategory ? firstCategory.name : '',
      budgetId: firstBudget ? firstBudget.id : 0,
      budget: firstBudget ? firstBudget.name : '',
      createdAt: new Date().toISOString(),
    };
  }, [categories, budgets]);

  // Convert Expense to form data
  const expenseToFormData = useCallback((expense: Expense): ExpenseFormData => {
    const category = categories.find(c => c.id === expense.categoryId);
    const budget = budgets.find(b => b.id === expense.budgetId);
    
    return {
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      categoryId: expense.categoryId,
      category: category ? category.name : '',
      budgetId: expense.budgetId || 0,
      budget: budget ? budget.name : '',
      createdAt: expense.createdAt,
    };
  }, [categories, budgets]);

  // Handle form validation changes
  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsFormValid(isValid);
  }, []);

  // Add new expense - gets data from form ref
  const handleAddExpense = useCallback((nextId: number) => {
    const formData = addFormRef.current?.getFormData();
    if (!formData || !addFormRef.current?.isValid()) return;

    const newExpense: Expense = {
      id: nextId,
      amount: Number(formData.amount),
      description: formData.description,
      categoryId: formData.categoryId,
      category: categories.find(c => c.id === formData.categoryId)?.name || '',
      budgetId: formData.budgetId,
      budget: budgets.find(b => b.id === formData.budgetId)?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    
    // Reset form and close modal
    addFormRef.current?.reset(getInitialFormData());
    setIsAddExpenseModalOpen(false);
  }, [dispatch, getInitialFormData]);

  // Save expense changes - gets data from edit form ref
  const handleSave = useCallback(() => {
    const formData = editFormRef.current?.getFormData();
    if (!formData || !editFormRef.current?.isValid() || !expenseToEdit) return;

    const updatedExpense: Expense = {
      ...expenseToEdit,
      amount: Number(formData.amount),
      description: formData.description,
      categoryId: formData.categoryId,
      budgetId: formData.budgetId,
    };

    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    setExpenseToEdit(null);
  }, [dispatch, expenseToEdit]);

  // Handle delete
  const handleDeleteExpense = useCallback((expenseId: number) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: { id: expenseId } });
    setExpenseToDelete(null);
  }, [dispatch]);

  // Reset/cancel edit
  const handleReset = useCallback(() => {
    setExpenseToEdit(null);
  }, []);

  return {
    isAddExpenseModalOpen,
    expenseToEdit,
    expenseToDelete,
    isFormValid,
    addFormRef,
    editFormRef,
    setIsAddExpenseModalOpen,
    setExpenseToEdit,
    setExpenseToDelete,
    getInitialFormData,
    expenseToFormData,
    handleValidationChange,
    handleAddExpense,
    handleSave,
    handleDeleteExpense,
    handleReset,
  };
}