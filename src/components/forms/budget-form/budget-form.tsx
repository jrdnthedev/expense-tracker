import DatePicker from '../../ui/date-picker/date-picker';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';
import Button from '../../ui/button/button';
import { useNextId } from '../../../hooks/nextId/next-id';
import type { Budget } from '../../../types/budget';
import useFormManagement from '../../../hooks/form-management/form-management';

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

  const validationRules = {
    limit: (value: number) =>
      !value || value <= 0 ? 'Limit must be greater than 0' : '',
    name: (value: string) => (!value.trim() ? 'Name is required' : ''),
    startDate: (value: string) => (!value ? 'Start date is required' : ''),
    endDate: (value: string) => (!value ? 'End date is required' : ''),
  };

  const {
    formState,
    errorState,
    handleChange,
    handleSubmit,
    setFormState,
    setErrorState,
  } = useFormManagement<BudgetFormData>({
    initialFormState: {
      id: budgetFormData?.id || nextBudgetId,
      name: budgetFormData?.name || '',
      limit: budgetFormData?.limit || 0,
      categoryIds: budgetFormData?.categoryIds || [],
      startDate: budgetFormData?.startDate || '',
      endDate: budgetFormData?.endDate || '',
    },
    onSubmit,
    initialErrorState: {
      limit: '',
      name: '',
      startDate: '',
      endDate: '',
    },
    validationRules,
  });

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
