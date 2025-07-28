export interface Budget {
  id: number,
  category: string,
  limit: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: string,
  endDate: string
}

