import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetForm, { type BudgetFormData } from './budget-form';
import type { Currency } from '../../../types/currency';

// Mock UI component prop types
interface MockInputProps {
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string;
  type: string;
  name: string;
}

interface MockDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  id: string;
  name?: string;
  min?: string;
}

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant: string;
}

// Mock UI components
vi.mock('../../ui/input/input', () => ({
  default: ({ value, onChange, placeholder, id, type, name }: MockInputProps) => (
    <input
      data-testid={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      name={name}
    />
  ),
}));

vi.mock('../../ui/date-picker/date-picker', () => ({
  default: ({ value, onChange, id, name, min }: MockDatePickerProps) => (
    <input
      data-testid={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      name={name}
      min={min}
    />
  ),
}));

vi.mock('../../ui/button/button', () => ({
  default: ({ children, onClick, type, variant }: MockButtonProps) => (
    <button data-testid={`${variant}-button`} type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('BudgetForm', () => {
  const mockCurrency: Currency = {
    symbol: '$',
    code: 'USD',
    id: 1,
    label: 'US Dollar',
    decimals: 2,
  };

  const defaultProps = {
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    currency: mockCurrency,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByTestId('name')).toBeInTheDocument();
    expect(screen.getByTestId('limit')).toBeInTheDocument();
    expect(screen.getByTestId('startDate')).toBeInTheDocument();
    expect(screen.getByTestId('endDate')).toBeInTheDocument();
    expect(screen.getByTestId('primary-button')).toBeInTheDocument();
  });

  test('initializes with default values when no budgetFormData provided', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByTestId('name')).toHaveValue('');
    expect(screen.getByTestId('limit')).toHaveValue(0);
    expect(screen.getByTestId('startDate')).toHaveValue('');
    expect(screen.getByTestId('endDate')).toHaveValue('');
  });

  test('initializes with provided budgetFormData', () => {
    const budgetFormData: BudgetFormData = {
      id: 1,
      name: 'Monthly Budget',
      limit: 1000,
      categoryIds: [1, 2],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    render(<BudgetForm {...defaultProps} budgetFormData={budgetFormData} />);

    expect(screen.getByTestId('name')).toHaveValue('Monthly Budget');
    expect(screen.getByTestId('limit')).toHaveValue(1000);
    expect(screen.getByTestId('startDate')).toHaveValue('2024-01-01');
    expect(screen.getByTestId('endDate')).toHaveValue('2024-01-31');
  });

  test('updates name when input changes', () => {
    render(<BudgetForm {...defaultProps} />);

    const nameInput = screen.getByTestId('name');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'New Budget' } });

    expect(nameInput).toHaveValue('New Budget');
  });

  test('updates limit when input changes', () => {
    render(<BudgetForm {...defaultProps} />);

    const limitInput = screen.getByTestId('limit');
    fireEvent.change(limitInput, { target: { name: 'limit', value: '500' } });

    expect(limitInput).toHaveValue(500);
  });

  test('updates start date when date picker changes', () => {
    render(<BudgetForm {...defaultProps} />);

    const startDateInput = screen.getByTestId('startDate');
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });

    expect(startDateInput).toHaveValue('2024-02-01');
  });

  test('updates end date when date picker changes', () => {
    render(<BudgetForm {...defaultProps} />);

    const endDateInput = screen.getByTestId('endDate');
    fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });

    expect(endDateInput).toHaveValue('2024-02-28');
  });

  test('sets min date for end date picker based on start date', () => {
    const budgetFormData: BudgetFormData = {
      id: 1,
      name: 'Test Budget',
      limit: 1000,
      categoryIds: [],
      startDate: '2024-01-15',
      endDate: '',
    };

    render(<BudgetForm {...defaultProps} budgetFormData={budgetFormData} />);

    const endDateInput = screen.getByTestId('endDate');
    expect(endDateInput).toHaveAttribute('min', '2024-01-15');
  });

  test('calls onSubmit with form data when form is submitted', () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm {...defaultProps} onSubmit={mockOnSubmit} />);

    // Fill form
    fireEvent.change(screen.getByTestId('name'), {
      target: { name: 'name', value: 'Test Budget' },
    });
    fireEvent.change(screen.getByTestId('limit'), {
      target: { name: 'limit', value: '750' },
    });
    fireEvent.change(screen.getByTestId('startDate'), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByTestId('endDate'), {
      target: { value: '2024-01-31' },
    });

    // Submit form
    const form = screen.getByTestId('name').closest('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Budget',
        limit: '750',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        categoryIds: [],
      })
    );
  });

  test('displays currency symbol in limit placeholder', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByTestId('limit')).toHaveAttribute('placeholder', '$0.00');
  });

  test('handles form submission with empty onSubmit gracefully', () => {
    render(<BudgetForm {...defaultProps} onSubmit={() => void 0} />);

    const form = screen.getByTestId('name').closest('form');
    expect(() => fireEvent.submit(form!)).not.toThrow();
  });

  test('renders correct labels for form fields', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Limit')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  test('form fields have correct types', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByTestId('name')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('limit')).toHaveAttribute('type', 'number');
    expect(screen.getByTestId('startDate')).toHaveAttribute('type', 'date');
    expect(screen.getByTestId('endDate')).toHaveAttribute('type', 'date');
  });

  test('initializes id with 0 when no budgetFormData provided', () => {
    const mockOnSubmit = vi.fn();
    render(<BudgetForm {...defaultProps} onSubmit={mockOnSubmit} />);

    const form = screen.getByTestId('name').closest('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 0,
      })
    );
  });

  test('preserves id when budgetFormData is provided', () => {
    const budgetFormData: BudgetFormData = {
      id: 5,
      name: 'Existing Budget',
      limit: 500,
      categoryIds: [1],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    const mockOnSubmit = vi.fn();
    render(<BudgetForm {...defaultProps} budgetFormData={budgetFormData} onSubmit={mockOnSubmit} />);

    const form = screen.getByTestId('name').closest('form');
    fireEvent.submit(form!);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
      })
    );
  });
});