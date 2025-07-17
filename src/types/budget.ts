export interface Budget {
  id: string,
  category: string,
  limit: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  endDate: Date
}

