import { describe, expect, test } from 'vitest';
import DatePicker from './date-picker';
import { render, screen } from '@testing-library/react';

describe('DatePicker', () => {
  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      render(
        <DatePicker
          id="test-date-picker"
          defaultValue="2023-10-01"
          min="2022-10-01"
          onChange={() => {}}
        />
      );
      const datePicker = screen.getByRole('textbox');
      expect(datePicker).toBeInTheDocument();
      expect(datePicker).toHaveValue('2023-10-01');
      expect(datePicker).toHaveAttribute('min', '2022-10-01');
    });
    test('renders date input with correct attributes', () => {
      render(<DatePicker id="date-picker" />);

      const dateInput = screen.getByRole('textbox');
      expect(dateInput).toHaveAttribute('type', 'date');
      expect(dateInput).toHaveAttribute('id', 'date-picker');
    });
  });
});
