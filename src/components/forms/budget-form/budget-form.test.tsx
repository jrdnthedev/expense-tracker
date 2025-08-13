import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetForm, { type BudgetFormData } from './budget-form';
import type { Currency } from '../../../types/currency';
import type { Budget } from '../../../types/budget';

// Mock the useNextId hook
vi.mock('../../../hooks/nextId/next-id', () => ({
  useNextId: vi.fn(() => 1),
}));

// Mock UI components
vi.mock('../../ui/input/input', () => ({
  default: ({ onChange, ...props }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} onChange={onChange} data-testid={`input-${props.name || props.id}`} />
  ),
}));

vi.mock('../../ui/date-picker/date-picker', () => ({
  default: ({ onChange, ...props }: { onChange: (date: string | number) => void } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      type="date"
      onChange={(e) => onChange(e.target.value)}
      data-testid={`datepicker-${props.name || props.id}`}
    />
  ),
}));

vi.mock('../../ui/button/button', () => ({
  default: ({ children, ...props }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} data-testid="submit-button">
      {children}
    </button>
  ),
}));

describe('BudgetForm', () => {
  const mockCurrency: Currency = {
    code: 'USD',
    symbol: '$',
    decimals: 2,
    label: 'USD',
    id: 1,
  };

  const mockBudgets: Budget[] = [];

  const defaultProps = {
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    currency: mockCurrency,
    budgets: mockBudgets,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('initializes form with default values', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByTestId('input-name')).toHaveValue('');
    expect(screen.getByTestId('input-limit')).toHaveValue(0);
    expect(screen.getByTestId('datepicker-startDate')).toHaveValue('');
    expect(screen.getByTestId('datepicker-endDate')).toHaveValue('');
  });

  test('initializes form with provided budgetFormData', () => {
    const budgetFormData: BudgetFormData = {
      id: 2,
      name: 'Test Budget',
      limit: 1000,
      categoryIds: [1, 2],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    render(<BudgetForm {...defaultProps} budgetFormData={budgetFormData} />);

    expect(screen.getByTestId('input-name')).toHaveValue('Test Budget');
    expect(screen.getByTestId('input-limit')).toHaveValue(1000);
    expect(screen.getByTestId('datepicker-startDate')).toHaveValue('2024-01-01');
    expect(screen.getByTestId('datepicker-endDate')).toHaveValue('2024-12-31');
  });

  test('updates form state when input values change', async () => {
    const user = userEvent.setup();
    render(<BudgetForm {...defaultProps} />);

    const nameInput = screen.getByTestId('input-name');
    const limitInput = screen.getByTestId('input-limit');

    await user.type(nameInput, 'New Budget');
    await user.clear(limitInput);
    await user.type(limitInput, '500');

    expect(nameInput).toHaveValue('New Budget');
    expect(limitInput).toHaveValue(500);
  });

  test('shows validation errors for empty required fields', async () => {
    render(<BudgetForm {...defaultProps} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Limit must be greater than 0')).toBeInTheDocument();
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid limit', async () => {
    const user = userEvent.setup();
    render(<BudgetForm {...defaultProps} />);

    const limitInput = screen.getByTestId('input-limit');
    await user.clear(limitInput);
    await user.type(limitInput, '-100');

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Limit must be greater than 0')).toBeInTheDocument();
    });
  });

  test('clears error messages when user starts typing', async () => {
    const user = userEvent.setup();
    render(<BudgetForm {...defaultProps} />);

    // Trigger validation errors
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Start typing in name field
    const nameInput = screen.getByTestId('input-name');
    await user.type(nameInput, 'A');

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  test('clears date error messages when date changes', async () => {
    render(<BudgetForm {...defaultProps} />);

    // Trigger validation errors
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
    });

    // Change start date
    const startDatePicker = screen.getByTestId('datepicker-startDate');
    fireEvent.change(startDatePicker, { target: { value: '2024-01-01' } });

    expect(screen.queryByText('Start date is required')).not.toBeInTheDocument();
  });

  test('calls onSubmit with form data when validation passes', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<BudgetForm {...defaultProps} onSubmit={mockOnSubmit} />);

    // Fill out valid form data
    await user.type(screen.getByTestId('input-name'), 'Valid Budget');
    await user.clear(screen.getByTestId('input-limit'));
    await user.type(screen.getByTestId('input-limit'), '1000');
    
    const startDatePicker = screen.getByTestId('datepicker-startDate');
    const endDatePicker = screen.getByTestId('datepicker-endDate');
    fireEvent.change(startDatePicker, { target: { value: '2024-01-01' } });
    fireEvent.change(endDatePicker, { target: { value: '2024-12-31' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        id: 1,
        name: 'Valid Budget',
        limit: 1000,
        categoryIds: [],
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });
  });

  test('does not call onSubmit when validation fails', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm {...defaultProps} onSubmit={mockOnSubmit} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('displays currency symbol in limit placeholder', () => {
    const euroCurrency: Currency = {
      code: 'EUR',
      symbol: '€',
      decimals: 2,
      label: 'EUR',
      id: 2,
    };

    render(<BudgetForm {...defaultProps} currency={euroCurrency} />);

    const limitInput = screen.getByTestId('input-limit');
    expect(limitInput).toHaveAttribute('placeholder', '€0.00');
  });

  test('prevents form submission on invalid form', async () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm {...defaultProps} onSubmit={mockOnSubmit} />);

    // Fill partial data (missing required fields)
    const user = userEvent.setup();
    await user.type(screen.getByTestId('input-name'), 'Partial Budget');

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Limit must be greater than 0')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});