import type { JSX } from "react";
import AnalyticsDashboard from "../components/layout/analytics-dashboard/analytics-dashboard";
import BudgetManager from "../components/layout/budget-manager/budget-manager";
import CategoryManagement from "../components/layout/category-management/category-management";
import Dashboard from "../components/layout/dashboard/dashboard";
import ExpenseList from "../components/layout/expense-list/expense-list";
import Settings from "../components/layout/settings/settings";

export const protectedRoutes: ProtectedRoute[] = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/budgetmanager", element: <BudgetManager /> },
  { path: "/analytics", element: <AnalyticsDashboard /> },
  { path: "/settings", element: <Settings /> },
  { path: "/expenselist", element: <ExpenseList /> },
  { path: "/categorymanagement", element: <CategoryManagement /> },
];

export type ProtectedRoute = {
  path: string;
  element: JSX.Element;
};
