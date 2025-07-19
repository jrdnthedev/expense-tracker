import { useState } from 'react';
import Select from '../../ui/select/select';
import Card from '../../ui/card/card';

export default function ExpenseList() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { value: 'all', label: 'All Categories', category: '' },
    { value: 'food', label: 'Food', category: 'food' },
    { value: 'transport', label: 'Transport', category: 'transport' },
    { value: 'fun', label: 'Fun', category: 'fun' },
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
          className="border border-gray-300 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search expenses..."
        />
        <Select
          name="sort"
          id="sort"
          options={categories}
          onChange={(value) => setSelectedCategory(value)}
          value={selectedCategory}
        />
      </div>
      <div>
        <Card>
            <ul>
                {expenses
                  .filter(expense => selectedCategory === 'all' || expense.category === selectedCategory)
                  .map(expense => (
                    <li key={expense.id} className='flex items-center justify-between py-2 border-b border-gray-200 last-of-type:border-0'>
                      <div className='flex items-center'>
                        <span className='text-xl mr-2'>{expense.icon}</span>
                        <div>
                          <h3 className='font-semibold'>{expense.name}</h3>
                          <p className='text-gray-500'>{expense.date}</p>
                        </div>
                      </div>
                      <span className='text-xl text-green-700 font-semibold'>{expense.amount}</span>
                    </li>
                  ))}
            </ul>
        </Card>
      </div>
    </div>
  );
}
