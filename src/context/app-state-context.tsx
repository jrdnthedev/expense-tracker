import React, { createContext, useReducer, useContext } from "react";
import type { Dispatch } from "react";
import type { Category } from "../types/category";
import type { Expense } from "../types/expense";
import type { Budget } from "../types/budget";
import type { Currency } from "../types/currency";

type State = {
  currency: Currency,
  defaultCategory: number,
  budgets: Budget[],
  categories: Category[],
  expenses: Expense[],
};

type Action =
  | { type: "SET_CURRENCY"; payload: Currency }
  // Add other actions here
//   | { type: "RESET_STATE" }
//   | { type: "UPDATE_SETTING"; payload: { key: string; value: any } }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "REMOVE_EXPENSE"; payload: { id: number } }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
//   | { type: "UPDATE_BUDGET"; payload: { amount: number } }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "REMOVE_CATEGORY"; payload: { id: number } }
  | { type: "SET_DEFAULT_CATEGORY"; payload: { categoryId: number } };

const initialState: State = {
  currency: { value: 'usd', label: 'USD', id: 1, symbol: '$' },
  defaultCategory: 1,
  budgets: [
    {
      id: 1,
      category: 'Food',
      limit: 500,
      period: 'monthly',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
    },
    {
      id: 2,
      category: 'Transport',
      limit: 200,
      period: 'monthly',
      startDate: new Date('2023-02-01'),
      endDate: new Date('2023-02-28'),
    },
    {
      id: 3,
      category: 'Entertainment',
      limit: 300,
      period: 'monthly',
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-03-31'),
    },
    {
      id: 4,
      category: 'Shopping',
      limit: 400,
      period: 'monthly',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2023-04-30'),
    },
  ],
  categories: [
    { name: 'Food', icon: '🍕', color: '#f0c0c0', id: 1 },
    {
      name: 'Transport',
      icon: '🚗',
      color: '#f0f0f0',
      id: 2,
    },
    { name: 'Fun', icon: '🎬', color: '#c0f0c0', id: 3 },
    {
      name: 'Shopping',
      icon: '🛍️',
      color: '#f0f0c0',
      id: 4,
    },
  ],
  expenses: [
    {
      id: 1,
      description: 'Lunch at Cafe',
      amount: 15,
      category: 'food',
      categoryId: 1,
      date: '2023-10-01',
      tags: ['lunch', 'food'],
      createdAt: '2023-10-01T12:00:00Z',
      updatedAt: '2023-10-01T12:00:00Z'
    },
    {
      id: 2,
      description: 'Bus Ticket',
      amount: 2.5,
      category: 'transport',
      categoryId: 2,
      date: '2023-10-02',
      tags: ['transport'],
      createdAt: '2023-10-01T12:00:00Z',
      updatedAt: '2023-10-01T12:00:00Z'
    },
    {
      id: 3,
      description: 'Movie Night',
      amount: 12,
      category: 'fun',
      categoryId: 3,
      date: '2023-10-03',
      tags: ['movie', 'entertainment'],
      createdAt: '2023-10-01T12:00:00Z',
      updatedAt: '2023-10-01T12:00:00Z'
    },
  ],
};

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CURRENCY":
      return { ...state, currency: action.payload };
    case "SET_DEFAULT_CATEGORY":
      return { ...state, defaultCategory: action.payload.categoryId };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "REMOVE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload.id
        ),
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    case "ADD_EXPENSE":
      return {
        ...state,
        expenses: [
          ...state.expenses,
          action.payload
        ]
      };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case "REMOVE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense.id !== action.payload.id
        ),
      };
    default:
      return state;
  }
}

const AppStateContext = createContext<State>(initialState);
const AppDispatchContext = createContext<Dispatch<Action>>(() => {});

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

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);