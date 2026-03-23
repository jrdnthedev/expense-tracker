import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseList from './expense-list';
import type { Expense } from '../../../types/expense';
import type { Budget } from '../../../types/budget';
import type { Category } from '../../../types/category';
import type { Currency } from '../../../types/currency';
import type { ExpenseFormData } from '../../../constants/form-data';
import { MemoryRouter } from 'react-router-dom';

// --- Mock data ---

const mockCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  decimals: 2,
  label: 'USD',
  id: 1,
};

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly',
    categoryIds: [1, 2],
    limit: 500,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 25.5,
    description: 'Groceries',
    category: 'Food',
    categoryId: 1,
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-03-10T10:00:00.000Z',
    budget: 'Monthly',
    budgetId: 1,
  },
  {
    id: 2,
    amount: 15.0,
    description: 'Bus fare',
    category: 'Transport',
    categoryId: 2,
    createdAt: '2026-03-12T10:00:00.000Z',
    updatedAt: '2026-03-12T10:00:00.000Z',
    budget: 'Monthly',
    budgetId: 1,
  },
];

const defaultState = {
  expenses: mockExpenses,
  currency: mockCurrency,
  budgets: mockBudgets,
  categories: mockCategories,
  defaultCategory: 1,
  theme: 'light' as const,
};

// --- Mocks ---

const mockDispatch = vi.fn();

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: vi.fn(() => defaultState),
}));

vi.mock('../../../hooks/persisted-dispatch/usePersistedDispatch', () => ({
  usePersistedDispatch: vi.fn(() => mockDispatch),
}));

// Mock debounce to return value immediately
vi.mock('../../../hooks/debounce/use-debounce', () => ({
  useDebounce: vi.fn((value: string) => value),
}));

vi.mock('../../ui/modal/modal', () => ({
  default: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../forms/expense-form/expense-form', () => ({
  default: ({
    onSubmit,
    onCancel,
    expenseFormData,
  }: {
    onSubmit?: (data: ExpenseFormData) => void;
    onCancel: () => void;
    expenseFormData?: ExpenseFormData;
    categories: Category[];
    budgets: Budget[];
    currency: Currency;
    expenses?: Expense[];
  }) => (
    <div data-testid="expense-form">
      {expenseFormData && (
        <span data-testid="form-editing">{expenseFormData.description}</span>
      )}
      {onSubmit && (
        <button
          data-testid="expense-form-submit"
          onClick={() =>
            onSubmit({
              id: expenseFormData?.id ?? 99,
              amount: 42,
              description: 'Test Expense',
              categoryId: 1,
              category: 'Food',
              budgetId: 1,
              budget: 'Monthly',
              createdAt: '2026-03-22T00:00:00.000Z',
              updatedAt: '2026-03-22T00:00:00.000Z',
            })
          }
        >
          Submit
        </button>
      )}
      <button data-testid="expense-form-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

import { useAppState } from '../../../context/app-state-hooks';

// --- Helpers ---

function renderExpenseList() {
  return render(
    <MemoryRouter>
      <ExpenseList />
    </MemoryRouter>
  );
}

// --- Tests ---

describe('ExpenseList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppState).mockReturnValue(defaultState);
  });

  test('renders the heading', () => {
    renderExpenseList();
    expect(screen.getByText('📝 Expense List')).toBeInTheDocument();
  });

  test('renders expense descriptions', () => {
    renderExpenseList();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Bus fare')).toBeInTheDocument();
  });

  test('renders formatted expense amounts', () => {
    renderExpenseList();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
  });

  test('renders formatted dates', () => {
    renderExpenseList();
    expect(screen.getByText('Mar 10, 2026')).toBeInTheDocument();
    expect(screen.getByText('Mar 12, 2026')).toBeInTheDocument();
  });

  test('renders Edit and Delete buttons for each expense', () => {
    renderExpenseList();
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  test('renders search input', () => {
    renderExpenseList();
    expect(
      screen.getByPlaceholderText('Search expenses...')
    ).toBeInTheDocument();
  });

  test('filters expenses by search term', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const searchInput = screen.getByPlaceholderText('Search expenses...');
    await user.type(searchInput, 'Groceries');

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Bus fare')).not.toBeInTheDocument();
  });

  test('renders category filter select', () => {
    renderExpenseList();
    // The select should have All + the two categories
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('shows empty state when no budgets exist', () => {
    vi.mocked(useAppState).mockReturnValue({
      ...defaultState,
      budgets: [],
    });

    renderExpenseList();

    expect(screen.getByText('No Budgets Found')).toBeInTheDocument();
    expect(
      screen.getByText('Create a budget to start tracking your expenses.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Add Budget' })
    ).toHaveAttribute('href', '/budgetmanager');
  });

  test('shows empty state when no categories exist', () => {
    vi.mocked(useAppState).mockReturnValue({
      ...defaultState,
      categories: [],
    });

    renderExpenseList();

    expect(screen.getByText('No Categories Found')).toBeInTheDocument();
    expect(
      screen.getByText('Create a category to start tracking your expenses.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Add Category' })
    ).toHaveAttribute('href', '/categorymanagement');
  });

  // --- Add Expense ---

  test('opens add expense modal when clicking Add Expense', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    await user.click(screen.getByText('Add Expense'));

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Add New Expense' })
    ).toBeInTheDocument();
  });

  test('dispatches ADD_EXPENSE on form submit', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    await user.click(screen.getByText('Add Expense'));
    await user.click(screen.getByTestId('expense-form-submit'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_EXPENSE',
      payload: expect.objectContaining({
        amount: 42,
        description: 'Test Expense',
      }),
    });
  });

  test('closes add modal after submitting', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    await user.click(screen.getByText('Add Expense'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('expense-form-submit'));
    expect(screen.queryByText('Add New Expense')).not.toBeInTheDocument();
  });

  test('closes add modal on cancel', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    await user.click(screen.getByText('Add Expense'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('expense-form-cancel'));
    expect(screen.queryByText('Add New Expense')).not.toBeInTheDocument();
  });

  // --- Edit Expense ---

  test('opens edit modal when clicking Edit on an expense', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Edit Expense' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('form-editing')).toHaveTextContent('Groceries');
  });

  test('dispatches UPDATE_EXPENSE on edit form submit', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    await user.click(screen.getByTestId('expense-form-submit'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_EXPENSE',
      payload: expect.objectContaining({
        description: 'Test Expense',
        amount: 42,
      }),
    });
  });

  test('closes edit modal after submitting', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('expense-form-submit'));
    expect(screen.queryByText('Edit Expense')).not.toBeInTheDocument();
  });

  // --- Delete Expense ---

  test('opens delete confirmation modal when clicking Delete', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this expense?')
    ).toBeInTheDocument();
  });

  test('dispatches REMOVE_EXPENSE on delete confirmation', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Click the Delete button inside the confirmation modal
    const confirmDeleteBtn = screen.getAllByText('Delete');
    // The confirmation modal's Delete button is the new one
    await user.click(confirmDeleteBtn[confirmDeleteBtn.length - 1]);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_EXPENSE',
      payload: { id: 1 },
    });
  });

  test('closes delete modal on Cancel', async () => {
    const user = userEvent.setup();
    renderExpenseList();

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  // --- Future Expense Badge ---

  test('shows Future Expense badge for expenses with future budget start date', () => {
    vi.mocked(useAppState).mockReturnValue({
      ...defaultState,
      budgets: [
        {
          ...mockBudgets[0],
          startDate: '2027-01-01',
        },
      ],
    });

    renderExpenseList();
    const badges = screen.getAllByText('Future Expense');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  test('does not show Future Expense badge for current/past budgets', () => {
    renderExpenseList();
    expect(screen.queryByText('Future Expense')).not.toBeInTheDocument();
  });
});
