export interface Budget {
  id: number,
  category: string,
  name: string,
  categoryIds: number[],
  limit: number,
  startDate: string,
  endDate: string,
  expenseIds: number[],
}

