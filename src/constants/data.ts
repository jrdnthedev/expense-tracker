export const periodOptions = [
  { value: 'weekly', label: 'Weekly', id: 1 },
  { value: 'monthly', label: 'Monthly', id: 2 },
  { value: 'yearly', label: 'Yearly', id: 3 },
];

export const budgetDefaultFormState = {
  id: 0,
  limit: 0,
  category: 'food',
  period:
    (periodOptions[0]?.value as 'weekly' | 'monthly' | 'yearly') ?? 'weekly',
  startDate: '',
  endDate: '',
};
