import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import DatePicker from '../../ui/date-picker/date-picker';
import Input from '../../ui/input/input';

type BudgetFormData = {
  id?: number;
  limit: number;
  name: string;
  categoryIds: number[];
  startDate: string;
  endDate: string;
};

interface BudgetFormProps {
  initialData: BudgetFormData;
}

export interface BudgetFormRef {
  getFormData: () => BudgetFormData;
  isValid: () => boolean;
  reset: (newData?: BudgetFormData) => void;
}

const BudgetForm = forwardRef<BudgetFormRef, BudgetFormProps>(
  ({ initialData }, ref) => {
    const [formState, setFormState] = useState<BudgetFormData>(initialData);

    const isFormValid =
      formState.name.trim() !== '' &&
      formState.limit > 0 &&
      formState.startDate !== '' &&
      formState.endDate !== '' &&
      new Date(formState.endDate) > new Date(formState.startDate);

    useEffect(() => {
      if (initialData.id !== formState.id) {
        setFormState(initialData);
      }
    }, [initialData.id]);

    useImperativeHandle(ref, () => ({
      getFormData: () => formState,
      isValid: () => isFormValid,
      reset: (newData?: BudgetFormData) => setFormState(newData || initialData),
    }));

    const updateField = (field: keyof BudgetFormData, value: string | number) => {
      setFormState(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="name">Name</label>
          <Input
            type="text"
            id="name"
            value={formState.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Enter budget name"
          />
        </div>
        <div>
          <label htmlFor="limit">Limit</label>
          <Input
            type="number"
            id="limit"
            value={formState.limit}
            onChange={(e) => updateField('limit', Number(e.target.value))}
            placeholder="Enter budget limit"
          />
        </div>
        <div className="flex max-sm:flex-col gap-4">
          <div className="w-full flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
              Start Date
            </label>
            <DatePicker
              id="startDate"
              value={formState.startDate}
              onChange={(date) => updateField('startDate', date)}
            />
          </div>
          <div className="w-full flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
              End Date
            </label>
            <DatePicker
              id="endDate"
              value={formState.endDate}
              onChange={(date) => updateField('endDate', date)}
              min={formState.startDate || undefined}
            />
          </div>
        </div>
      </div>
    );
  }
);

BudgetForm.displayName = 'BudgetForm';

export default BudgetForm;