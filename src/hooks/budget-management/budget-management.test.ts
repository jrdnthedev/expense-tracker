import { renderHook, act } from '@testing-library/react';
import { test, expect, vi, beforeEach } from 'vitest';
import { useBudgetManagement } from './budget-management';
import type { Budget } from '../../types/budget';
import type { Category } from '../../types/category';
import type { Expense } from '../../types/expense';

// Mock the app dispatch hook
const mockDispatch = vi.fn();
vi.mock('../../context/app-state-hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon:'' },
  { id: 2, name: 'Transport', icon: '' },
];

const mockExpenses: Expense[] = [
  { id: 1, amount: 100, budgetId: 1, categoryId: 1, description: 'Groceries', budget:'',category: '', createdAt:'', updatedAt: ''  },
  { id: 2, amount: 50, budgetId: 1, categoryId: 1, description: 'Restaurant', budget:'',category: '', createdAt:'', updatedAt: ''  },
  { id: 3, amount: 30, budgetId: 2, categoryId: 2, description: 'Bus fare', budget:'',category: '', createdAt:'', updatedAt: ''  },
];

const mockBudget: Budget = {
  id: 1,
  name: 'Monthly Budget',
  limit: 500,
  categoryIds: [1],
  startDate: '2024-01-01',
  endDate: '2024-01-31',
};

beforeEach(() => {
  mockDispatch.mockClear();
});

test('initializes with correct default state', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  expect(result.current.isModalOpen).toBe(false);
  expect(result.current.budgetToEdit).toBe(null);
  expect(result.current.addFormRef.current).toBe(null);
  expect(result.current.editFormRef.current).toBe(null);
});

test('getInitialFormData returns correct structure', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  const initialData = result.current.getInitialFormData();

  expect(initialData).toEqual({
    id: 0,
    limit: 0,
    name: '',
    categoryIds: [1],
    startDate: '',
    endDate: '',
  });
});

test('budgetToFormData converts budget correctly', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  const formData = result.current.budgetToFormData(mockBudget);

  expect(formData).toEqual({
    id: 1,
    name: 'Monthly Budget',
    limit: 500,
    categoryIds: [1],
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  });
});

test('calculateSpentAmount calculates correctly', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  const spentAmount = result.current.calculateSpentAmount(mockBudget);

  expect(spentAmount).toBe(150); // 100 + 50 from budget id 1
});

test('handleSaveBudget dispatches ADD_BUDGET when form is valid', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  // Mock the form ref
  const mockFormRef = {
    getFormData: vi.fn(() => ({
      id: 0,
      name: 'New Budget',
      limit: 1000,
      categoryIds: [1],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })),
    isValid: vi.fn(() => true),
    reset: vi.fn(),
  };

  result.current.addFormRef.current = mockFormRef;

  act(() => {
    result.current.handleSaveBudget();
  });

  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'ADD_BUDGET',
    payload: {
      id: 3,
      name: 'New Budget',
      limit: 1000,
      categoryIds: [1],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
  });
  expect(mockFormRef.reset).toHaveBeenCalled();
});

test('handleSaveChanges dispatches UPDATE_BUDGET when form is valid', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  // Mock the form ref
  const mockFormRef = {
    getFormData: vi.fn(() => ({
      id: 1,
      name: 'Updated Budget',
      limit: 800,
      categoryIds: [1, 2],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })),
    isValid: vi.fn(() => true),
    reset: vi.fn(),
  };

  result.current.editFormRef.current = mockFormRef;

  act(() => {
    result.current.handleSaveChanges();
  });

  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'UPDATE_BUDGET',
    payload: {
      id: 1,
      name: 'Updated Budget',
      limit: 800,
      categoryIds: [1, 2],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
  });
  expect(result.current.budgetToEdit).toBe(null);
});

test('handleDeleteBudget dispatches REMOVE_BUDGET', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  act(() => {
    result.current.handleDeleteBudget(1);
  });

  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'REMOVE_BUDGET',
    payload: { id: 1 },
  });
  expect(result.current.budgetToEdit).toBe(null);
});

test('modal state can be toggled', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  expect(result.current.isModalOpen).toBe(false);

  act(() => {
    result.current.setIsModalOpen(true);
  });

  expect(result.current.isModalOpen).toBe(true);
});

test('budgetToEdit state can be set', () => {
  const { result } = renderHook(() =>
    useBudgetManagement(mockCategories, mockExpenses, 3)
  );

  expect(result.current.budgetToEdit).toBe(null);

  act(() => {
    result.current.setBudgetToEdit(mockBudget);
  });

  expect(result.current.budgetToEdit).toBe(mockBudget);
});