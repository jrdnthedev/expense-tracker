import React, { useReducer } from 'react';
import type { Category } from '../types/category';
import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Currency } from '../types/currency';
import {
  AppDispatchContext,
  AppStateContext,
  initialState,
} from './app-state-contexts';
import { addExpenseIdToBudget, removeCategory, removeExpenseFromBudgets, removeExpenseFromList, updateBudget, updateCategory, updateExpense } from '../utils/state';

export type State = {
  currency: Currency;
  defaultCategory: number;
  budgets: Budget[];
  categories: Category[];
  expenses: Expense[];
};

export type Action =
  | { type: 'SET_CURRENCY'; payload: Currency }
  // Add other actions here
  //   | { type: "RESET_STATE" }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: { id: number } }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'REMOVE_CATEGORY'; payload: { id: number } }
  | { type: 'SET_DEFAULT_CATEGORY'; payload: { categoryId: number } };



function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_DEFAULT_CATEGORY':
      return { ...state, defaultCategory: action.payload.categoryId };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'REMOVE_CATEGORY':
      return {
        ...state,
        categories: removeCategory(state.categories, action.payload.id),
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: updateCategory(state.categories, action.payload),
      };
    case 'ADD_EXPENSE': {
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        budgets: addExpenseIdToBudget(state.budgets, action.payload.id, action.payload.budgetId),
      };
    }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: updateExpense(state.expenses, action.payload),
      };
    case 'REMOVE_EXPENSE': {
      return {
        ...state,
        expenses: removeExpenseFromList(state.expenses, action.payload.id),
        budgets: removeExpenseFromBudgets(state.budgets, action.payload.id),
      };
    }
    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
      };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: updateBudget(state.budgets, action.payload),
      };
    default:
      return state;
  }
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
