import { createContext } from "react";
import type { Dispatch } from "react";
import type { State, Action } from "./app-state-context";
import { CURRENCIES } from "../types/currency";

export const initialState: State = {
  currency: CURRENCIES.USD,
  defaultCategory: 1,
  theme: 'light',
  budgets: [
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
  ],
};
export const AppStateContext = createContext<State>(initialState);
export const AppDispatchContext = createContext<Dispatch<Action>>(() => {});