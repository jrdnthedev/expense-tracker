export interface Budget {
  id: number,
  category: string,
  categoryId: number,
  limit: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: string,
  endDate: string
}

