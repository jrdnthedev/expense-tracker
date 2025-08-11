import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';
import Select from '../../ui/select/select';
import type { Budget } from '../../../types/budget';

// Form data type
type ExpenseFormData = {
  id?: number;
  amount: number;
  description: string;
  categoryId: number;
  category: string;
  budgetId: number;
  budget: string;
  createdAt: string;
};

interface ExpenseFormProps {
  initialData: ExpenseFormData;
  categories: Category[];
  budgets: Budget[];
  currency: Currency;
  onValidationChange?: (isValid: boolean) => void;
}

// Ref interface for parent to access form methods
export interface ExpenseFormRef {
  getFormData: () => ExpenseFormData;
  isValid: () => boolean;
  reset: (newData?: ExpenseFormData) => void;
}

const ExpenseForm = forwardRef<ExpenseFormRef, ExpenseFormProps>(({
  initialData,
  categories,
  budgets,
  currency,
  onValidationChange,
}, ref) => {
  // Form manages its own state completely
  const [formState, setFormState] = useState<ExpenseFormData>(initialData);
  
  // Keep a ref to track the previous initialData to detect real changes
  const prevInitialDataRef = useRef<ExpenseFormData>(initialData);

  // Update form state when initialData changes (for edit mode)
  useEffect(() => {
    const prev = prevInitialDataRef.current;
    const current = initialData;
    
    // Only update if this is a completely new expense (different ID)
    // or if we're switching from one expense to another
    const isNewExpense = prev.id !== current.id;
    
    if (isNewExpense) {
      setFormState(initialData);
      prevInitialDataRef.current = initialData;
    }
  }, [initialData]);

  // Auto-select first budget if none selected
  useEffect(() => {
    if (budgets.length > 0 && !formState.budgetId) {
      const firstBudget = budgets[0];
      setFormState(prev => ({
        ...prev,
        budgetId: firstBudget.id,
        budget: firstBudget.name,
      }));
    }
  }, [budgets, formState.budgetId]);

  // Validation logic
  const isFormValid = formState.amount > 0 && 
                     formState.description.trim() !== '' && 
                     formState.categoryId > 0 &&
                     formState.budgetId > 0;

  // Notify parent of validation changes only
  useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  // Field update handler - completely internal
  const handleFieldChange = useCallback((field: string, fieldValue: string | number) => {
    setFormState(prev => ({ ...prev, [field]: fieldValue }));
  }, []);

  // Reset form data
  const resetForm = useCallback((newData?: ExpenseFormData) => {
    const dataToUse = newData || initialData;
    setFormState(dataToUse);
    prevInitialDataRef.current = dataToUse;
  }, [initialData]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => formState,
    isValid: () => isFormValid,
    reset: resetForm,
  }), [formState, isFormValid, resetForm]);

  return (
    <div className="mb-8">
      <div className="mb-4 flex gap-4">
        <div className="w-1/2 flex flex-col">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="amount"
          >
            Amount
          </label>
          <Input
            value={formState.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange('amount', Number(e.target.value))
            }
            placeholder={`${currency.symbol}0.00`}
            id="amount"
            type="number"
          />
        </div>
        <div className="w-1/2 flex flex-col">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            Budgets
          </label>
          <Select
            id="budget"
            name="Select Budget"
            options={budgets}
            onChange={(_value: string, dataId: number) => {
              const budget = budgets.find((bud: Budget) => bud.id === dataId);
              if (budget) {
                handleFieldChange('budget', budget.name);
                handleFieldChange('budgetId', budget.id);
              }
            }}
            value={budgets.find(b => b.id === formState.budgetId)?.name || ''}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.name}
            getOptionId={(option) => option.id}
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="description"
        >
          Description
        </label>
        <Input
          value={formState.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFieldChange('description', e.target.value)
          }
          placeholder="What did you spend on?"
          id="description"
          type="text"
          required={true}
        />
      </div>

      <div className="mb-4">
        <label
          id="category-label"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
          aria-labelledby="category-label"
        >
          {categories.map((category: Category) => (
            <CardButton
              key={category.id}
              label={category.name}
              icon={category.icon}
              selected={formState.categoryId === category.id}
              onClick={() => {
                handleFieldChange('categoryId', category.id);
                handleFieldChange('category', category.name);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

ExpenseForm.displayName = 'ExpenseForm';

export default ExpenseForm;