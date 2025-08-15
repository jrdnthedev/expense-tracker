import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFormManagement from './form-management';

interface TestFormData {
  name: string;
  email: string;
  age: string;
}

interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
}

describe('useFormManagement', () => {
  const mockOnSubmit = vi.fn();
  
  const initialFormState: TestFormData = {
    name: '',
    email: '',
    age: '',
  };

  const initialErrorState: Partial<Record<keyof TestFormData, string>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with provided initial state', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    expect(result.current.formState).toEqual(initialFormState);
    expect(result.current.errorState).toEqual(initialErrorState);
  });

  test('should initialize with custom initial state and errors', () => {
    const customInitialState: TestFormData = {
      name: 'John',
      email: 'john@example.com',
      age: '25',
    };

    const customErrorState: Partial<Record<keyof TestFormData, string>> = {
      email: 'Invalid email',
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState: customInitialState,
        onSubmit: mockOnSubmit,
        initialErrorState: customErrorState,
      })
    );

    expect(result.current.formState).toEqual(customInitialState);
    expect(result.current.errorState).toEqual(customErrorState);
  });

  test('should handle input change correctly', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    const mockEvent = {
      target: { name: 'name', value: 'John Doe' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.formState.name).toBe('John Doe');
    expect(result.current.formState.email).toBe('');
    expect(result.current.formState.age).toBe('');
  });

  test('should clear error when field value changes', () => {
    const errorState: Partial<Record<keyof TestFormData, string>> = {
      name: 'Name is required',
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState: errorState,
      })
    );

    expect(result.current.errorState.name).toBe('Name is required');

    const mockEvent = {
      target: { name: 'name', value: 'John' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.errorState.name).toBe('');
    expect(result.current.formState.name).toBe('John');
  });

  test('should validate form with validation rules', () => {
    const validationRules = {
      name: (value: string) => (value.length < 2 ? 'Name must be at least 2 characters' : ''),
      email: (value: string) => (!value.includes('@') ? 'Invalid email format' : ''),
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
        validationRules,
      })
    );

    let isValid = false;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.errorState.name).toBe('Name must be at least 2 characters');
    expect(result.current.errorState.email).toBe('Invalid email format');
  });

  test('should return true when validation passes', () => {
    const validationRules = {
      name: (value: string) => (value.length < 2 ? 'Name must be at least 2 characters' : ''),
      email: (value: string) => (!value.includes('@') ? 'Invalid email format' : ''),
    };

    const validFormState: TestFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: '25',
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState: validFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
        validationRules,
      })
    );

    let isValid = false;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.errorState.name).toBe(undefined);
    expect(result.current.errorState.email).toBe(undefined);
  });

  test('should handle form submission with valid data', () => {
    const validFormState: TestFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: '25',
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState: validFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith(validFormState);
  });

  test('should not submit form with invalid data', () => {
    const validationRules = {
      name: (value: string) => (value.length < 2 ? 'Name is required' : ''),
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
        validationRules,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should update form state using setFormState', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    const newFormState: TestFormData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      age: '30',
    };

    act(() => {
      result.current.setFormState(newFormState);
    });

    expect(result.current.formState).toEqual(newFormState);
  });

  test('should update error state using setErrorState', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    const newErrorState: Partial<Record<keyof TestFormData, string>> = {
      name: 'Name error',
      email: 'Email error',
    };

    act(() => {
      result.current.setErrorState(newErrorState);
    });

    expect(result.current.errorState).toEqual(newErrorState);
  });

  test('should work with expense form data type', () => {
    const expenseInitialState: ExpenseFormData = {
      amount: '',
      description: '',
      category: '',
    };

    const expenseValidationRules = {
      amount: (value: string) => (parseFloat(value) <= 0 ? 'Amount must be greater than 0' : ''),
      description: (value: string) => (value.trim().length === 0 ? 'Description is required' : ''),
    };

    const mockExpenseSubmit = vi.fn();

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState: expenseInitialState,
        onSubmit: mockExpenseSubmit,
        initialErrorState: {},
        validationRules: expenseValidationRules,
      })
    );

    expect(result.current.formState).toEqual(expenseInitialState);

    const mockEvent = {
      target: { name: 'amount', value: '100.50' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.formState.amount).toBe('100.50');
  });

  test('should handle validation rules with complex logic', () => {
    const complexValidationRules = {
      email: (value: string) => {
        if (!value) return 'Email is required';
        if (!value.includes('@')) return 'Invalid email format';
        if (value.length < 5) return 'Email too short';
        return '';
      },
      age: (value: string) => {
        const numAge = parseInt(value);
        if (isNaN(numAge)) return 'Age must be a number';
        if (numAge < 18) return 'Must be 18 or older';
        if (numAge > 120) return 'Invalid age';
        return '';
      },
    };

    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState: { ...initialFormState, email: 'a@b', age: '15' },
        onSubmit: mockOnSubmit,
        initialErrorState,
        validationRules: complexValidationRules,
      })
    );

    let isValid = false;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.errorState.email).toBe('Email too short');
    expect(result.current.errorState.age).toBe('Must be 18 or older');
  });

  test('should handle multiple field changes correctly', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    const nameEvent = {
      target: { name: 'name', value: 'John' },
    } as React.ChangeEvent<HTMLInputElement>;

    const emailEvent = {
      target: { name: 'email', value: 'john@example.com' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(nameEvent);
      result.current.handleChange(emailEvent);
    });

    expect(result.current.formState.name).toBe('John');
    expect(result.current.formState.email).toBe('john@example.com');
    expect(result.current.formState.age).toBe('');
  });

  test('should handle validation without rules', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState,
      })
    );

    let isValid = false;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.errorState).toEqual({});
  });

  test('should not clear non-existent errors', () => {
    const { result } = renderHook(() =>
      useFormManagement({
        initialFormState,
        onSubmit: mockOnSubmit,
        initialErrorState: {},
      })
    );

    const mockEvent = {
      target: { name: 'name', value: 'John' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.errorState.name).toBeUndefined();
    expect(result.current.formState.name).toBe('John');
  });
});