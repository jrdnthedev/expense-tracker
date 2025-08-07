import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CategoryForm from './category-form';

describe('CategoryForm', () => {
  const mockOnFieldChange = vi.fn();
  const defaultProps = {
    formState: {
      name: 'Test Category',
      icon: 'test-icon'
    },
    onFieldChange: mockOnFieldChange
  };

  beforeEach(() => {
    mockOnFieldChange.mockClear();
  });

  test('renders form with correct input values', () => {
    render(<CategoryForm {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Test Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-icon')).toBeInTheDocument();
  });

  test('calls onFieldChange when name input changes', () => {
    render(<CategoryForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('Category Name');
    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    
    expect(mockOnFieldChange).toHaveBeenCalledWith('name', 'New Category');
  });

  test('calls onFieldChange when icon input changes', () => {
    render(<CategoryForm {...defaultProps} />);
    
    const iconInput = screen.getByLabelText('Category Icon');
    fireEvent.change(iconInput, { target: { value: 'new-icon' } });
    
    expect(mockOnFieldChange).toHaveBeenCalledWith('icon', 'new-icon');
  });

  test('renders inputs with correct attributes', () => {
    render(<CategoryForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('Category Name');
    const iconInput = screen.getByLabelText('Category Icon');
    
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('placeholder', 'Category Name');
    expect(nameInput).toBeRequired();
    
    expect(iconInput).toHaveAttribute('type', 'text');
    expect(iconInput).toHaveAttribute('placeholder', 'Category Icon');
    expect(iconInput).toBeRequired();
  });
});