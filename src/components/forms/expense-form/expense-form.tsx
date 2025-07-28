import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import DatePicker from '../../ui/date-picker/date-picker';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';

export default function ExpenseForm({
  categories,
  formState,
  currency,
  onFieldChange,
}: ExpenseFormProps) {
  return (
    <>
      <div className="text-lg font-semibold text-gray-900 mb-2">
        ➕ Add Expense Form
      </div>
      <div className="text-sm text-gray-500 mb-6">
        Quick expense entry form with smart defaults and category selection.
        Optimized for fast data entry with minimal friction.
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Add New Expense
        </h3>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="amount"
          >
            Amount
          </label>
          <Input
            value={formState.amount}
            onChange={(e) => onFieldChange?.('amount', e.target.value)}
            placeholder={`${currency.symbol}0.00`}
            id="amount"
            type="number"
          />
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
            onChange={(e) => onFieldChange?.('description', e.target.value)}
            placeholder="What did you spend on?"
            id="description"
            type="text"
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
                  onFieldChange?.('categoryId', category.id);
                  onFieldChange?.('category', category.name);
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-4 mb-4">
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="date"
            >
              Date
            </label>
            <DatePicker
              id="date"
              defaultValue={formState.date}
              onChange={(date: string) => onFieldChange?.('date', date)}
            />
          </div>
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="time"
            >
              Time
            </label>
            <Input
              type="time"
              id="time"
              value={formState.time}
              onChange={(e) => onFieldChange?.('time', e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface ExpenseFormProps {
  categories: Category[];
  formState: {
    amount: string;
    description: string;
    categoryId: number;
    date: string;
    time: string;
  };
  onFieldChange?: (field: string, value: string | number) => void;
  currency: Currency;
}
