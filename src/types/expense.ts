export interface Expense {
  id: number,
  amount: number,
  description: string,
  category: string,
  categoryId: number,
  date: string,
  tags: string[],
  createdAt: string,
  updatedAt: string
}

