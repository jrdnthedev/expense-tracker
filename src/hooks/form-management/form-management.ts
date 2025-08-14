import { useState } from 'react';
import { useNextId } from '../nextId/next-id';
import type { Category } from '../../types/category';
import type { Budget } from '../../types/budget';
import type { Expense } from '../../types/expense';

interface FormManagementProps<T> {
  initialFormState: T;
  onSubmit: (values: T) => void;
  initialErrorState: Partial<Record<keyof T, string>>;
  validationRules?: {
    [K in keyof T]?: (value: T[K]) => string;
  };
  type?: Expense[] | Budget[] | Category[]; // Type of the form, e.g., 'expense', 'budget', 'category'
}

export default function useFormManagement<T>({
  initialFormState,
  onSubmit,
  initialErrorState,
  type,
  validationRules = {},
}: FormManagementProps<T>) {
  const id = useNextId<Expense | Budget | Category>(
    type as (Expense | Budget | Category)[]
  );
  const [formState, setFormState] = useState<T>(initialFormState);
  const [errorState, setErrorState] =
    useState<Partial<Record<keyof T, string>>>(initialErrorState);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (errorState[name as keyof typeof errorState]) {
      setErrorState((prev: Partial<Record<keyof T, string>>) => ({
        ...prev,
        [name]: '',
      }));
    }
    setFormState((prevState: T) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    Object.keys(validationRules).forEach((key) => {
      const fieldKey = key as keyof T;
      const validator = validationRules[fieldKey];
      if (validator) {
        const errorMessage = validator(formState[fieldKey]);
        if (errorMessage) {
          errors[fieldKey] = errorMessage;
        }
      }
    });
    setErrorState(errors);
    return !Object.values(errors).some((error) => error !== '');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formState);
    }
  };

  return {
    formState,
    errorState,
    id,
    handleChange,
    validateForm,
    handleSubmit,
    setFormState,
    setErrorState,
  };
}
