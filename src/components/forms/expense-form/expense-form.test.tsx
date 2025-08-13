import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseForm, { type ExpenseFormData } from './expense-form';
import type { Category } from '../../../types/category';
import type { Budget } from '../../../types/budget';
import type { Currency } from '../../../types/currency';
import type { Expense } from '../../../types/expense';

// Mock UI component prop types
interface MockCardButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon: string;
}

interface MockInputProps {
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string;
  type: string;
  name: string;
  required?: boolean;
}

interface MockSelectProps {
  options: Budget[];
  onChange: (value: string, dataId: number) => void;
  value: string;
  getOptionLabel: (option: Budget) => string;
  getOptionId: (option: Budget) => number;
}

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant: string;
}

// Mock the useNextId hook
vi.mock('../../../hooks/nextId/next-id', () => ({
  useNextId: vi.fn(() => 1),
}));

// Mock UI components
vi.mock('../../ui/card-btn/card-btn', () => ({
  default: ({ label, selected, onClick, icon }: MockCardButtonProps) => (
    <button
      data-testid={`category-${label}`}
      onClick={onClick}
      className={selected ? 'selected' : ''}
    >
      {icon} {label}
    </button>
  ),
}));

vi.mock('../../ui/input/input', () => ({
  default: ({
    value,
    onChange,
    placeholder,
    id,
    type,
    name,
    required,
  }: MockInputProps) => (
    <input
      data-testid={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      name={name}
      required={required}
    />
  ),
}));

vi.mock('../../ui/select/select', () => ({
  default: ({ options, onChange, value, getOptionLabel, getOptionId }: MockSelectProps) => (
    <select
      data-testid="budget-select"
      value={value || ''}
      onChange={(e) => {
        const selectedOption = options.find(
          (opt: Budget) => getOptionLabel(opt) === e.target.value
        );
        if (selectedOption) {
          onChange(e.target.value, getOptionId(selectedOption));
        }
      }}
    >
      {options.length === 0 ? (
        <option value="">No options available</option>
      ) : (
        options.map((option: Budget) => (
          <option key={getOptionId(option)} value={getOptionLabel(option)}>
            {getOptionLabel(option)}
          </option>
        ))
      )}
    </select>
  ),
}));

vi.mock('../../ui/button/button', () => ({
  default: ({ children, onClick, type, variant }: MockButtonProps) => (
    <button data-testid={`${variant}-button`} type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ExpenseForm', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Food', icon: '🍔' },
    { id: 2, name: 'Transport', icon: '🚗' },
  ];

  const mockBudgets: Budget[] = [
    {
      id: 1,
      name: 'Monthly Budget',
      categoryIds: [1, 2],
      limit: 1000,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
    {
      id: 2,
      name: 'Weekly Budget',
      categoryIds: [1],
      limit: 250,
      startDate: '2024-01-01',
      endDate: '2024-01-07',
    },
  ];

  const mockCurrency: Currency = {
    symbol: '$',
    code: 'USD',
    id: 1,
    label: 'US Dollar',
    decimals: 2,
  };

  const mockExpenses: Expense[] = [];

  const defaultProps = {
    categories: mockCategories,
    budgets: mockBudgets,
    currency: mockCurrency,
    expenses: mockExpenses,
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    render(<ExpenseForm {...defaultProps} />);

    expect(screen.getByTestId('amount')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toBeInTheDocument();
    expect(screen.getByTestId('budget-select')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByTestId('primary-button')).toBeInTheDocument();
    expect(screen.getByTestId('secondary-button')).toBeInTheDocument();
  });

  test('initializes with default values when no expenseFormData provided', () => {
    render(<ExpenseForm {...defaultProps} />);

    expect(screen.getByTestId('amount')).toHaveValue(0);
    expect(screen.getByTestId('description')).toHaveValue('');
    expect(screen.getByTestId('budget-select')).toHaveValue('Monthly Budget');
  });

  test('initializes with provided expenseFormData', () => {
    const expenseFormData: ExpenseFormData = {
      id: 5,
      amount: 50,
      description: 'Test expense',
      categoryId: 2,
      category: 'Transport',
      budgetId: 2,
      budget: 'Weekly Budget',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    render(<ExpenseForm {...defaultProps} expenseFormData={expenseFormData} />);

    expect(screen.getByTestId('amount')).toHaveValue(50);
    expect(screen.getByTestId('description')).toHaveValue('Test expense');
    expect(screen.getByTestId('budget-select')).toHaveValue('Weekly Budget');
  });

  test('updates amount when input changes', () => {
    render(<ExpenseForm {...defaultProps} />);

    const amountInput = screen.getByTestId('amount');
    fireEvent.change(amountInput, { target: { name: 'amount', value: '100' } });

    expect(amountInput).toHaveValue(100);
  });

  test('updates description when input changes', () => {
    render(<ExpenseForm {...defaultProps} />);

    const descriptionInput = screen.getByTestId('description');
    fireEvent.change(descriptionInput, {
      target: { name: 'description', value: 'Lunch' },
    });

    expect(descriptionInput).toHaveValue('Lunch');
  });

  test('selects category when category button is clicked', () => {
    render(<ExpenseForm {...defaultProps} />);

    const foodCategoryButton = screen.getByTestId('category-Food');
    fireEvent.click(foodCategoryButton);

    expect(foodCategoryButton).toHaveClass('selected');
  });

  test('changes budget when select value changes', () => {
    render(<ExpenseForm {...defaultProps} />);

    const budgetSelect = screen.getByTestId('budget-select');
    fireEvent.change(budgetSelect, { target: { value: 'Weekly Budget' } });

    expect(budgetSelect).toHaveValue('Weekly Budget');
  });

  test('calls onSubmit with form data when form is submitted', () => {
    const mockOnSubmit = vi.fn();
    render(<ExpenseForm {...defaultProps} onSubmit={mockOnSubmit} />);

    // Fill form
    fireEvent.change(screen.getByTestId('amount'), {
      target: { name: 'amount', value: '75' },
    });
    fireEvent.change(screen.getByTestId('description'), {
      target: { name: 'description', value: 'Coffee' },
    });
    fireEvent.click(screen.getByTestId('category-Food'));

    // Submit form
    const form = screen.getByTestId('amount').closest('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '75',
        description: 'Coffee',
        categoryId: 1,
        category: 'Food',
        budgetId: 1,
        budget: 'Monthly Budget',
      })
    );
  });

  test('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = vi.fn();
    render(<ExpenseForm {...defaultProps} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByTestId('secondary-button'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('handles empty budgets array gracefully', () => {
    render(<ExpenseForm {...defaultProps} budgets={[]} />);

    expect(screen.getByTestId('budget-select')).toBeInTheDocument();
    expect(screen.getByTestId('budget-select')).toHaveValue('');
  });

  test('renders category buttons for all provided categories', () => {
    render(<ExpenseForm {...defaultProps} />);

    expect(screen.getByTestId('category-Food')).toBeInTheDocument();
    expect(screen.getByTestId('category-Transport')).toBeInTheDocument();
  });

  test('displays currency symbol in amount placeholder', () => {
    render(<ExpenseForm {...defaultProps} />);

    expect(screen.getByTestId('amount')).toHaveAttribute(
      'placeholder',
      '$0.00'
    );
  });

  test('does not call onSubmit if not provided', () => {
    render(<ExpenseForm {...defaultProps} onSubmit={undefined} />);

    const form = screen.getByTestId('amount').closest('form');
    expect(() => fireEvent.submit(form!)).not.toThrow();
  });
});