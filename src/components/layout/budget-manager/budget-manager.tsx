import Button from '../../ui/button/button';
import Card from '../../ui/card/card';

export default function BudgetManager() {
  const budgets = [
    {
      name: 'Food',
      amount: '$500',
      spent: '$300',
      icon: '🍕',
      remaining: '$200',
      days: '12 days left',
    },
    {
      name: 'Transport',
      amount: '$200',
      spent: '$150',
      icon: '🚗',
      remaining: '$50',
      days: '5 days left',
    },
    {
      name: 'Entertainment',
      amount: '$300',
      spent: '$100',
      icon: '🎉',
      remaining: '$200',
      days: '10 days left',
    },
    {
      name: 'Shopping',
      amount: '$400',
      spent: '$250',
      icon: '🛍️',
      remaining: '$150',
      days: '8 days left',
    },
  ];
  return (
    <div className="budget-manager-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex-1">🎯 Budget Manager</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Manage your budget effectively with our intuitive tools.
      </p>
      <div>
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold flex-1">Budget Overview</h2>
          <span className="w-auto">
            <Button onClick={() => console.log('Add Budget Clicked')} primary>
              Add Budget
            </Button>
          </span>
        </div>
        <ul>
          {budgets.map((budget) => (
            <li key={budget.name} className="mb-4">
              <Card>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{budget.icon}</span>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {budget.name}
                      </h2>
                    </div>
                    <span className="text-xl text-green-700 font-semibold">
                      {budget.spent}/{budget.amount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{
                        width: `${(parseFloat(budget.spent.replace('$', '')) / parseFloat(budget.amount.replace('$', ''))) * 100}%`,
                      }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Remaining: {budget.remaining}
                    </p>
                    <p className="text-sm text-gray-600">{budget.days}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
