import { useState } from 'react';
import DatePicker from '../../ui/date-picker/date-picker';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';
import Button from '../../ui/button/button';
import { useNextId } from '../../../hooks/nextId/next-id';
import type { Budget } from '../../../types/budget';

export type BudgetFormData = {
  id?: number;
  limit: number;
  name: string;
  categoryIds: number[];
  startDate: string;
  endDate: string;
};

interface BudgetFormProps {
  onCancel: () => void;
  onSubmit: (data: BudgetFormData) => void;
  budgetFormData?: BudgetFormData;
  currency: Currency;
  budgets: Budget[];
}

export default function BudgetForm({
  budgetFormData,
  currency,
  budgets,
  onSubmit,
}: BudgetFormProps) {
  const nextBudgetId = useNextId<Budget>(budgets);
  const [formState, setFormState] = useState<BudgetFormData>({
    id: budgetFormData?.id || nextBudgetId,
    name: budgetFormData?.name || '',
    limit: budgetFormData?.limit || 0,
    categoryIds: budgetFormData?.categoryIds || [],
    startDate: budgetFormData?.startDate || '',
    endDate: budgetFormData?.endDate || '',
  });
  const [errorState, setErrorState] = useState({
    limit: '',
    name: '',
    startDate: '',
    endDate: '',
  });

  const validateForm = (): boolean => {
    const errors = {
      limit: '',
      name: '',
      startDate: '',
      endDate: '',
    };

    if (!formState.limit || formState.limit <= 0) {
      errors.limit = 'Limit must be greater than 0';
    }

    if (!formState.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formState.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formState.endDate) {
      errors.endDate = 'End date is required';
    }

    setErrorState(errors);
    return !Object.values(errors).some((error) => error !== '');
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (errorState[name as keyof typeof errorState]) {
      setErrorState((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setFormState((prevState: BudgetFormData) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDatePickerChange = (
    field: keyof BudgetFormData,
    value: string | number
  ) => {
    if (errorState.startDate || errorState.endDate) {
      setErrorState((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
    setFormState((prevState: BudgetFormData) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formState);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="name">Name</label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Enter budget name"
          />
          {errorState.name && (
            <span className="text-red-500 text-sm mt-1">{errorState.name}</span>
          )}
        </div>
        <div>
          <label htmlFor="limit">Limit</label>
          <Input
            type="number"
            id="limit"
            name="limit"
            value={formState.limit}
            onChange={handleChange}
            placeholder={`${currency.symbol}0.00`}
          />
          {errorState.limit && (
            <span className="text-red-500 text-sm mt-1">
              {errorState.limit}
            </span>
          )}
        </div>
        <div className="flex max-sm:flex-col gap-4">
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="startDate"
            >
              Start Date
            </label>
            <DatePicker
              id="startDate"
              name="startDate"
              value={formState.startDate}
              onChange={(date) => handleDatePickerChange('startDate', date)}
            />
            {errorState.startDate && (
              <span className="text-red-500 text-sm mt-1">
                {errorState.startDate}
              </span>
            )}
          </div>
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="endDate"
            >
              End Date
            </label>
            <DatePicker
              id="endDate"
              name="endDate"
              value={formState.endDate}
              onChange={(date) => handleDatePickerChange('endDate', date)}
              min={formState.startDate || undefined}
            />
            {errorState.endDate && (
              <span className="text-red-500 text-sm mt-1">
                {errorState.endDate}
              </span>
            )}
          </div>
        </div>
        <div>
          <Button type="submit" onClick={() => void 0} variant="primary">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
