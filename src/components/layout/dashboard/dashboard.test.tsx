import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from './dashboard';
import type { Expense } from '../../../types/expense';
import type { Budget } from '../../../types/budget';
import type { Currency } from '../../../types/currency';
import { MemoryRouter } from 'react-router-dom';

// --- Mock data ---

const mockCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  decimals: 2,
  label: 'USD',
  id: 1,
};

const now = new Date();
const thisMonth = now.toISOString();

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 25.5,
    description: 'Groceries',
    category: 'Food',
    categoryId: 1,
    createdAt: thisMonth,
    updatedAt: thisMonth,
    budget: 'Monthly',
    budgetId: 1,
  },
  {
    id: 2,
    amount: 15.0,
    description: 'Bus fare',
    category: 'Transport',
    categoryId: 2,
    createdAt: thisMonth,
    updatedAt: thisMonth,
    budget: 'Monthly',
    budgetId: 1,
  },
  {
    id: 3,
    amount: 50.0,
    description: 'Concert tickets',
    category: 'Entertainment',
    categoryId: 3,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    budget: 'Monthly',
    budgetId: 1,
  },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly',
    categoryIds: [1, 2, 3],
    limit: 500,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  },
];

// --- Mocks ---

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: vi.fn(() => ({
    expenses: mockExpenses,
    currency: mockCurrency,
    budgets: mockBudgets,
    categories: [],
    defaultCategory: 1,
    theme: 'light' as const,
  })),
}));

import { useAppState } from '../../../context/app-state-hooks';

// --- Helpers ---

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

// --- Tests ---

const defaultState = {
  expenses: mockExpenses,
  currency: mockCurrency,
  budgets: mockBudgets,
  categories: [],
  defaultCategory: 1,
  theme: 'light' as const,
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppState).mockReturnValue(defaultState);
  });

  test('renders the dashboard heading', () => {
    renderDashboard();
    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
  });

  test('renders the three summary cards', () => {
    renderDashboard();

    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('Budget left')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  test('displays the monthly expenses total', () => {
    renderDashboard();

    // Only expenses 1 and 2 are in the current month (25.50 + 15.00 = 40.50)
    expect(screen.getByText('$40.50')).toBeInTheDocument();
  });

  test('displays total transactions count', () => {
    renderDashboard();

    // 3 total expenses
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('displays the remaining budget', () => {
    renderDashboard();

    // Budget 500 - total expenses (25.50 + 15.00 + 50.00) = 409.50
    expect(screen.getByText('$409.50')).toBeInTheDocument();
  });

  test('applies green color when budget is positive', () => {
    renderDashboard();

    const budgetAmount = screen.getByText('$409.50');
    expect(budgetAmount).toHaveClass('text-green-700');
  });

  test('applies red color when budget is negative', () => {
    vi.mocked(useAppState).mockReturnValue({
      expenses: [
        {
          ...mockExpenses[0],
          amount: 600,
        },
      ],
      currency: mockCurrency,
      budgets: mockBudgets,
      categories: [],
      defaultCategory: 1,
      theme: 'light',
    });

    renderDashboard();

    // 500 - 600 = -100, formatAmount produces "$-100.00"
    const budgetAmount = screen.getByText('$-100.00');
    expect(budgetAmount).toHaveClass('text-red-700');
  });

  test('renders recent expenses list', () => {
    renderDashboard();

    expect(screen.getByText('Recent Expenses')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Bus fare')).toBeInTheDocument();
    expect(screen.getByText('Concert tickets')).toBeInTheDocument();
  });

  test('shows expense amounts in the recent list', () => {
    renderDashboard();

    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  test('shows expense dates in the recent list', () => {
    renderDashboard();

    // toLocaleDateString() format depends on locale/ICU: YYYY-MM-DD (minimal ICU) or M/D/YYYY (full ICU)
    const dateElements = screen.getAllByText(
      /\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{4}/
    );
    expect(dateElements.length).toBeGreaterThanOrEqual(3);
  });

  test('shows empty state when there are no expenses', () => {
    vi.mocked(useAppState).mockReturnValue({
      expenses: [],
      currency: mockCurrency,
      budgets: mockBudgets,
      categories: [],
      defaultCategory: 1,
      theme: 'light',
    });

    renderDashboard();

    expect(screen.getByText('No recent expenses')).toBeInTheDocument();
    expect(
      screen.getByText('Track your spending by adding expenses.')
    ).toBeInTheDocument();
  });

  test('empty state links to expense list', () => {
    vi.mocked(useAppState).mockReturnValue({
      expenses: [],
      currency: mockCurrency,
      budgets: mockBudgets,
      categories: [],
      defaultCategory: 1,
      theme: 'light',
    });

    renderDashboard();

    const link = screen.getByRole('link', { name: 'Add Expense' });
    expect(link).toHaveAttribute('href', '/expenselist');
  });

  test('shows $0.00 for monthly expenses when none in current month', () => {
    vi.mocked(useAppState).mockReturnValue({
      expenses: [mockExpenses[2]], // only the old expense from 2024
      currency: mockCurrency,
      budgets: mockBudgets,
      categories: [],
      defaultCategory: 1,
      theme: 'light',
    });

    renderDashboard();

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  test('limits recent expenses to 5', () => {
    const manyExpenses: Expense[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      amount: 10,
      description: `Expense ${i + 1}`,
      category: 'Food',
      categoryId: 1,
      createdAt: new Date(2026, 2, i + 1).toISOString(),
      updatedAt: new Date(2026, 2, i + 1).toISOString(),
      budget: 'Monthly',
      budgetId: 1,
    }));

    vi.mocked(useAppState).mockReturnValue({
      expenses: manyExpenses,
      currency: mockCurrency,
      budgets: mockBudgets,
      categories: [],
      defaultCategory: 1,
      theme: 'light',
    });

    renderDashboard();

    const listItems = screen
      .getAllByRole('listitem')
      .filter((li) => li.querySelector('.font-medium'));
    expect(listItems).toHaveLength(5);
  });
});
