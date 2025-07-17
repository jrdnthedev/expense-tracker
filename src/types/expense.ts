export interface Expense {
  id: string,
  amount: number,
  description: string,
  category: string,
  date: Date,
  tags: string[],
  createdAt: Date,
  updatedAt: Date
}

