import { useContext } from "react";
import { AppDispatchContext, AppStateContext } from "./app-state-contexts";

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);