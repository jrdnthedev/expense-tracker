import { useState } from "react";
import CardButton from "../../ui/card-btn/card-btn";
import type { Category } from "../../../types/category";
import Button from "../../ui/button/button";

export default function ExpenseForm() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = [
    { name: 'Food', icon: '🍕' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Fun', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
  ];

  return (
    <div className="border border-gray-900/10 max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-lg font-semibold text-gray-900 mb-2">➕ Add Expense Form</div>
      <div className="text-sm text-gray-500 mb-6">
        Quick expense entry form with smart defaults and category selection. Optimized for fast data entry with minimal friction.
      </div>
      <div>
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Expense</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="$0.00"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What did you spend on?"
            />
          </div>

          <div className="mb-4">
            <label id="category-label" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-labelledby="category-label">
              {categories.map((category: Pick<Category, 'name' | 'icon'>) => (
                <CardButton
                  key={category.name}
                  label={category.name}
                  icon={category.icon}
                  selected={selectedCategory === category.name}
                  onClick={() => setSelectedCategory(category.name)}
                />
              ))}            
            </div>
          </div>

          <div className="flex max-sm:flex-col gap-4 mb-4">
            <div className="w-full flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">Date</label>
              <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" id="date" defaultValue="2024-12-17" />
            </div>
            <div className="w-full flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">Time</label>
              <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" id="time" defaultValue="14:30" />
            </div>
          </div>

          <div className="flex max-sm:flex-col gap-4 mt-6">
            <Button type="submit" onClick={() => {console.log('Expense saved')}} primary>
              Save Expense
            </Button>
            <Button onClick={() => {console.log('Expense entry cancelled')}}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
