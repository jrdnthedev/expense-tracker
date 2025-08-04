import { useAppState } from '../../../context/app-state-hooks';
import type { Expense } from '../../../types/expense';
import { calculateAllRemainingBudgets } from '../../../utils/budget';
import { formatAmount } from '../../../utils/currency';
import { getCurrentMonthExpenses, getRecentExpenses, getTotalTransactions } from '../../../utils/expense';
import Card from '../../ui/card/card';
import EmptyState from '../../ui/empty-state/empty-state';

export default function Dashboard() {
  const { expenses, currency, budgets } = useAppState();
  const monthlyExpenses = getCurrentMonthExpenses(expenses);
  const recentExpenses = getRecentExpenses(expenses, 5);

  const totalRemainingBudget = calculateAllRemainingBudgets(budgets, expenses);
  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              This month
            </h2>
            <p className="text-xl text-green-700 font-semibold">{formatAmount(monthlyExpenses, currency)}</p>
          </Card>
        </li>
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Budget left
            </h2>
            <p className={`text-xl font-semibold ${totalRemainingBudget > 0 ? 'text-green-700' : 'text-red-700'}`}>{formatAmount(totalRemainingBudget, currency)}</p>
          </Card>
        </li>
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Transactions
            </h2>
            <p className="text-xl text-blue-700 font-semibold">{getTotalTransactions(expenses)}</p>
          </Card>
        </li>
      </ul>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Expenses
        </h2>
        {recentExpenses.length > 0 ? (
          <ul className="scrollable-list max-h-64 overflow-y-auto">
            {recentExpenses.map((expense: ExpenseList) => (
              <li
                key={expense.id}
                className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2"
              >
              <div className="flex items-center gap-2">
                {/* <span className="text-xl">{expense.icon}</span> */}
                <div className="flex flex-col">
                  <span className="font-medium">{expense.description}</span>
                  <span className="text-gray-600">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className="text-red-700 font-semibold">
                {formatAmount(expense.amount, currency)}
              </span>
            </li>
          ))}
        </ul>):(
            <EmptyState
              title="No recent expenses"
              description="Track your spending by adding expenses."
              onAction={() => console.log('Add Expense')}
            />
          )}
      </Card>
    </div>
  );
}

type ExpenseList = Pick<Expense, 'description' | 'amount' | 'date' | 'category' | 'id' | 'createdAt'>;