import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, test, expect, beforeEach, describe } from 'vitest';
import CategoryForm, { type CategoryFormData } from './category-form';
import type { Category } from '../../../types/category';

// Mock the useNextId hook
vi.mock('../../../hooks/nextId/next-id', () => ({
  useNextId: vi.fn(() => 1),
}));

// Mock UI components
vi.mock('../../ui/input/input', () => ({
  default: ({ id, name, value, onChange, placeholder, type }: { id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; }) => (
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      data-testid={`input-${name}`}
    />
  ),
}));

vi.mock('../../ui/button/button', () => ({
  default: ({ children, onClick, type, variant }: { children: React.ReactNode; onClick: () => void; type?: 'button' | 'submit'; variant?: string; }) => (
    <button onClick={onClick} type={type} data-testid={`button-${variant}`}>
      {children}
    </button>
  ),
}));

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
];

describe('CategoryForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with default values', () => {
    render(
      <CategoryForm categories={mockCategories} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Icon')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save Changes' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-icon')).toHaveValue('➕');
  });

  test('submits form with valid data', async () => {
    render(
      <CategoryForm categories={mockCategories} onSubmit={mockOnSubmit} />
    );

    const nameInput = screen.getByTestId('input-name');
    const iconInput = screen.getByTestId('input-icon');
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.change(iconInput, { target: { value: '🎯' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Category',
        icon: '🎯',
        id: 1,
      });
    });
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <CategoryForm categories={mockCategories} onSubmit={mockOnSubmit} />
    );

    // Clear the icon field to make it empty
    const iconInput = screen.getByTestId('input-icon');
    fireEvent.change(iconInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Icon is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('clears error when user types after validation error', async () => {
    render(
      <CategoryForm categories={mockCategories} onSubmit={mockOnSubmit} />
    );

    const nameInput = screen.getByTestId('input-name');
    const submitButton = screen.getByRole('button', { name: 'Save Changes' });

    // Trigger validation error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Type in field to clear error
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  test('populates form with existing category data', () => {
    const existingData: CategoryFormData = {
      id: 5,
      name: 'Existing Category',
      icon: '🏠',
    };

    render(
      <CategoryForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        categoryFormData={existingData}
      />
    );

    expect(screen.getByTestId('input-name')).toHaveValue('Existing Category');
    expect(screen.getByTestId('input-icon')).toHaveValue('🏠');
  });

  test('shows delete button when editing existing category', () => {
    const existingData: CategoryFormData = {
      id: 5,
      name: 'Existing Category',
      icon: '🏠',
    };

    render(
      <CategoryForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onDelete={mockOnDelete}
        categoryFormData={existingData}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Delete Category' })
    ).toBeInTheDocument();
  });

  test('calls onDelete when delete button is clicked', () => {
    const existingData: CategoryFormData = {
      id: 5,
      name: 'Existing Category',
      icon: '🏠',
    };

    render(
      <CategoryForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onDelete={mockOnDelete}
        categoryFormData={existingData}
      />
    );

    const deleteButton = screen.getByRole('button', {
      name: 'Delete Category',
    });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('does not show delete button when no onDelete prop provided', () => {
    const existingData: CategoryFormData = {
      id: 5,
      name: 'Existing Category',
      icon: '🏠',
    };

    render(
      <CategoryForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        categoryFormData={existingData}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Delete Category' })
    ).not.toBeInTheDocument();
  });

  test('updates form state when categoryFormData changes', () => {
    const initialData: CategoryFormData = {
      id: 5,
      name: 'Initial',
      icon: '🏠',
    };

    const { rerender } = render(
      <CategoryForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        categoryFormData={initialData}
      />
    );

    expect(screen.getByTestId('input-name')).toHaveValue('Initial');

    const updatedData: CategoryFormData = {
      id: 5,
      name: 'Updated',
      icon: '🎯',
    };

    rerender(
      <CategoryForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        categoryFormData={updatedData}
      />
    );

    expect(screen.getByTestId('input-name')).toHaveValue('Updated');
    expect(screen.getByTestId('input-icon')).toHaveValue('🎯');
  });
});
