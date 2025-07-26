import { useState } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import Button from '../../ui/button/button';
import DatePicker from '../../ui/date-picker/date-picker';
import { useAppState } from '../../../context/app-state-context';
import Input from '../../ui/input/input';

export default function ExpenseForm() {
  const { defaultCategory, categories, currency } = useAppState();
  const [selectedCategory, setSelectedCategory] =
    useState<number>(defaultCategory);
  const [date, setDate] = useState<string>('2024-12-17');
  const [time, setTime] = useState<string>('14:30');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                selected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
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
              defaultValue={date}
              onChange={(date: string) => setDate(date)}
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
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-4 mt-6">
          <Button
            type="submit"
            onClick={() =>
              console.log(
                'Expense saved' +
                  JSON.stringify({
                    amount,
                    description,
                    selectedCategory,
                    date,
                    time,
                  })
              )
            }
            primary
          >
            Save Expense
          </Button>
          <Button
            onClick={() => {
              console.log('Expense entry cancelled');
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
