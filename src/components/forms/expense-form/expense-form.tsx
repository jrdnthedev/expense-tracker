import { useState } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import Button from '../../ui/button/button';
import DatePicker from '../../ui/date-picker/date-picker';
import { useAppDispatch, useAppState } from '../../../context/app-state-context';
import Input from '../../ui/input/input';
import type { Expense } from '../../../types/expense';

export default function ExpenseForm({expense}: ExpenseFormProps) {
  const { categories, currency } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<number>(expense?.categoryId ?? categories[0]?.id ?? 0);
  const [expenseDate, setExpenseDate] = useState<string>(expense?.date ?? '');
  const [expenseTime, setExpenseTime] = useState<string>(expense?.createdAt?.substring(11, 16) ?? '');
  const [expenseAmount, setExpenseAmount] = useState<number>(expense?.amount ?? 0);
  const [expenseDescription, setExpenseDescription] = useState<string>(expense?.description ?? '');
  const dispatch = useAppDispatch();
  const handleSaveExpense = () => {
    console.log('Expense saved', {
      amount: expenseAmount,
      description: expenseDescription,
      categoryId: selectedCategory,
      date: expenseDate,
      time: expenseTime,
    });
    // Dispatch action to save the expense
    // dispatch({type:'UPDATE_EXPENSE', payload: {
    //   ...expense,
    //   amount: expenseAmount,
    //   description: expenseDescription,
    //   categoryId: selectedCategory,
    //   date: expenseDate,
    //   createdAt: expenseTime,
    //   updatedAt: new Date().toISOString(),
    // }});
  };
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
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(Number(e.target.value))}
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
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
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
              defaultValue={expenseDate}
              onChange={(date: string) => setExpenseDate(date)}
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
              value={expenseTime}
              onChange={(e) => setExpenseTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-4 mt-6">
          <Button
            type="submit"
            onClick={handleSaveExpense}
            variant='primary'
          >
            Save Expense
          </Button>
          <Button
            onClick={() => {
              console.log('Expense entry cancelled');
            }}
            variant='secondary'
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}

interface ExpenseFormProps {
  expense?: Expense;
}