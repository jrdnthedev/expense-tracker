export interface Budget {
  id: number,
  category: string,
  name: string,
  categoryIds: number[],
  limit: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: string,
  endDate: string,
  expenseIds: number[],
}

