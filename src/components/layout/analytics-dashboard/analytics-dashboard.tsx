import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';
import { useAppState } from '../../../context/app-state-hooks';

export default function AnalyticsDashboard() {
  const { expenses, categories, currency } = useAppState();
  const [timeframe, setTimeframe] = useState('last30days');
  const timeframes = [
    { value: 'last30days', label: 'Last 30 Days', id: 1 },
    { value: 'last3months', label: 'Last 3 Months', id: 2 },
    { value: 'last6months', label: 'Last 6 Months', id: 3 },
  ];

  // Calculate totals and statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate monthly average
  const monthlyAverage =
    totalExpenses /
    (timeframe === 'last30days' ? 1 : timeframe === 'last3months' ? 3 : 6);

  // Calculate category totals
  const categoryTotals = categories.map((category) => ({
    ...category,
    total: expenses
      .filter((exp) => exp.categoryId === category.id)
      .reduce((sum, exp) => sum + exp.amount, 0),
  }));

  // Find top category
  const topCategory = categoryTotals.reduce(
    (max, cat) => (cat.total > max.total ? cat : max),
    categoryTotals[0]
  );

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const trends: { [month: string]: number } = {};
    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleString('default', {
        month: 'long',
      });
      trends[month] = (trends[month] || 0) + expense.amount;
    });
    return trends;
  };

  const monthlyTrends = getMonthlyTrends();
  return (
    <div className="analytics-dashboard-container">
      <h1 className="text-2xl font-bold mb-4">📊 Analytics Dashboard</h1>
      <p className="text-gray-600 mb-6">
        This section provides insights into your spending patterns and financial
        health.
      </p>
      <div className="mb-4">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Spending Overview
            </h2>
            <div className="w-40">
              <Select
                name="timeframe"
                id="timeframe"
                options={timeframes}
                value={timeframe}
                onChange={setTimeframe}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                getOptionId={(option) => option.id}
              />
            </div>
          </div>
          <p className="text-gray-700 mb-2">
            Total Expenses: {currency.symbol}{totalExpenses.toFixed(2)}
          </p>
          <p className="text-gray-700 mb-2">
            Average Monthly Spending: {currency.symbol}{monthlyAverage.toFixed(2)}
          </p>
          <p className="text-gray-700">
            Top Category: {topCategory.name} ({currency.symbol}{topCategory.total.toFixed(2)})
          </p>
        </Card>
      </div>
      <div className="flex gap-4 max-sm:flex-col">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Category Breakdown
          </h2>
          {categoryTotals
            .sort((a, b) => b.total - a.total)
            .map((cat) => (
              <p key={cat.id} className="text-gray-700 mb-2">
                {cat.name}: {currency.symbol}{cat.total.toFixed(2)}
              </p>
            ))}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Trends
          </h2>
          {Object.entries(monthlyTrends).map(([month, amount]) => (
            <p key={month} className="text-gray-700 mb-2">
              {month}: {currency.symbol}{(amount as number).toFixed(2)}
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}
