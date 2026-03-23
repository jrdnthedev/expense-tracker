import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetForm from './budget-form';
import type { Currency } from '../../../types/currency';
import type { Budget } from '../../../types/budget';
import type { BudgetFormData } from '../../../constants/form-data';

const defaultCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  decimals: 2,
  label: 'US Dollar',
  id: 1,
};

const defaultBudgets: Budget[] = [
  {
    id: 1,
    name: 'Groceries',
    categoryIds: [1],
    limit: 500,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  },
];

const defaultProps = {
  onCancel: vi.fn(),
  onSubmit: vi.fn(),
  currency: defaultCurrency,
  budgets: defaultBudgets,
};

describe('BudgetForm validationRules', () => {
  const validationRules = {
    limit: (value: number) =>
      !value || value <= 0 ? 'Limit must be greater than 0' : '',
    name: (value: string) => (!value.trim() ? 'Name is required' : ''),
    startDate: (value: string) => (!value ? 'Start date is required' : ''),
    endDate: (value: string) => (!value ? 'End date is required' : ''),
  };

  describe('limit validation', () => {
    test('should return error for zero limit', () => {
      expect(validationRules.limit(0)).toBe('Limit must be greater than 0');
    });

    test('should return error for negative limit', () => {
      expect(validationRules.limit(-10)).toBe('Limit must be greater than 0');
    });

    test('should return empty string for positive limit', () => {
      expect(validationRules.limit(100)).toBe('');
    });

    test('should return empty string for decimal limit', () => {
      expect(validationRules.limit(99.99)).toBe('');
    });
  });

  describe('name validation', () => {
    test('should return error for empty string', () => {
      expect(validationRules.name('')).toBe('Name is required');
    });

    test('should return error for whitespace only', () => {
      expect(validationRules.name('   ')).toBe('Name is required');
    });

    test('should return error for tabs and spaces', () => {
      expect(validationRules.name('\t\n  ')).toBe('Name is required');
    });

    test('should return empty string for valid name', () => {
      expect(validationRules.name('Budget Name')).toBe('');
    });

    test('should return empty string for name with leading/trailing spaces', () => {
      expect(validationRules.name('  Budget Name  ')).toBe('');
    });
  });

  describe('startDate validation', () => {
    test('should return error for empty string', () => {
      expect(validationRules.startDate('')).toBe('Start date is required');
    });

    test('should return empty string for valid date', () => {
      expect(validationRules.startDate('2024-01-01')).toBe('');
    });

    test('should return empty string for any non-empty string', () => {
      expect(validationRules.startDate('invalid-date')).toBe('');
    });
  });

  describe('endDate validation', () => {
    test('should return error for empty string', () => {
      expect(validationRules.endDate('')).toBe('End date is required');
    });

    test('should return empty string for valid date', () => {
      expect(validationRules.endDate('2024-12-31')).toBe('');
    });

    test('should return empty string for any non-empty string', () => {
      expect(validationRules.endDate('invalid-date')).toBe('');
    });
  });
});

describe('BudgetForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders all form fields', () => {
      render(<BudgetForm {...defaultProps} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Limit')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    test('renders Save button', () => {
      render(<BudgetForm {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Save' })
      ).toBeInTheDocument();
    });

    test('renders name placeholder', () => {
      render(<BudgetForm {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Enter budget name')
      ).toBeInTheDocument();
    });

    test('renders limit placeholder with currency symbol', () => {
      render(<BudgetForm {...defaultProps} />);

      expect(screen.getByPlaceholderText('$0.00')).toBeInTheDocument();
    });

    test('renders limit placeholder with different currency symbol', () => {
      const eurCurrency: Currency = {
        code: 'EUR',
        symbol: '€',
        decimals: 2,
        label: 'Euro',
        id: 2,
      };
      render(<BudgetForm {...defaultProps} currency={eurCurrency} />);

      expect(screen.getByPlaceholderText('€0.00')).toBeInTheDocument();
    });

    test('renders empty form fields by default', () => {
      render(<BudgetForm {...defaultProps} />);

      expect(screen.getByLabelText('Name')).toHaveValue('');
      expect(screen.getByLabelText('Limit')).toHaveValue(0);
      expect(screen.getByLabelText('Start Date')).toHaveValue('');
      expect(screen.getByLabelText('End Date')).toHaveValue('');
    });
  });

  describe('pre-filled data', () => {
    const budgetFormData: BudgetFormData = {
      id: 1,
      name: 'Groceries',
      limit: 500,
      categoryIds: [1, 2],
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    test('renders with pre-filled values when budgetFormData is provided', () => {
      render(
        <BudgetForm {...defaultProps} budgetFormData={budgetFormData} />
      );

      expect(screen.getByLabelText('Name')).toHaveValue('Groceries');
      expect(screen.getByLabelText('Limit')).toHaveValue(500);
      expect(screen.getByLabelText('Start Date')).toHaveValue('2024-01-01');
      expect(screen.getByLabelText('End Date')).toHaveValue('2024-01-31');
    });
  });

  describe('form interaction', () => {
    test('allows typing a budget name', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Monthly Food');

      expect(nameInput).toHaveValue('Monthly Food');
    });

    test('allows typing a limit', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      const limitInput = screen.getByLabelText('Limit');
      await user.clear(limitInput);
      await user.type(limitInput, '250');

      expect(limitInput).toHaveValue(250);
    });

    test('allows selecting a start date', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      const startDate = screen.getByLabelText('Start Date');
      await user.type(startDate, '2024-06-01');

      expect(startDate).toHaveValue('2024-06-01');
    });

    test('allows selecting an end date', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      const endDate = screen.getByLabelText('End Date');
      await user.type(endDate, '2024-06-30');

      expect(endDate).toHaveValue('2024-06-30');
    });
  });

  describe('form submission', () => {
    test('calls onSubmit with form data when all fields are valid', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BudgetForm {...defaultProps} onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('Name'), 'Monthly Food');
      await user.clear(screen.getByLabelText('Limit'));
      await user.type(screen.getByLabelText('Limit'), '250');
      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');
      await user.type(screen.getByLabelText('End Date'), '2024-06-30');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Monthly Food',
          limit: '250',
          startDate: '2024-06-01',
          endDate: '2024-06-30',
        })
      );
    });

    test('calls onSubmit with pre-filled data on edit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const budgetFormData: BudgetFormData = {
        id: 1,
        name: 'Groceries',
        limit: 500,
        categoryIds: [1],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      render(
        <BudgetForm
          {...defaultProps}
          onSubmit={onSubmit}
          budgetFormData={budgetFormData}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'Groceries',
          limit: 500,
          categoryIds: [1],
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );
    });

    test('does not call onSubmit when name is empty', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BudgetForm {...defaultProps} onSubmit={onSubmit} />);

      await user.clear(screen.getByLabelText('Limit'));
      await user.type(screen.getByLabelText('Limit'), '250');
      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');
      await user.type(screen.getByLabelText('End Date'), '2024-06-30');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('does not call onSubmit when limit is 0', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BudgetForm {...defaultProps} onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('Name'), 'Budget');
      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');
      await user.type(screen.getByLabelText('End Date'), '2024-06-30');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    test('shows all validation errors when submitting empty form', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(
        screen.getByText('Limit must be greater than 0')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Start date is required')
      ).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
    });

    test('clears name error when user types in name field', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByText('Name is required')).toBeInTheDocument();

      await user.type(screen.getByLabelText('Name'), 'B');
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });

    test('clears limit error when user types in limit field', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(
        screen.getByText('Limit must be greater than 0')
      ).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Limit'));
      await user.type(screen.getByLabelText('Limit'), '1');
      expect(
        screen.queryByText('Limit must be greater than 0')
      ).not.toBeInTheDocument();
    });

    test('clears start date error when user selects a start date', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(
        screen.getByText('Start date is required')
      ).toBeInTheDocument();

      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');
      expect(
        screen.queryByText('Start date is required')
      ).not.toBeInTheDocument();
    });

    test('clears end date error when user selects an end date', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByText('End date is required')).toBeInTheDocument();

      await user.type(screen.getByLabelText('End Date'), '2024-06-30');
      expect(
        screen.queryByText('End date is required')
      ).not.toBeInTheDocument();
    });
  });

  describe('next id assignment', () => {
    test('assigns next id when no budgetFormData is provided', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BudgetForm {...defaultProps} onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText('Name'), 'New Budget');
      await user.clear(screen.getByLabelText('Limit'));
      await user.type(screen.getByLabelText('Limit'), '100');
      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');
      await user.type(screen.getByLabelText('End Date'), '2024-06-30');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2 })
      );
    });

    test('assigns id 1 when budgets array is empty', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <BudgetForm {...defaultProps} budgets={[]} onSubmit={onSubmit} />
      );

      await user.type(screen.getByLabelText('Name'), 'First Budget');
      await user.clear(screen.getByLabelText('Limit'));
      await user.type(screen.getByLabelText('Limit'), '100');
      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');
      await user.type(screen.getByLabelText('End Date'), '2024-06-30');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 })
      );
    });
  });

  describe('end date min constraint', () => {
    test('sets min attribute on end date based on start date', async () => {
      const user = userEvent.setup();
      render(<BudgetForm {...defaultProps} />);

      await user.type(screen.getByLabelText('Start Date'), '2024-06-01');

      expect(screen.getByLabelText('End Date')).toHaveAttribute(
        'min',
        '2024-06-01'
      );
    });

    test('does not set min on end date when start date is empty', () => {
      render(<BudgetForm {...defaultProps} />);

      expect(
        screen.getByLabelText('End Date')
      ).not.toHaveAttribute('min');
    });
  });
});