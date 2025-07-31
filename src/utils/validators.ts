import type { Budget } from '../types/budget';
import { format, parseISO } from 'date-fns';

export function validateEndDate(formState: Budget) {
  return (
    !formState.startDate ||
    !formState.endDate ||
    new Date(formState.endDate) > new Date(formState.startDate)
  );
}

export function validateForm(formState: Budget) {
  return (
    formState.limit > 0 &&
    formState.category !== '' &&
    formState.startDate !== '' &&
    formState.endDate !== ''
  );
}

export function formatDate (dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
};