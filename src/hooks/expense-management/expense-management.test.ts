import { renderHook, act } from '@testing-library/react';
import { test, expect, vi, beforeEach } from 'vitest';
import { useExpenseManagement } from './expense-management';
import type { Category } from '../../types/category';
import type { Budget } from '../../types/budget';
import type { Expense } from '../../types/expense';

// Mock the app dispatch hook
const mockDispatch = vi.fn();
vi.mock('../../context/app-state-hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '' },
  { id: 2, name: 'Transport', icon: '' },
];

const mockBudgets: Budget[] = [
  { id: 1, name: 'Monthly Budget', limit: 1000, categoryIds: [1], startDate: '2024-01-01', endDate: '2024-01-31' },
  { id: 2, name: 'Travel Budget', limit: 500, categoryIds: [2], startDate: '2024-02-01', endDate: '2024-02-29' },
];

const mockExpense: Expense = {
  id: 1,
  amount: 100,
  description: 'Groceries',
  categoryId: 1,
  category: 'Food',
  budgetId: 1,
  budget: 'Monthly Budget',
  createdAt: '2024-01-01T10:00:00.000Z',
  updatedAt: '2024-01-01T10:00:00.000Z',
};

beforeEach(() => {
  mockDispatch.mockClear();
  vi.clearAllTimers();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
});

test('initializes with correct default state', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  expect(result.current.isAddExpenseModalOpen).toBe(false);
  expect(result.current.expenseToEdit).toBe(null);
  expect(result.current.expenseToDelete).toBe(null);
  expect(result.current.addFormRef.current).toBe(null);
  expect(result.current.editFormRef.current).toBe(null);
});

test('getInitialFormData returns correct structure', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  const initialData = result.current.getInitialFormData();

  expect(initialData).toEqual({
    id: 0,
    amount: 0,
    description: '',
    categoryId: 1,
    category: 'Food',
    budgetId: 1,
    budget: 'Monthly Budget',
    createdAt: '2024-01-15T12:00:00.000Z',
  });
});

test('expenseToFormData converts expense correctly', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  const formData = result.current.expenseToFormData(mockExpense);

  expect(formData).toEqual({
    id: 1,
    amount: 100,
    description: 'Groceries',
    categoryId: 1,
    category: 'Food',
    budgetId: 1,
    budget: 'Monthly Budget',
    createdAt: '2024-01-01T10:00:00.000Z',
  });
});

test('handleAddExpense dispatches ADD_EXPENSE when form is valid', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  // Mock the form ref
  const mockFormRef = {
    getFormData: vi.fn(() => ({
      id: 0,
      amount: 50,
      description: 'Test expense',
      categoryId: 1,
      category: 'Food',
      budgetId: 1,
      budget: 'Monthly Budget',
      createdAt: '2024-01-15T12:00:00.000Z',
    })),
    isValid: vi.fn(() => true),
    reset: vi.fn(),
  };

  result.current.addFormRef.current = mockFormRef;

  act(() => {
    result.current.handleAddExpense(5);
  });

  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'ADD_EXPENSE',
    payload: {
      id: 5,
      amount: 50,
      description: 'Test expense',
      categoryId: 1,
      category: 'Food',
      budgetId: 1,
      budget: 'Monthly Budget',
      createdAt: '2024-01-15T12:00:00.000Z',
      updatedAt: '2024-01-15T12:00:00.000Z',
    },
  });
  expect(mockFormRef.reset).toHaveBeenCalled();
  expect(result.current.isAddExpenseModalOpen).toBe(false);
});

test('handleSave dispatches UPDATE_EXPENSE when form is valid', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  // Set expense to edit first
  act(() => {
    result.current.setExpenseToEdit(mockExpense);
  });

  // Mock the form ref
  const mockFormRef = {
    getFormData: vi.fn(() => ({
      id: 1,
      amount: 150,
      description: 'Updated groceries',
      categoryId: 2,
      category: 'Transport',
      budgetId: 2,
      budget: 'Travel Budget',
      createdAt: '2024-01-01T10:00:00.000Z',
    })),
    isValid: vi.fn(() => true),
    reset: vi.fn(),
  };

  result.current.editFormRef.current = mockFormRef;

  act(() => {
    result.current.handleSave();
  });

  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'UPDATE_EXPENSE',
    payload: {
      ...mockExpense,
      amount: 150,
      description: 'Updated groceries',
      categoryId: 2,
      budgetId: 2,
      updatedAt: '2024-01-15T12:00:00.000Z',
    },
  });
  expect(result.current.expenseToEdit).toBe(null);
});

test('handleDeleteExpense dispatches REMOVE_EXPENSE', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  act(() => {
    result.current.handleDeleteExpense(1);
  });

  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'REMOVE_EXPENSE',
    payload: { id: 1 },
  });
  expect(result.current.expenseToDelete).toBe(null);
});

test('modal and edit states can be updated', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  // Test modal state
  act(() => {
    result.current.setIsAddExpenseModalOpen(true);
  });
  expect(result.current.isAddExpenseModalOpen).toBe(true);

  // Test expense to edit state
  act(() => {
    result.current.setExpenseToEdit(mockExpense);
  });
  expect(result.current.expenseToEdit).toBe(mockExpense);

  // Test expense to delete state
  act(() => {
    result.current.setExpenseToDelete(1);
  });
  expect(result.current.expenseToDelete).toBe(1);
});

test('does not add expense when form is invalid', () => {
  const { result } = renderHook(() =>
    useExpenseManagement(mockCategories, mockBudgets)
  );

  // Mock invalid form ref
  const mockFormRef = {
    getFormData: vi.fn(() => ({
      id: 0,
      amount: 0,
      description: '',
      categoryId: 1,
      category: 'Food',
      budgetId: 1,
      budget: 'Monthly Budget',
      createdAt: '2024-01-15T12:00:00.000Z',
    })),
    isValid: vi.fn(() => false),
    reset: vi.fn(),
  };

  result.current.addFormRef.current = mockFormRef;

  act(() => {
    result.current.handleAddExpense(5);
  });

  expect(mockDispatch).not.toHaveBeenCalled();
  expect(mockFormRef.reset).not.toHaveBeenCalled();
});