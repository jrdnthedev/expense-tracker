import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';
import Select from '../../ui/select/select';
import type { Budget } from '../../../types/budget';
import type { Expense } from '../../../types/expense';
import Button from '../../ui/button/button';
import { useNextId } from '../../../hooks/nextId/next-id';
import useFormManagement from '../../../hooks/form-management/form-management';
import type { ExpenseFormData } from '../../../constants/form-data';

interface ExpenseFormProps {
  onSubmit?: (data: ExpenseFormData) => void;
  categories: Category[];
  budgets: Budget[];
  expenses?: Expense[];
  expenseFormData?: ExpenseFormData;
  currency: Currency;
  onCancel: () => void;
}

export default function ExpenseForm({
  categories,
  budgets,
  currency,
  expenseFormData,
  expenses,
  onCancel,
  onSubmit,
}: ExpenseFormProps) {
  const id = useNextId<Expense>(expenses);

  const validationRules = {
    amount: (value: number) =>
      !value || value <= 0 ? 'Amount must be greater than 0' : '',
    description: (value: string) =>
      !value.trim() ? 'Description is required' : '',
    categoryId: (value: number) => (!value ? 'Please select a category' : ''),
    budgetId: (value: number) => (!value ? 'Please select a budget' : ''),
  };
  const {
    formState,
    errorState,
    handleChange,
    handleSubmit,
    setFormState,
    setErrorState,
  } = useFormManagement<ExpenseFormData>({
    initialFormState: {
      id: expenseFormData?.id || id,
      amount: expenseFormData?.amount || 1,
      description: expenseFormData?.description || '',
      categoryId: expenseFormData?.categoryId || 0,
      category: expenseFormData?.category || '',
      budgetId: expenseFormData?.budgetId || budgets?.[0]?.id || 0,
      budget: expenseFormData?.budget || budgets?.[0]?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    onSubmit: onSubmit || (() => {}),
    initialErrorState: {
      amount: '',
      description: '',
      categoryId: '',
      budgetId: '',
    },
    validationRules,
  });
  const handleCategorySelect = (category: Category) => {
    if (errorState.categoryId) {
      setErrorState((prev) => ({
        ...prev,
        categoryId: '',
      }));
    }
    setFormState((prev: ExpenseFormData) => ({
      ...prev,
      categoryId: category.id,
      category: category.name,
    }));
  };
  const handleBudgetChange = (_value: string, dataId: number) => {
    const budget = budgets.find((budget: Budget) => budget.id === dataId);
    if (budget) {
      if (errorState.budgetId) {
        setErrorState((prev) => ({
          ...prev,
          budgetId: '',
        }));
      }
      setFormState((prev: ExpenseFormData) => ({
        ...prev,
        budget: budget.name,
        budgetId: budget.id,
      }));
    }
  };
  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit}>
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
              onChange={handleChange}
              placeholder={`${currency.symbol}0.00`}
              id="amount"
              type="number"
              name="amount"
            />
            {errorState.amount && (
              <span className="text-red-500 text-sm mt-1">
                {errorState.amount}
              </span>
            )}
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
              onChange={handleBudgetChange}
              value={
                formState?.budget ||
                budgets.find(
                  (budget: Budget) => budget.id === formState.budgetId
                )?.name ||
                ''
              }
              getOptionValue={(option: Budget) => option.name}
              getOptionLabel={(option: Budget) => option.name}
              getOptionId={(option: Budget) => option.id}
            />
            {errorState.budgetId && (
              <span className="text-red-500 text-sm mt-1">
                {errorState.budgetId}
              </span>
            )}
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
            onChange={handleChange}
            placeholder="What did you spend on?"
            id="description"
            name="description"
            type="text"
          />
          {errorState.description && (
            <span className="text-red-500 text-sm mt-1">
              {errorState.description}
            </span>
          )}
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
                onClick={() => handleCategorySelect(category)}
              />
            ))}
          </div>
          {errorState.categoryId && (
            <span className="text-red-500 text-sm mt-1">
              {errorState.categoryId}
            </span>
          )}
        </div>

        <div className="flex justify-end mt-4 gap-4">
          <Button type="submit" onClick={() => void 0} variant="primary">
            Save
          </Button>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
