export interface Budget {
  id: number,
  category: string,
  limit: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  endDate: Date
}

