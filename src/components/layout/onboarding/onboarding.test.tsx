import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Onboarding from './onboarding';
import type { Category } from '../../../types/category';
import type { Currency } from '../../../types/currency';
import type { Budget } from '../../../types/budget';
import type { CategoryFormData, BudgetFormData } from '../../../constants/form-data';

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

const mockBudgets: Budget[] = [];

const defaultState = {
  categories: mockCategories,
  currency: mockCurrency,
  budgets: mockBudgets,
  expenses: [],
  defaultCategory: 1,
  theme: 'light' as const,
};

// --- Mocks ---

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: vi.fn(() => defaultState),
}));

vi.mock('../../../hooks/persisted-dispatch/usePersistedDispatch', () => ({
  usePersistedDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../utils/local-storage', () => ({
  LocalStorage: {
    set: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock child forms and Dashboard to simplify rendering
vi.mock('../../forms/category-form/category-form', () => ({
  default: ({
    onSubmit,
  }: {
    onSubmit?: (data: CategoryFormData) => void;
    categories: Category[];
  }) => (
    <div data-testid="category-form">
      {onSubmit && (
        <button
          data-testid="category-form-submit"
          onClick={() => onSubmit({ name: 'Custom', icon: '🌟', id: 3 })}
        >
          Submit Category
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../forms/budget-form/budget-form', () => ({
  default: ({
    onSubmit,
  }: {
    onSubmit?: (data: BudgetFormData) => void;
    onCancel: () => void;
    currency: Currency;
    budgets: Budget[];
  }) => (
    <div data-testid="budget-form">
      {onSubmit && (
        <button
          data-testid="budget-form-submit"
          onClick={() =>
            onSubmit({
              id: 1,
              name: 'Monthly',
              limit: 500,
              categoryIds: [1],
              startDate: '2026-03-01',
              endDate: '2026-03-31',
            })
          }
        >
          Submit Budget
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../forms/expense-form/expense-form', () => ({
  default: () => <div data-testid="expense-form">Expense Form</div>,
}));

vi.mock('../dashboard/dashboard', () => ({
  default: () => <div data-testid="dashboard-preview">Dashboard Preview Content</div>,
}));

vi.mock('../../ui/card-btn/card-btn', () => ({
  default: ({
    label,
    icon,
  }: {
    label: string;
    icon?: string;
    onClick: () => void;
  }) => (
    <div data-testid={`category-card-${label}`}>
      {icon} {label}
    </div>
  ),
}));

import { useAppState } from '../../../context/app-state-hooks';
import { LocalStorage } from '../../../utils/local-storage';

// --- Helpers ---

const mockSetOnboardingComplete = vi.fn();

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding setOnboardingComplete={mockSetOnboardingComplete} />
    </MemoryRouter>
  );
}

// --- Tests ---

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppState).mockReturnValue(defaultState);
  });

  // Step 1 - Welcome
  test('renders welcome step initially', () => {
    renderOnboarding();

    expect(screen.getByRole('heading', { name: 'Welcome!' })).toBeInTheDocument();
    expect(screen.getByText(/Let['’]s set up your default categories/)).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  // Step 2 - Default Categories
  test('advances to default categories step on Continue', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));

    expect(screen.getByRole('heading', { name: 'Default Categories' })).toBeInTheDocument();
    expect(screen.getByText(/We['’]ve added some categories for you/)).toBeInTheDocument();
  });

  test('displays all category cards in step 2', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));

    expect(screen.getByTestId('category-card-Food')).toBeInTheDocument();
    expect(screen.getByTestId('category-card-Transport')).toBeInTheDocument();
  });

  // Step 3 - Add First Category
  test('advances to add category step', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));
    await user.click(screen.getByText('Next: Add First Category'));

    expect(screen.getByRole('heading', { name: 'Add Your First Category' })).toBeInTheDocument();
    expect(screen.getByTestId('category-form')).toBeInTheDocument();
  });

  test('dispatches ADD_CATEGORY and advances to step 4 on category submit', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));
    await user.click(screen.getByText('Next: Add First Category'));
    await user.click(screen.getByTestId('category-form-submit'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_CATEGORY',
      payload: { name: 'Custom', icon: '🌟', id: 3 },
    });
    expect(screen.getByRole('heading', { name: 'Set Up Your First Budget' })).toBeInTheDocument();
  });

  // Step 4 - Budget
  test('renders budget form in step 4', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));
    await user.click(screen.getByText('Next: Add First Category'));
    await user.click(screen.getByTestId('category-form-submit'));

    expect(screen.getByTestId('budget-form')).toBeInTheDocument();
  });

  test('dispatches ADD_BUDGET, sets onboarding complete, and advances on budget submit', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));
    await user.click(screen.getByText('Next: Add First Category'));
    await user.click(screen.getByTestId('category-form-submit'));
    await user.click(screen.getByTestId('budget-form-submit'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_BUDGET',
      payload: expect.objectContaining({ name: 'Monthly', limit: 500 }),
    });
    expect(LocalStorage.set).toHaveBeenCalledWith('onboardingComplete', true);
    expect(mockSetOnboardingComplete).toHaveBeenCalledWith(true);
    expect(screen.getByRole('heading', { name: 'Add Your First Expense' })).toBeInTheDocument();
  });

  // Step 5 - First Expense
  test('renders expense form in step 5', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));
    await user.click(screen.getByText('Next: Add First Category'));
    await user.click(screen.getByTestId('category-form-submit'));
    await user.click(screen.getByTestId('budget-form-submit'));

    expect(screen.getByTestId('expense-form')).toBeInTheDocument();
  });

  // Step navigation doesn't go backwards spontaneously
  test('does not show previous step content after advancing', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByText('Continue'));

    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });
});
