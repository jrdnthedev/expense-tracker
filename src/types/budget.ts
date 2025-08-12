export interface Budget {
  id: number,
  name: string,
  categoryIds: number[],
  limit: number,
  startDate: string,
  endDate: string,
}

