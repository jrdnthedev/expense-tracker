import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Select from './select';


interface TestOption {
  id: number;
  value: string;
  label: string;
}

const testOptions: TestOption[] = [
  { id: 1, value: 'option1', label: 'Option 1' },
  { id: 2, value: 'option2', label: 'Option 2' },
  { id: 3, value: 'option3', label: 'Option 3' },
];


const getOptionValue = (option: TestOption) => option.value;
const getOptionLabel = (option: TestOption) => option.label;
const getOptionId = (option: TestOption) => option.id;

describe('Select', () => {
  describe('Rendering', () => {
    test('renders select with all options', () => {
      render(
        <Select<TestOption>
          id="test-select"
          name="test"
          options={testOptions}
          value="option1"
          onChange={() => {}}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          getOptionId={getOptionId}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('option1');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('Option 1');
      expect(options[1]).toHaveTextContent('Option 2');
      expect(options[2]).toHaveTextContent('Option 3');
    });
  });

  describe('User Interactions', () => {
    test('calls onChange with correct values when option is selected', () => {
      const handleChange = vi.fn();
      
      render(
        <Select<TestOption>
          id="test-select"
          name="test"
          options={testOptions}
          value="option1"
          onChange={handleChange}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          getOptionId={getOptionId}
        />
      );

      const select = screen.getByRole('combobox');
      
      // Simulate selecting the second option
      fireEvent.change(select, { target: { value: 'option2' } });
      
      // Check if onChange was called with correct value and dataId
      expect(handleChange).toHaveBeenCalledWith('option2', 2);
    });

    test('handles empty options array', () => {
      render(
        <Select<TestOption>
          id="test-select"
          name="test"
          options={[]}
          value=""
          onChange={() => {}}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          getOptionId={getOptionId}
        />
      );

      const options = screen.queryAllByRole('option');
      expect(options).toHaveLength(0);
    });
  });
});