import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { useRef } from 'react';
import BudgetForm from './budget-form';
import type { BudgetFormRef } from './budget-form';

// Mock the UI components
vi.mock('../../ui/date-picker/date-picker', () => ({
  default: ({ id, value, onChange, min }: {
    id: string;
    type: string;
    min: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid={id}
      type="date"
      value={value}
      onChange={onChange}
      min={min}
    />
  ),
}));

vi.mock('../../ui/input/input', () => ({
  default: ({ id, type, value, onChange, placeholder }: {
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

const defaultInitialData = {
  id: 1,
  limit: 1000,
  name: 'Test Budget',
  categoryIds: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
};

test('renders form with initial data', () => {
  render(<BudgetForm initialData={defaultInitialData} />);
  
  expect(screen.getByDisplayValue('Test Budget')).toBeInTheDocument();
  expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
});

test('updates form fields when user types', () => {
  render(<BudgetForm initialData={defaultInitialData} />);
  
  const nameInput = screen.getByTestId('name');
  fireEvent.change(nameInput, { target: { value: 'Updated Budget' } });
  
  expect(screen.getByDisplayValue('Updated Budget')).toBeInTheDocument();
});

test('ref methods work correctly', () => {
  const TestComponent = () => {
    const ref = useRef<BudgetFormRef>(null);
    
    return (
      <div>
        <BudgetForm ref={ref} initialData={defaultInitialData} />
        <button onClick={() => {
          const data = ref.current?.getFormData();
          const isValid = ref.current?.isValid();
          // Create elements to test the values
          const dataDiv = document.createElement('div');
          dataDiv.setAttribute('data-testid', 'form-data');
          dataDiv.textContent = JSON.stringify(data);
          document.body.appendChild(dataDiv);
          
          const validDiv = document.createElement('div');
          validDiv.setAttribute('data-testid', 'is-valid');
          validDiv.textContent = String(isValid);
          document.body.appendChild(validDiv);
        }}>
          Get Data
        </button>
      </div>
    );
  };
  
  render(<TestComponent />);
  
  fireEvent.click(screen.getByText('Get Data'));
  
  expect(screen.getByTestId('form-data')).toHaveTextContent('Test Budget');
  expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
});



test('reset method works correctly', () => {
  const TestComponent = () => {
    const ref = useRef<BudgetFormRef>(null);
    
    return (
      <div>
        <BudgetForm ref={ref} initialData={defaultInitialData} />
        <button onClick={() => ref.current?.reset()}>
          Reset
        </button>
      </div>
    );
  };
  
  render(<TestComponent />);
  
  // Change a field first
  const nameInput = screen.getByTestId('name');
  fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
  expect(screen.getByDisplayValue('Changed Name')).toBeInTheDocument();
  
  // Reset the form
  fireEvent.click(screen.getByText('Reset'));
  expect(screen.getByDisplayValue('Test Budget')).toBeInTheDocument();
});