export type BudgetFormData = {
  id?: number;
  limit: number;
  name: string;
  categoryIds: number[];
  startDate: string;
  endDate: string;
};

export type CategoryFormData = {
  name: string;
  icon: string;
  id?: number;
};

export type ExpenseFormData = {
  id: number;
  amount: number;
  description: string;
  categoryId: number;
  category: string;
  budgetId: number;
  budget: string;
  createdAt: string;
  updatedAt: string;
};