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
import {
  removeBudget,
  removeCategory,
  removeExpenseFromList,
  updateBudget,
  updateCategory,
  updateExpense
} from '../utils/state';

export type State = {
  currency: Currency;
  defaultCategory: number;
  budgets: Budget[];
  categories: Category[];
  expenses: Expense[];
  theme: 'light' | 'dark';
};

export type Action =
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'REMOVE_BUDGET'; payload: { id: number } }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: { id: number } }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'REMOVE_CATEGORY'; payload: { id: number } }
  | { type: 'SET_DEFAULT_CATEGORY'; payload: { categoryId: number } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };



// Action handlers for better organization
const actionHandlers = {
  SET_CURRENCY: (state: State, payload: Currency): State => ({
    ...state,
    currency: payload
  }),

  SET_DEFAULT_CATEGORY: (state: State, payload: { categoryId: number }): State => ({
    ...state,
    defaultCategory: payload.categoryId
  }),

  ADD_CATEGORY: (state: State, payload: Category): State => ({
    ...state,
    categories: [...state.categories, payload]
  }),

  REMOVE_CATEGORY: (state: State, payload: { id: number }): State => ({
    ...state,
    categories: removeCategory(state.categories, payload.id)
  }),

  UPDATE_CATEGORY: (state: State, payload: Category): State => ({
    ...state,
    categories: updateCategory(state.categories, payload)
  }),

  ADD_EXPENSE: (state: State, payload: Expense): State => ({
    ...state,
    expenses: [...state.expenses, payload]
  }),

  UPDATE_EXPENSE: (state: State, payload: Expense): State => ({
    ...state,
    expenses: updateExpense(state.expenses, payload)
  }),

  REMOVE_EXPENSE: (state: State, payload: { id: number }): State => ({
    ...state,
    expenses: removeExpenseFromList(state.expenses, payload.id)
  }),

  ADD_BUDGET: (state: State, payload: Budget): State => ({
    ...state,
    budgets: [...state.budgets, payload]
  }),

  UPDATE_BUDGET: (state: State, payload: Budget): State => ({
    ...state,
    budgets: updateBudget(state.budgets, payload)
  }),

  REMOVE_BUDGET: (state: State, payload: { id: number }): State => ({
    ...state,
    budgets: removeBudget(state.budgets, payload.id)
  }),

  SET_THEME: (state: State, payload: 'light' | 'dark'): State => ({
    ...state,
    theme: payload
  })
};

function appReducer(state: State, action: Action): State {
  const handler = actionHandlers[action.type];
  if (handler) {
    return handler(state, action.payload as never);
  }
  return state;
}

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * App Provider component that wraps the application with state management context
 * Provides access to application state and dispatch function throughout the component tree
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
