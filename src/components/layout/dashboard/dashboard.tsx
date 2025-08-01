import type { Expense } from '../../../types/expense';
import Card from '../../ui/card/card';

export default function Dashboard() {
  const recentList = [
    {
      description: 'Recent Expense 1',
      amount: 50,
      date: '2023-10-01',
      category: 'transport',
    },
    {
      description: 'Recent Expense 2',
      amount: 30,
      date: '2023-10-02',
      category: 'shopping',
    },
    {
      description: 'Recent Expense 3',
      amount: 20,
      date: '2023-10-03',
      category: 'food',
    },
  ];
  
  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              This month
            </h2>
            <p className="text-xl text-green-700 font-semibold">$2,847</p>
          </Card>
        </li>
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Budget left
            </h2>
            <p className="text-xl text-red-700 font-semibold">$153</p>
          </Card>
        </li>
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Transactions
            </h2>
            <p className="text-xl text-blue-700 font-semibold">47</p>
          </Card>
        </li>
      </ul>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Expenses
        </h2>
        <ul className="scrollable-list max-h-64 overflow-y-auto">
          {recentList.map((expense: ExpenseList) => (
            <li
              key={expense.date}
              className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2"
            >
              <div className="flex items-center gap-2">
                {/* <span className="text-xl">{expense.icon}</span> */}
                <div className="flex flex-col">
                  <span className="font-medium">{expense.description}</span>
                  <span className="text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className="text-red-700 font-semibold">
                {expense.amount}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

type ExpenseList = Pick<Expense, 'description' | 'amount' | 'date' | 'category'>;