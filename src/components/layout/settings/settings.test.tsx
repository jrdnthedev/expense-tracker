import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './settings';
import type { Category } from '../../../types/category';
import type { Currency } from '../../../types/currency';
import { CURRENCIES } from '../../../types/currency';

// --- Mock data ---

const mockCurrency: Currency = CURRENCIES.USD;

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
];

const defaultState = {
  currency: mockCurrency,
  defaultCategory: 1,
  categories: mockCategories,
  expenses: [],
  budgets: [],
  theme: 'light' as const,
};

// --- Mocks ---

const mockDispatch = vi.fn();

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: vi.fn(() => defaultState),
  useAppDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('../../ui/theme-toggle/theme-toggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('../../ui/data-manager/data-manager', () => ({
  default: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    return isOpen ? (
      <div data-testid="data-manager">
        <button data-testid="data-manager-close" onClick={onClose}>
          Close Data Manager
        </button>
      </div>
    ) : null;
  },
}));

import { useAppState } from '../../../context/app-state-hooks';

// --- Tests ---

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppState).mockReturnValue(defaultState);
  });

  test('renders the settings heading and description', () => {
    render(<Settings />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Settings/ })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Manage your application settings and preferences here.')
    ).toBeInTheDocument();
  });

  test('renders general settings section', () => {
    render(<Settings />);

    expect(screen.getByText('💰 General Settings')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText('Default Category')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  test('renders data management section', () => {
    render(<Settings />);

    expect(screen.getByText('💾 Data Management')).toBeInTheDocument();
    expect(screen.getByText('Backup & Restore')).toBeInTheDocument();
    expect(screen.getByText('Manage Data')).toBeInTheDocument();
  });

  test('renders notifications section', () => {
    render(<Settings />);

    expect(screen.getByText('🔔 Notifications')).toBeInTheDocument();
  });

  test('renders theme toggle', () => {
    render(<Settings />);

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('renders currency select with current currency', () => {
    render(<Settings />);

    const currencySelect = screen.getByRole('combobox', { name: /currency/i });
    expect(currencySelect).toHaveValue('USD');
  });

  test('dispatches SET_CURRENCY when currency is changed', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    const currencySelect = screen.getByRole('combobox', { name: /currency/i });
    await user.selectOptions(currencySelect, 'EUR');

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENCY',
      payload: CURRENCIES.EUR,
    });
  });

  test('renders default category select with current category', () => {
    render(<Settings />);

    const categorySelect = screen.getByRole('combobox', {
      name: /default-category/i,
    });
    expect(categorySelect).toHaveValue('Food');
  });

  test('dispatches SET_DEFAULT_CATEGORY when category is changed', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    const categorySelect = screen.getByRole('combobox', {
      name: /default-category/i,
    });
    await user.selectOptions(categorySelect, 'Transport');

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_DEFAULT_CATEGORY',
      payload: { categoryId: 2 },
    });
  });

  test('shows "No categories available" when categories are empty', () => {
    vi.mocked(useAppState).mockReturnValue({
      ...defaultState,
      categories: [],
    });

    render(<Settings />);

    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  test('opens data manager when clicking Manage Data', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    expect(screen.queryByTestId('data-manager')).not.toBeInTheDocument();

    await user.click(screen.getByText('Manage Data'));

    expect(screen.getByTestId('data-manager')).toBeInTheDocument();
  });

  test('closes data manager via its onClose callback', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await user.click(screen.getByText('Manage Data'));
    expect(screen.getByTestId('data-manager')).toBeInTheDocument();

    await user.click(screen.getByTestId('data-manager-close'));
    expect(screen.queryByTestId('data-manager')).not.toBeInTheDocument();
  });
});
