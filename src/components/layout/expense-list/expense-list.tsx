import { useState } from 'react';
import Select from '../../ui/select/select';
import Card from '../../ui/card/card';
import { useDebounce } from '../../../hooks/debounce/use-debounce';
import type { Category } from '../../../types/category';

export default function ExpenseList() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const categories: Category[] = [
    { name: 'all', id: 1, color: '', icon: '📦', isDefault: true },
    { name: 'food', id: 2, color: 'bg-green-100', icon: '🍔', isDefault: false },
    { name: 'transport', id: 3, color: 'bg-blue-100', icon: '🚗', isDefault: false },
    { name: 'fun', id: 4, color: 'bg-yellow-100', icon: '🎉', isDefault: false },
  ];
  const expenses = [
    {
      id: 1,
      icon: '🍕',
      name: 'Lunch at Cafe',
      amount: '$15',
      category: 'food',
      date: '2023-10-01',
    },
    {
      id: 2,
      icon: '🚌',
      name: 'Bus Ticket',
      amount: '$2.5',
      category: 'transport',
      date: '2023-10-02',
    },
    {
      id: 3,
      icon: '🎬',
      name: 'Movie Night',
      amount: '$12',
      category: 'fun',
      date: '2023-10-03',
    },
  ];
  const categoryOptions = categories.map((cat: Category) => ({
    value: cat.name,
    label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
  }));
  return (
    <div className="expense-list-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex-1">📝 Expense List</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Keep track of your expenses and stay within budget.
      </p>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold flex-1">Budget Overview</h2>
        <input
          type="text"
          name="search"
          id="search"
          aria-label="Search expenses"
          value={searchTerm}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search expenses..."
        />
        <div className='w-auto'>
          <Select
          name="sort"
          id="sort"
          options={categoryOptions}
          onChange={setSelectedCategory}
          value={selectedCategory}
        />
        </div>
      </div>
      <div>
        <Card>
          <ul>
            {expenses
              .filter(
                (expense) =>
                  (selectedCategory === 'all' ||
                    expense.category === selectedCategory) &&
                  (debouncedSearchTerm === '' ||
                    expense.name
                      .toLowerCase()
                      .includes(debouncedSearchTerm.toLowerCase()))
              )
              .map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last-of-type:border-0"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{expense.icon}</span>
                    <div>
                      <h3 className="font-semibold">{expense.name}</h3>
                      <p className="text-gray-500">{expense.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xl text-green-700 font-semibold">
                      {expense.amount}
                    </span>
                    <button className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                    <button className="text-blue-500 hover:text-blue-700">
                      Edit
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
