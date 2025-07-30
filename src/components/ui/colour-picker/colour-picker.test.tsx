import { fireEvent, render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ColourPicker from './colour-picker';

describe('ColourPicker', () => {
  describe('Rendering', () => {
    test('renders color input with correct attributes', () => {
      render(<ColourPicker selectedColor="#ff0000" onChange={() => {}} />);

      const colorInput = screen.getByRole('textbox');
      expect(colorInput).toHaveAttribute('type', 'color');
      expect(colorInput).toHaveAttribute('id', 'color-picker');
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when color is selected', () => {
      const handleChange = vi.fn();
      render(<ColourPicker selectedColor="#ff0000" onChange={handleChange} />);

      const colorInput = screen.getByRole('textbox');
      fireEvent.change(colorInput, { target: { value: '#00ff00' } });

      expect(handleChange).toHaveBeenCalledWith('#00ff00');
    });
  });

  describe('Accessibility', () => {
    test('can be associated with a label', () => {
      render(
        <div>
          <label htmlFor="color-picker">Choose a color:</label>
          <ColourPicker selectedColor="#ff0000" onChange={() => {}} />
        </div>
      );

      const colorInput = screen.getByRole('textbox');
      expect(colorInput).toHaveAttribute('id', 'color-picker');
    });
  });
});
