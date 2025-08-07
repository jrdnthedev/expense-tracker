import { describe,expect, vi, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetForm from './budget-form';
import type { ChangeEventHandler } from 'react';

interface MockInputProps {
  value: string | number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type: string;
  id: string;
}

interface MockDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
}

// Mock child components
vi.mock('../../ui/input/input', () => ({
  default: ({ value, onChange, type, id }: MockInputProps) => (
    <input
      data-testid={id}
      type={type}
      value={value}
      onChange={onChange}
    />
  ),
}));


vi.mock('../../ui/date-picker/date-picker', () => ({
  default: ({ value, onChange, id }: MockDatePickerProps) => (
    <input
      data-testid={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('BudgetForm', () => {
  const defaultProps = {
    formState: {
      name: '',
      limit: 0,
      category: '',
      categoryIds: [],
      startDate: '',
      endDate: '',
    },
    categories: [],
    onFieldChange: vi.fn(),
  };

  test('renders all form fields', () => {
    render(<BudgetForm {...defaultProps} />);
    expect(screen.getByTestId('name')).toBeInTheDocument();
    expect(screen.getByTestId('limit')).toBeInTheDocument();
    expect(screen.getByTestId('startDate')).toBeInTheDocument();
    expect(screen.getByTestId('endDate')).toBeInTheDocument();
  });

  test('calls onFieldChange with correct values when name changes', () => {
    render(<BudgetForm {...defaultProps} />);
    const nameInput = screen.getByTestId('name');
    fireEvent.change(nameInput, { target: { value: 'Test Budget' } });
    expect(defaultProps.onFieldChange).toHaveBeenCalledWith('name', 'Test Budget');
  });

  test('calls onFieldChange with correct values when limit changes', () => {
    render(<BudgetForm {...defaultProps} />);
    const limitInput = screen.getByTestId('limit');
    fireEvent.change(limitInput, { target: { value: '1000' } });
    expect(defaultProps.onFieldChange).toHaveBeenCalledWith('limit', 1000);
  });

  test('calls onFieldChange with correct values when dates change', () => {
    render(<BudgetForm {...defaultProps} />);
    const startDate = screen.getByTestId('startDate');
    const endDate = screen.getByTestId('endDate');
    
    fireEvent.change(startDate, { target: { value: '2024-01-01' } });
    expect(defaultProps.onFieldChange).toHaveBeenCalledWith('startDate', '2024-01-01');
    
    fireEvent.change(endDate, { target: { value: '2024-12-31' } });
    expect(defaultProps.onFieldChange).toHaveBeenCalledWith('endDate', '2024-12-31');
  });
});