export const periodOptions = [
  { value: 'weekly', label: 'Weekly', id: 1 },
  { value: 'monthly', label: 'Monthly', id: 2 },
  { value: 'yearly', label: 'Yearly', id: 3 },
];

export const budgetDefaultFormState = {
  id: 0,
  limit: 0,
  category: 'food',
  categoryId: 1,
  period:
    (periodOptions[0]?.value as 'weekly' | 'monthly' | 'yearly') ?? 'weekly',
  startDate: '',
  endDate: '',
};

export const navLinks = [
  { to: '/budgetmanager', label: 'Budget Manager' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
  { to: '/expenselist', label: 'Expense List' },
  { to: '/categorymanagement', label: 'Category Management' },
];