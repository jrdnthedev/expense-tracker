import React, { createContext, useReducer, useContext } from "react";
import type { Dispatch } from "react";

type State = {
  currency: string;
  // Add other global state fields here
  defaultCategory?: string;
};

type Action =
  | { type: "SET_CURRENCY"; payload: string }
  // Add other actions here
  | { type: "RESET_STATE" }
  | { type: "UPDATE_SETTING"; payload: { key: string; value: any } }
  | { type: "ADD_EXPENSE"; payload: { amount: number; description: string; category: string } }
  | { type: "REMOVE_EXPENSE"; payload: { id: string } }
  | { type: "UPDATE_BUDGET"; payload: { amount: number } }
  | { type: "ADD_CATEGORY"; payload: { name: string; icon: string } }
  | { type: "REMOVE_CATEGORY"; payload: { id: string } }
  | { type: "SET_DEFAULT_CATEGORY"; payload: { categoryId: string } };

const initialState: State = {
  currency: "usd",
};

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CURRENCY":
      return { ...state, currency: action.payload };
    case "SET_DEFAULT_CATEGORY":
      return { ...state, defaultCategory: action.payload.categoryId };
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