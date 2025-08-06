import { createContext } from "react";
import type { Dispatch } from "react";
import type { State, Action } from "./app-state-context";
import { CURRENCIES } from "../types/currency";

export const initialState: State = {
  currency: CURRENCIES.USD,
  defaultCategory: 1,
  budgets: [
    // {
    //   id: 1,
    //   category: 'Food',
    //   categoryId: 1,
    //   limit: 500,
    //   period: 'monthly',
    //   startDate: '2023-10-01',
    //   endDate: '2023-10-31',
    // },
    // {
    //   id: 2,
    //   category: 'Transport',
    //   categoryId: 2,
    //   limit: 200,
    //   period: 'monthly',
    //   startDate: '2023-10-02',
    //   endDate: '2023-10-31',
    // },
    // {
    //   id: 3,
    //   category: 'Entertainment',
    //   categoryId: 3,
    //   limit: 300,
    //   period: 'monthly',
    //   startDate: '2023-10-03',
    //   endDate: '2023-10-31',
    // },
    // {
    //   id: 4,
    //   category: 'Shopping',
    //   categoryId: 4,
    //   limit: 400,
    //   period: 'monthly',
    //   startDate: '2023-04-01',
    //   endDate: '2023-04-30',
    // },
  ],
  categories: [
    // { name: 'Food', icon: '🍕', color: '#f0c0c0', id: 1 },
    // {
    //   name: 'Transport',
    //   icon: '🚗',
    //   color: '#f0f0f0',
    //   id: 2,
    // },
    // { name: 'Fun', icon: '🎬', color: '#c0f0c0', id: 3 },
    // {
    //   name: 'Shopping',
    //   icon: '🛍️',
    //   color: '#f0f0c0',
    //   id: 4,
    // },
  ],
  expenses: [
    // {
    //   id: 1,
    //   description: 'Lunch at Cafe',
    //   amount: 15,
    //   category: 'food',
    //   categoryId: 1,
    //   date: '2023-10-01',
    //   tags: ['lunch', 'food'],
    //   createdAt: '2023-10-01T12:00:00Z',
    //   updatedAt: '2023-10-01T12:00:00Z'
    // },
    // {
    //   id: 2,
    //   description: 'Bus Ticket',
    //   amount: 2.5,
    //   category: 'transport',
    //   categoryId: 2,
    //   date: '2023-10-02',
    //   tags: ['transport'],
    //   createdAt: '2023-10-01T12:00:00Z',
    //   updatedAt: '2023-10-01T12:00:00Z'
    // },
    // {
    //   id: 3,
    //   description: 'Movie Night',
    //   amount: 12,
    //   category: 'fun',
    //   categoryId: 3,
    //   date: '2023-10-03',
    //   tags: ['movie', 'entertainment'],
    //   createdAt: '2023-10-01T12:00:00Z',
    //   updatedAt: '2023-10-01T12:00:00Z'
    // },
  ],
};
export const AppStateContext = createContext<State>(initialState);
export const AppDispatchContext = createContext<Dispatch<Action>>(() => {});