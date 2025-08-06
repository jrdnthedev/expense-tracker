import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';
import { useAppState } from '../../../context/app-state-hooks';
import { calculateTotalExpenses } from '../../../utils/expense';
import CustomLineChart from '../../charts/line-chart/line-chart';
import CustomBarChart from '../../charts/bar-chart/bar-chart';
import CustomPieChart from '../../charts/pie-chart/pie-chart';
import EmptyState from '../../ui/empty-state/empty-state';

export default function AnalyticsDashboard() {
  const { expenses, categories } = useAppState();
  const [timeframe, setTimeframe] = useState('last30days');
  const timeframes = [
    { value: 'last30days', label: 'Last 30 Days', id: 1 },
    { value: 'last3months', label: 'Last 3 Months', id: 2 },
    { value: 'last6months', label: 'Last 6 Months', id: 3 },
  ];

  // Calculate totals and statistics
  const totalExpenses = calculateTotalExpenses(expenses);

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
  const topCategory =
    categoryTotals.length > 0
      ? categoryTotals.reduce(
          (max, cat) => (cat.total > max.total ? cat : max),
          categoryTotals[0]
        )
      : null;

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const trends: { [month: string]: number } = {};
    expenses.forEach((expense) => {
      const month = new Date(expense.createdAt).toLocaleString('default', {
        month: 'long',
      });
      trends[month] = (trends[month] || 0) + expense.amount;
    });
    return trends;
  };

  const monthlyTrends = getMonthlyTrends();

  const getOverviewTrends = () => {
    const months = Object.keys(monthlyTrends);

    const data = months.map((month) => ({
      name: month,
      total: monthlyTrends[month],
      average: monthlyAverage,
      // If this is the most recent month, show the top category total
      topCategory:
        month === months[months.length - 1] ? topCategory?.total || 0 : 0,
    }));

    return data;
  };

  const overviewTrendsData = getOverviewTrends();
  return (
    <div className="analytics-dashboard-container">
      <h1 className="text-2xl font-bold mb-4">📊 Analytics Dashboard</h1>
      <p className="text-gray-600 mb-6">
        This section provides insights into your spending patterns and financial
        health.
      </p>
      {categories.length > 0 ? (
        <>
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
              <CustomLineChart data={overviewTrendsData} />
            </Card>
          </div>
          <div className="flex gap-4 max-sm:flex-col">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Category Breakdown
              </h2>
              <CustomPieChart
                data={categoryTotals
                  .sort((a, b) => b.total - a.total)
                  .map((cat) => ({ name: cat.name, value: cat.total }))}
              />
            </Card>
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Trends
              </h2>
              <CustomBarChart
                data={Object.entries(monthlyTrends).map(([month, amount]) => ({
                  name: month,
                  value: amount,
                }))}
              />
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <EmptyState
            title="No data available"
            description="Add categories and expenses to see your analytics."
            link="categoryManagement"
            cta="Add Categories"
          />
        </Card>
      )}
    </div>
  );
}
