import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';
import DatePicker from '../../ui/date-picker/date-picker';

export default function AddBudget() {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const startDate = 'start-date';
  const endDate = 'end-date';
  return (
    <Card>
      <h1>Add Budget</h1>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="limit">Limit</label>
          <input
            type="number"
            id="limit"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="$0.00"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-full flex-1 flex flex-col">
            <label htmlFor="category">Category</label>
            <Select
              id="category"
              value={selectedCategory}
              name="Select Category"
              options={[
                { value: 'food', label: 'Food' },
                { value: 'transport', label: 'Transport' },
                { value: 'entertainment', label: 'Entertainment' },
                { value: 'shopping', label: 'Shopping' },
              ]}
              onChange={(selectedOption) => setSelectedCategory(selectedOption)}
            />
          </div>
          <div className="w-full flex-1 flex flex-col">
            <label htmlFor="period">Period</label>
            <Select
              id="period"
              value={selectedPeriod}
              name="Select Period"
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              onChange={(selectedOption) => setSelectedPeriod(selectedOption)}
            />
          </div>
        </div>
        <div className="flex max-sm:flex-col gap-4 mb-4">
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor={startDate}
            >
              Start Date
            </label>
            <DatePicker
              id={startDate}
              defaultValue="2024-12-17"
              onChange={(date) => console.log('Start Date:', date)}
            />
          </div>
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor={endDate}
            >
              End Date
            </label>
            <DatePicker
              id={endDate}
              defaultValue="2025-01-17"
              onChange={(date) => console.log('End Date:', date)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
