import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import DatePicker from '../../ui/date-picker/date-picker';
import Input from '../../ui/input/input';

// Form data type
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
  onValidationChange?: (isValid: boolean) => void;
}

// Ref interface for parent to access form methods
export interface BudgetFormRef {
  getFormData: () => BudgetFormData;
  isValid: () => boolean;
  reset: (newData?: BudgetFormData) => void;
}

const BudgetForm = forwardRef<BudgetFormRef, BudgetFormProps>(
  ({ initialData, onValidationChange }, ref) => {
    // Form manages its own state completely
    const [formState, setFormState] = useState<BudgetFormData>(initialData);

    // Validation logic
    const isFormValid =
      formState.name.trim() !== '' &&
      formState.limit > 0 &&
      formState.startDate !== '' &&
      formState.endDate !== '' &&
      new Date(formState.endDate) > new Date(formState.startDate);

    // Notify parent of validation changes only
    useEffect(() => {
      onValidationChange?.(isFormValid);
    }, [isFormValid, onValidationChange]);

    // Field update handler - completely internal
    const handleFieldChange = useCallback(
      (field: string, fieldValue: string | number) => {
        setFormState((prev) => ({ ...prev, [field]: fieldValue }));
      },
      []
    );

    // Reset form data (useful for clearing after save)
    const resetForm = useCallback(
      (newData?: BudgetFormData) => {
        setFormState(newData || initialData);
      },
      [initialData]
    );

    // Expose methods to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        getFormData: () => formState,
        isValid: () => isFormValid,
        reset: resetForm,
      }),
      [formState, isFormValid, resetForm]
    );

    // Only update internal state if initialData changes significantly
    // (like when switching between add/edit modes)
    useEffect(() => {
      const hasSignificantChange =
        initialData.id !== formState.id ||
        (initialData.id && initialData.name !== formState.name); // Only for edit mode

      if (hasSignificantChange) {
        setFormState(initialData);
      }
    }, [initialData.id, initialData.name]); // Only depend on key identifying fields

    return (
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="name">Name</label>
          <Input
            type="text"
            id="name"
            value={formState.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange('name', e.target.value)
            }
            placeholder="Enter budget name"
          />
        </div>
        <div>
          <label htmlFor="limit">Limit</label>
          <Input
            type="number"
            id="limit"
            value={formState.limit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange('limit', Number(e.target.value))
            }
            placeholder="Enter budget limit"
          />
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
              value={formState.startDate}
              onChange={(date: string) => handleFieldChange('startDate', date)}
            />
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
              value={formState.endDate}
              onChange={(date: string) => handleFieldChange('endDate', date)}
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
