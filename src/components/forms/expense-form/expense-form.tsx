import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';
import Select from '../../ui/select/select';
import type { Budget } from '../../../types/budget';

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
}

export interface ExpenseFormRef {
  getFormData: () => ExpenseFormData;
  isValid: () => boolean;
  reset: (newData?: ExpenseFormData) => void;
}

const ExpenseForm = forwardRef<ExpenseFormRef, ExpenseFormProps>(
  ({ initialData, categories, budgets, currency }, ref) => {
    const [formState, setFormState] = useState<ExpenseFormData>(initialData);

    // Update form state when initialData ID changes
    useEffect(() => {
      if (initialData.id !== formState.id) {
        setFormState(initialData);
      }
    }, [initialData.id]);

    // Auto-select first budget if none selected
    useEffect(() => {
      if (budgets.length > 0 && !formState.budgetId) {
        const firstBudget = budgets[0];
        setFormState((prev) => ({
          ...prev,
          budgetId: firstBudget.id,
          budget: firstBudget.name,
        }));
      }
    }, [budgets, formState.budgetId]);

    const isFormValid =
      formState.amount > 0 &&
      formState.description.trim() !== '' &&
      formState.categoryId > 0 &&
      formState.budgetId > 0;

    const updateField = (
      field: keyof ExpenseFormData,
      value: string | number
    ) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

    useImperativeHandle(ref, () => ({
      getFormData: () => formState,
      isValid: () => isFormValid,
      reset: (newData?: ExpenseFormData) =>
        setFormState(newData || initialData),
    }));

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
              onChange={(e) => updateField('amount', Number(e.target.value))}
              placeholder={`${currency.symbol}0.00`}
              id="amount"
              type="number"
            />
          </div>
          <div className="w-1/2 flex flex-col">
            <label
              htmlFor="budget"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Budgets
            </label>
            <Select
              id="budget"
              name="Select Budget"
              options={budgets}
              onChange={(_value: string, dataId: number) => {
                const budget = budgets.find((bud: Budget) => bud.id === dataId);
                if (budget) {
                  updateField('budget', budget.name);
                  updateField('budgetId', budget.id);
                }
              }}
              value={
                budgets.find((b) => b.id === formState.budgetId)?.name || ''
              }
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
            onChange={(e) => updateField('description', e.target.value)}
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
                  updateField('categoryId', category.id);
                  updateField('category', category.name);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ExpenseForm.displayName = 'ExpenseForm';

export default ExpenseForm;
