import type { Budget } from '../types/budget';
import { format } from 'date-fns';

export function validateEndDate(formState: Budget): boolean {
  if (!formState.startDate || !formState.endDate) return true;
  return new Date(formState.endDate) > new Date(formState.startDate);
}

export function validateBudgetForm(formState: Budget): boolean {
  return (
    !!formState.name.trim() &&
    !!formState.startDate &&
    !!formState.endDate &&
    Number(formState.limit) > 0 &&
    validateEndDate(formState)
  );
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  // Create a new date using UTC values to avoid timezone shifts
  const utcDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return format(utcDate, 'MMM d, yyyy');
};