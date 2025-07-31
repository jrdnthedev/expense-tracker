import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Input from './input';

describe('Input', () => {
  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      render(<Input id="test-input" value="Test" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Test');
    });

    test('renders input with correct attributes', () => {
      render(
        <Input
          required={false}
          id="input-id"
          type="text"
          value="Test"
          placeholder="Enter text"
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('id', 'input-id');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      expect(input).toHaveValue('Test');
    });
  });

  describe('User Interactions', () => {
    test('calls onChange prop when input value changes', () => {
      const handleChange = vi.fn();
      render(<Input id="test-input" value="Test" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New Value' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
