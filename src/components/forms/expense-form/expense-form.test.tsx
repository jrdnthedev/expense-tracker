import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { useRef } from 'react';
import ExpenseForm from './expense-form';
import type { ExpenseFormRef } from './expense-form';
import type { Category } from '../../../types/category';
import type { Budget } from '../../../types/budget';
import type { Currency } from '../../../types/currency';

// Mock the UI components
vi.mock('../../ui/input/input', () => ({
  default: ({ id, type, value, onChange, placeholder, required }: {
    id: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
  }) => (
    <input
      data-testid={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  ),
}));

vi.mock('../../ui/select/select', () => ({
  default: ({ id, value, onChange, options, getOptionId, getOptionLabel }: {
    id: string;
    value: string;
    onChange: (label: string, id: number) => void;
    options: Budget[];
    getOptionId: (option: Budget) => number;
    getOptionLabel: (option: Budget) => string;
  }) => (
    <select
      data-testid={id}
      value={value}
      onChange={(e) => {
        const selectedOption = options.find((opt: Budget) => getOptionLabel(opt) === e.target.value);
        if (selectedOption) {
          onChange(getOptionLabel(selectedOption), getOptionId(selectedOption));
        }
      }}
    >
      <option value="">Select option</option>
      {options.map((option: Budget) => (
        <option key={getOptionId(option)} value={getOptionLabel(option)}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('../../ui/card-btn/card-btn', () => ({
  default: ({ label, selected, onClick }: {
    label: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      data-testid={`category-${label}`}
      className={selected ? 'selected' : ''}
      onClick={onClick}
    >
      {label}
    </button>
  ),
}));

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍔' },
  { id: 2, name: 'Transport', icon: '🚗' },
];

const mockBudgets: Budget[] = [
  { id: 1, name: 'Monthly Budget', limit: 1000, categoryIds: [1], startDate: '2024-01-01', endDate: '2024-01-31' },
  { id: 2, name: 'Travel Budget', limit: 500, categoryIds: [2], startDate: '2024-02-01', endDate: '2024-02-29' },
];

const mockCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  label: 'US Dollar',
  id: 1,
  decimals: 1
};

const defaultInitialData = {
  id: 1,
  amount: 100,
  description: 'Test expense',
  categoryId: 1,
  category: 'Food',
  budgetId: 1,
  budget: 'Monthly Budget',
  createdAt: '2024-01-01T10:00:00.000Z',
};

test('renders form with initial data', () => {
  render(
    <ExpenseForm
      initialData={defaultInitialData}
      categories={mockCategories}
      budgets={mockBudgets}
      currency={mockCurrency}
    />
  );

  expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Test expense')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Monthly Budget')).toBeInTheDocument();
  expect(screen.getByTestId('category-Food')).toHaveClass('selected');
});

test('updates form fields when user types', () => {
  render(
    <ExpenseForm
      initialData={defaultInitialData}
      categories={mockCategories}
      budgets={mockBudgets}
      currency={mockCurrency}
    />
  );

  const amountInput = screen.getByTestId('amount');
  fireEvent.change(amountInput, { target: { value: '200' } });
  expect(screen.getByDisplayValue('200')).toBeInTheDocument();

  const descriptionInput = screen.getByTestId('description');
  fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
  expect(screen.getByDisplayValue('Updated description')).toBeInTheDocument();
});

test('handles category selection', () => {
  render(
    <ExpenseForm
      initialData={defaultInitialData}
      categories={mockCategories}
      budgets={mockBudgets}
      currency={mockCurrency}
    />
  );

  const transportButton = screen.getByTestId('category-Transport');
  fireEvent.click(transportButton);

  expect(transportButton).toHaveClass('selected');
  expect(screen.getByTestId('category-Food')).not.toHaveClass('selected');
});

test('handles budget selection', () => {
  render(
    <ExpenseForm
      initialData={defaultInitialData}
      categories={mockCategories}
      budgets={mockBudgets}
      currency={mockCurrency}
    />
  );

  const budgetSelect = screen.getByTestId('budget');
  fireEvent.change(budgetSelect, { target: { value: 'Travel Budget' } });

  expect(screen.getByDisplayValue('Travel Budget')).toBeInTheDocument();
});

test('ref methods work correctly', () => {
  const TestComponent = () => {
    const ref = useRef<ExpenseFormRef>(null);

    return (
      <div>
        <ExpenseForm
          ref={ref}
          initialData={defaultInitialData}
          categories={mockCategories}
          budgets={mockBudgets}
          currency={mockCurrency}
        />
        <button
          onClick={() => {
            const data = ref.current?.getFormData();
            const isValid = ref.current?.isValid();

            const dataDiv = document.createElement('div');
            dataDiv.setAttribute('data-testid', 'form-data');
            dataDiv.textContent = JSON.stringify(data);
            document.body.appendChild(dataDiv);

            const validDiv = document.createElement('div');
            validDiv.setAttribute('data-testid', 'is-valid');
            validDiv.textContent = String(isValid);
            document.body.appendChild(validDiv);
          }}
        >
          Get Data
        </button>
      </div>
    );
  };

  render(<TestComponent />);

  fireEvent.click(screen.getByText('Get Data'));

  expect(screen.getByTestId('form-data')).toHaveTextContent('Test expense');
  expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
});

test('reset method works correctly', () => {
  const TestComponent = () => {
    const ref = useRef<ExpenseFormRef>(null);

    return (
      <div>
        <ExpenseForm
          ref={ref}
          initialData={defaultInitialData}
          categories={mockCategories}
          budgets={mockBudgets}
          currency={mockCurrency}
        />
        <button onClick={() => ref.current?.reset()}>Reset</button>
      </div>
    );
  };

  render(<TestComponent />);

  // Change a field first
  const descriptionInput = screen.getByTestId('description');
  fireEvent.change(descriptionInput, { target: { value: 'Changed description' } });
  expect(screen.getByDisplayValue('Changed description')).toBeInTheDocument();

  // Reset the form
  fireEvent.click(screen.getByText('Reset'));
  expect(screen.getByDisplayValue('Test expense')).toBeInTheDocument();
});

test('auto-selects first budget when none selected', () => {
  const dataWithoutBudget = {
    ...defaultInitialData,
    budgetId: 0,
    budget: '',
  };

  render(
    <ExpenseForm
      initialData={dataWithoutBudget}
      categories={mockCategories}
      budgets={mockBudgets}
      currency={mockCurrency}
    />
  );

  expect(screen.getByDisplayValue('Monthly Budget')).toBeInTheDocument();
});