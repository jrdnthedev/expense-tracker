import { useContext } from "react";
import { AppStateContext, AppDispatchContext } from "./app-state-context";

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);