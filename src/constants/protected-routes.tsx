import { lazy, type JSX } from "react";

const AnalyticsDashboard = lazy(() => import("../components/layout/analytics-dashboard/analytics-dashboard"));
const BudgetManager = lazy(() => import("../components/layout/budget-manager/budget-manager"));
const CategoryManagement = lazy(() => import("../components/layout/category-management/category-management"));
const Dashboard = lazy(() => import("../components/layout/dashboard/dashboard"));
const ExpenseList = lazy(() => import("../components/layout/expense-list/expense-list"));
const Settings = lazy(() => import("../components/layout/settings/settings"));

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
