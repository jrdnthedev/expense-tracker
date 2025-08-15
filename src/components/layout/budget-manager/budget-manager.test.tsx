import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetManager from './budget-manager';
import type { Budget } from '../../../types/budget';
import type { Category } from '../../../types/category';
import type { Expense } from '../../../types/expense';
import type { Currency } from '../../../types/currency';
import { CURRENCIES } from '../../../types/currency';

// Mock the hooks
const mockDispatch = vi.fn();
const mockUseAppState = vi.fn();
const mockUseAppDispatch = vi.fn(() => mockDispatch);

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: () => mockUseAppState(),
  useAppDispatch: () => mockUseAppDispatch(),
}));

// Mock the utility functions
vi.mock('../../../utils/validators', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
}));

vi.mock('../../../utils/currency', () => ({
  formatAmount: (amount: number, currency: Currency) =>
    `${currency.symbol}${amount.toFixed(currency.decimals)}`,
}));

vi.mock('../../../utils/budget', () => ({
  calculateSpentAmount: (budget: Budget, expenses: Expense[]) => {
    return expenses
      .filter((expense) => budget.categoryIds.includes(expense.categoryId))
      .reduce((sum, expense) => sum + expense.amount, 0);
  },
}));

// Mock components
vi.mock('../../ui/button/button', () => ({
  default: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('../../ui/card/card', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

vi.mock('../../ui/modal/modal', () => ({
  default: ({
    children,
    onClose,
    isOpen,
  }: {
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
  }) =>
    isOpen ? (
      <div data-testid="modal" onClick={onClose}>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../forms/budget-form/budget-form', () => ({
  default: ({
    onSubmit,
    onCancel,
    budgetFormData,
  }: {
    onSubmit: (data: {
      id: string;
      name: string;
      limit: number;
      categoryIds: number[];
      startDate: string;
      endDate: string;
    }) => void;
    onCancel: () => void;
    budgetFormData?: {
      id: string;
      name: string;
      limit: number;
      categoryIds: number[];
      startDate: string;
      endDate: string;
    };
  }) => (
    <form data-testid="budget-form">
      <button
        type="button"
        onClick={() =>
          onSubmit({
            id: budgetFormData?.id || '1',
            name: budgetFormData?.name || 'Test Budget',
            limit: budgetFormData?.limit || 1000,
            categoryIds: budgetFormData?.categoryIds || [1],
            startDate: budgetFormData?.startDate || '2024-01-01',
            endDate: budgetFormData?.endDate || '2024-12-31',
          })
        }
      >
        Submit
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  ),
}));

vi.mock('../../ui/empty-state/empty-state', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('../../ui/badge/badge', () => ({
  default: ({ message, variant }: { message: string; variant: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {message}
    </span>
  ),
}));

vi.mock('../../ui/progress-bar/progress-bar', () => ({
  default: ({ percentageUsed }: { percentageUsed: number }) => (
    <div data-testid="progress-bar" data-percentage={percentageUsed}>
      Progress Bar
    </div>
  ),
}));

describe('BudgetManager', () => {
  const mockCurrency: Currency = CURRENCIES.USD;

  const mockCategories: Category[] = [
    { id: 1, name: 'Food', icon: '🍔' },
    { id: 2, name: 'Transport', icon: '🚗' },
  ];

  const mockBudgets: Budget[] = [
    {
      id: 1,
      name: 'Monthly Food Budget',
      categoryIds: [1],
      limit: 500,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
    {
      id: 2,
      name: 'Future Transport Budget',
      categoryIds: [2],
      limit: 300,
      startDate: '2025-12-01',
      endDate: '2025-12-31',
    },
  ];

  const mockExpenses: Expense[] = [
    {
      id: 1,
      amount: 100,
      description: 'Lunch',
      category: 'Food',
      categoryId: 1,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      budget: 'Monthly Food Budget',
      budgetId: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockReturnValue({
      budgets: mockBudgets,
      categories: mockCategories,
      expenses: mockExpenses,
      currency: mockCurrency,
    });
  });

  test('renders budget manager with title', () => {
    render(<BudgetManager />);

    expect(screen.getByText('🎯 Budget Manager')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage your budget effectively with our intuitive tools.'
      )
    ).toBeInTheDocument();
  });

  test('renders add budget button when categories exist', () => {
    render(<BudgetManager />);

    expect(screen.getByText('Add Budget')).toBeInTheDocument();
  });

  test('opens add budget modal when add button is clicked', () => {
    render(<BudgetManager />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Budget' }));

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Add Budget')).toBeInTheDocument();
  });

  test('renders empty state when no categories exist', () => {
    mockUseAppState.mockReturnValue({
      budgets: [],
      categories: [],
      expenses: [],
      currency: mockCurrency,
    });

    render(<BudgetManager />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No Categories Found')).toBeInTheDocument();
    expect(
      screen.getByText('Create a category to start tracking your expenses.')
    ).toBeInTheDocument();
  });

  test('displays budget information correctly', () => {
    render(<BudgetManager />);

    expect(screen.getByText('Monthly Food Budget')).toBeInTheDocument();
    expect(screen.getByText('$100.00/$500.00')).toBeInTheDocument();
    expect(screen.getByText('Remaining: $400.00')).toBeInTheDocument();
  });

  test('shows future badge for future budgets', () => {
    render(<BudgetManager />);

    const futureBadge = screen.getByTestId('badge');
    expect(futureBadge).toHaveTextContent('Future');
    expect(futureBadge).toHaveAttribute('data-variant', 'default');
  });

  test('handles add budget submission', async () => {
    render(<BudgetManager />);

    fireEvent.click(screen.getByText('Add Budget'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_BUDGET',
        payload: {
          id: 1,
          name: 'Test Budget',
          limit: 1000,
          categoryIds: [1],
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      });
    });
  });

  test('opens edit modal when edit button is clicked', () => {
    render(<BudgetManager />);

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((button) =>
      button.querySelector('svg path[d*="13.586 3.586"]')
    );

    if (editButton) {
      fireEvent.click(editButton);
      expect(screen.getByText('Edit Budget Form')).toBeInTheDocument();
    }
  });

  test('handles edit budget submission', async () => {
    render(<BudgetManager />);

    // Click edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((button) =>
      button.querySelector('svg path[d*="13.586 3.586"]')
    );

    if (editButton) {
      fireEvent.click(editButton);
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: 'UPDATE_BUDGET',
          payload: {
            id: 1,
            name: 'Monthly Food Budget',
            limit: 500,
            categoryIds: [1],
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        });
      });
    }
  });

  test('handles delete budget', () => {
    render(<BudgetManager />);

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((button) =>
      button.querySelector('svg path[d*="M9 2a1 1 0 00-.894.553"]')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'REMOVE_BUDGET',
        payload: { id: 1 },
      });
    }
  });

  test('closes modal when cancel is clicked', () => {
    render(<BudgetManager />);

    fireEvent.click(screen.getByText('Add Budget'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  test('displays remaining amount in red when over budget', () => {
    const overBudgetExpenses: Expense[] = [
      {
        id: 1,
        amount: 600,
        description: 'Expensive meal',
        category: 'Food',
        categoryId: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        budget: 'Monthly Food Budget',
        budgetId: 1,
      },
    ];

    mockUseAppState.mockReturnValue({
      budgets: mockBudgets,
      categories: mockCategories,
      expenses: overBudgetExpenses,
      currency: mockCurrency,
    });

    render(<BudgetManager />);

    const spentDisplay = screen.getByText('$600.00/$500.00');
    expect(spentDisplay).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  test('renders multiple budget cards', () => {
    render(<BudgetManager />);

    const cards = screen.getAllByTestId('card');
    // One card for each budget
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Monthly Food Budget')).toBeInTheDocument();
    expect(screen.getByText('Future Transport Budget')).toBeInTheDocument();
  });
});
