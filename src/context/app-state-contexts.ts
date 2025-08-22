import { createContext } from "react";
import type { Dispatch } from "react";
import type { State, Action } from "./app-state-context";
import { CURRENCIES } from "../types/currency";

export const initialState: State = {
  currency: CURRENCIES.USD,
  defaultCategory: 1,
  theme: 'light',
  budgets: [
    // {
    //   id: 1,
    //   name: 'test1',
    //   categoryIds: [1],
    //   limit: 500,
    //   startDate: '2023-10-01',
    //   endDate: '2023-10-31',
    // },
    // {
    //   id: 2,
    //   name: 'Transport',
    //   categoryIds: [2],
    //   limit: 200,
    //   startDate: '2023-10-02',
    //   endDate: '2023-10-31',
    // },
    // {
    //   id: 3,
    //   name: 'Entertainment',
    //   categoryIds: [3],
    //   limit: 300,
    //   startDate: '2023-10-03',
    //   endDate: '2023-10-31',
    // },
  ],
  categories: [{ name: 'Food', icon: '🍕', id: 1 },
    {
      name: 'Transport',
      icon: '🚗',
      id: 2,
    },

    { name: 'Fun', icon: '🎬', id: 3 },
    {
      name: 'Shopping',
      icon: '🛍️',
      id: 4,
    },
  ],
  expenses: [
    // {
    //   id: 1,
    //   description: 'Lunch at Cafe',
    //   amount: 15,
    //   category: 'food',
    //   categoryId: 1,
    //   createdAt: '2023-10-01T12:00:00Z',
    //   updatedAt: '2023-10-01T12:00:00Z',
    //   budget: 'test1',
    //   budgetId: 1
    // },
    // {
    //   id: 2,
    //   description: 'Bus Ticket',
    //   amount: 2.5,
    //   category: 'transport',
    //   categoryId: 2,
    //   createdAt: '2023-10-01T12:00:00Z',
    //   updatedAt: '2023-10-01T12:00:00Z',
    //   budget:'',
    //   budgetId: 2
    // },
    // {
    //   id: 3,
    //   description: 'Movie Night',
    //   amount: 12,
    //   category: 'fun',
    //   categoryId: 3,
    //   createdAt: '2023-10-01T12:00:00Z',
    //   updatedAt: '2023-10-01T12:00:00Z',
    //   budget: 'Entertainment',
    //   budgetId: 3
    // },
  ],
};
export const AppStateContext = createContext<State>(initialState);
export const AppDispatchContext = createContext<Dispatch<Action>>(() => {});