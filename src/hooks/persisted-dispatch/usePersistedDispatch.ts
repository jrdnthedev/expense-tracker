import { useCallback } from 'react';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Action } from '../../context/app-state-context';
import { expenseDB } from '../../services/expense-service/expense.service';
import { budgetDB } from '../../services/budget-service/budget.service';
import { categoryDB } from '../../services/category-service/category.service';

/**
 * Wraps the context dispatch to also persist mutations to IndexedDB.
 * Use this instead of raw useAppDispatch() in components that modify data.
 */
export function usePersistedDispatch() {
  const dispatch = useAppDispatch();

  const persistedDispatch = useCallback(
    async (action: Action) => {
      // Dispatch to context first for immediate UI update
      dispatch(action);

      // Then persist to IndexedDB
      try {
        switch (action.type) {
          case 'ADD_EXPENSE':
            await expenseDB.addExpense(action.payload);
            break;
          case 'UPDATE_EXPENSE':
            await expenseDB.updateExpense(action.payload);
            break;
          case 'REMOVE_EXPENSE':
            await expenseDB.deleteExpense(action.payload.id);
            break;
          case 'ADD_BUDGET':
            await budgetDB.addBudget(action.payload);
            break;
          case 'UPDATE_BUDGET':
            await budgetDB.updateBudget(action.payload);
            break;
          case 'REMOVE_BUDGET':
            await budgetDB.deleteBudget(action.payload.id);
            break;
          case 'ADD_CATEGORY':
            await categoryDB.addCategory(action.payload);
            break;
          case 'UPDATE_CATEGORY':
            await categoryDB.updateCategory(action.payload);
            break;
          case 'REMOVE_CATEGORY':
            await categoryDB.deleteCategory(action.payload.id);
            break;
        }
      } catch (err) {
        // Re-throw so callers can handle persistence failures
        throw err instanceof Error ? err : new Error(`Failed to persist ${action.type}`);
      }
    },
    [dispatch]
  );

  return persistedDispatch;
}
