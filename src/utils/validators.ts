import type { Budget } from '../types/budget';
import { format, parseISO } from 'date-fns';

export function validateEndDate(formState: Budget): boolean {
  if (!formState.startDate || !formState.endDate) return true;
  return new Date(formState.endDate) > new Date(formState.startDate);
}

export function validateBudgetForm(formState: Budget): boolean {
  return (
    !!formState.name &&
    !!formState.startDate &&
    !!formState.endDate &&
    Number(formState.limit) > 0 &&
    validateEndDate(formState)
  );
}

export function formatDate (dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
};