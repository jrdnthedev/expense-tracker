import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, describe, vi, beforeEach } from 'vitest';
import ExpenseForm from './expense-form';
import type { Category } from '../../../types/category';
import type { Budget } from '../../../types/budget';
import type { Currency } from '../../../types/currency';
import type { Expense } from '../../../types/expense';

interface MockInputProps {
  value: string | number;
}
interface MockSelectProps {
  options: Budget[];
  onChange: (value: string, dataId: number) => void;
  getOptionValue: (option: Budget) => string;
  getOptionId: (option: Budget) => number;
  getOptionLabel: (option: Budget) => string;
}
interface MockCardBtnProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}
// Mock the UI components
vi.mock('../../ui/input/input', () => ({
  default: (props: MockInputProps) => <input {...props} />,
}));

vi.mock('../../ui/select/select', () => ({
  default: (props: MockSelectProps) => (
    <select
      {...props}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = props.options.find(
          (opt: Budget) => props.getOptionValue(opt) === e.target.value
        );
        if (selectedOption) {
          props.onChange(e.target.value, props.getOptionId(selectedOption));
        }
      }}
    >
      {props.options.map((option: Budget) => (
        <option
          key={props.getOptionId(option)}
          value={props.getOptionValue(option)}
        >
          {props.getOptionLabel(option)}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('../../ui/card-btn/card-btn', () => ({
  default: (props: MockCardBtnProps) => (
    <button
      onClick={props.onClick}
      className={props.selected ? 'selected' : ''}
    >
      {props.label}
    </button>
  ),
}));

describe('ExpenseForm', () => {
  const mockOnFieldChange = vi.fn();

  const mockCategories: Category[] = [
    { id: 1, name: 'Food', icon: '🍔' },
    { id: 2, name: 'Transport', icon: '🚗' },
  ];

  const mockBudgets: Budget[] = [
    {
      id: 1,
      name: 'Monthly Budget',
      category: 'Food',
      categoryIds: [1, 2],
      limit: 500,
      startDate: '2023-01-01',
      endDate: '2023-01-31',
      expenseIds: [],
    },
    {
      id: 2,
      name: 'Weekly Budget',
      category: 'Food',
      categoryIds: [1],
      limit: 200,
      startDate: '2023-01-01',
      endDate: '2023-01-07',
      expenseIds: [],
    },
  ];

  const mockFormState: Expense = {
    id: 1,
    amount: 10.5,
    description: 'Test expense',
    categoryId: 1,
    category: 'Food',
    budgetId: 1,
    budget: 'Monthly Budget',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockCurrency: Currency = {
    id: 1,
    label: 'US Dollar',
    symbol: '$',
    code: 'USD',
    decimals: 2,
  };

  beforeEach(() => {
    mockOnFieldChange.mockClear();
  });

  test('renders all form fields correctly', () => {
    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={mockFormState}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Budgets')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  test('displays form values correctly', () => {
    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={mockFormState}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(screen.getByDisplayValue(10.5)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test expense')).toBeInTheDocument();
  });

  test('calls onFieldChange when amount input changes', () => {
    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={mockFormState}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    const amountInput = screen.getByLabelText('Amount');
    fireEvent.change(amountInput, { target: { value: '25.00' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('amount', '25.00');
  });

  test('calls onFieldChange when description input changes', () => {
    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={mockFormState}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, {
      target: { value: 'New description' },
    });

    expect(mockOnFieldChange).toHaveBeenCalledWith(
      'description',
      'New description'
    );
  });

  test('calls onFieldChange when category is selected', () => {
    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={mockFormState}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    const transportButton = screen.getByText('Transport');
    fireEvent.click(transportButton);

    expect(mockOnFieldChange).toHaveBeenCalledWith('categoryId', 2);
    expect(mockOnFieldChange).toHaveBeenCalledWith('category', 'Transport');
  });

  test('automatically selects first budget when no budget is selected', () => {
    const formStateWithoutBudget = { ...mockFormState, budgetId: 0 };

    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={formStateWithoutBudget}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(mockOnFieldChange).toHaveBeenCalledWith('budgetId', 1);
    expect(mockOnFieldChange).toHaveBeenCalledWith('budget', 'Monthly Budget');
  });

  test('displays currency symbol in amount placeholder', () => {
    render(
      <ExpenseForm
        categories={mockCategories}
        budgets={mockBudgets}
        formState={mockFormState}
        currency={mockCurrency}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(screen.getByPlaceholderText('$0.00')).toBeInTheDocument();
  });
});
