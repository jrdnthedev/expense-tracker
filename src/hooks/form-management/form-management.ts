import { useState } from 'react';

interface FormManagementProps<T> {
  initialFormState: T;
  onSubmit: (values: T) => void;
  initialErrorState: Partial<Record<keyof T, string>>;
  validationRules?: {
    [K in keyof T]?: (value: T[K]) => string;
  };
}

export default function useFormManagement<T>({
  initialFormState,
  onSubmit,
  initialErrorState,
  validationRules = {},
}: FormManagementProps<T>) {
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
    handleChange,
    validateForm,
    handleSubmit,
    setFormState,
    setErrorState,
  };
}
