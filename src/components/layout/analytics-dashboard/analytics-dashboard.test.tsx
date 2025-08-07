import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDashboard from './analytics-dashboard';
import { useAppState } from '../../../context/app-state-hooks';
import { calculateTotalExpenses } from '../../../utils/expense';
import type { Expense } from '../../../types/expense';
import type { Category } from '../../../types/category';
import type { Budget } from '../../../types/budget';
import { CURRENCIES } from '../../../types/currency';

interface LineChartData {
  name: string;
  total: number;
  average: number;
  topCategory: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface BarChartData {
  name: string;
  value: number;
}
// Mock the dependencies
vi.mock('../../../context/app-state-hooks');
vi.mock('../../../utils/expense');
vi.mock('../../charts/line-chart/line-chart', () => ({
  default: ({ data }: { data: LineChartData[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      Line Chart
    </div>
  ),
}));
vi.mock('../../charts/pie-chart/pie-chart', () => ({
  default: ({ data }: { data: PieChartData[] }) => (
    <div data-testid="pie-chart" data-chart-data={JSON.stringify(data)}>
      Pie Chart
    </div>
  ),
}));
vi.mock('../../charts/bar-chart/bar-chart', () => ({
  default: ({ data }: { data: BarChartData[] }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      Bar Chart
    </div>
  ),
}));

const mockUseAppState = vi.mocked(useAppState);
const mockCalculateTotalExpenses = vi.mocked(calculateTotalExpenses);

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍔' },
  { id: 2, name: 'Transport', icon: '🚗' },
  { id: 3, name: 'Entertainment', icon: '🎬' },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly Food Budget',
    limit: 500,
    expenseIds: [1, 3],
    categoryIds: [1],
    category: 'Food',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
  {
    id: 2,
    name: 'Transport Budget',
    limit: 200,
    expenseIds: [2],
    categoryIds: [2],
    category: 'Transport',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
  {
    id: 3,
    name: 'Entertainment Budget',
    limit: 150,
    expenseIds: [4],
    categoryIds: [3],
    category: 'Entertainment',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 50,
    description: 'Grocery shopping',
    category: 'Food',
    categoryId: 1,
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-07-15T10:00:00Z',
    budget: 'Monthly Food Budget',
    budgetId: 1,
  },
  {
    id: 2,
    amount: 25,
    description: 'Bus fare',
    category: 'Transport',
    categoryId: 2,
    createdAt: '2025-07-20T14:30:00Z',
    updatedAt: '2025-07-20T14:30:00Z',
    budget: 'Transport Budget',
    budgetId: 2,
  },
  {
    id: 3,
    amount: 75,
    description: 'Restaurant',
    category: 'Food',
    categoryId: 1,
    createdAt: '2025-08-01T19:00:00Z',
    updatedAt: '2025-08-01T19:00:00Z',
    budget: 'Monthly Food Budget',
    budgetId: 1,
  },
  {
    id: 4,
    amount: 30,
    description: 'Movie tickets',
    category: 'Entertainment',
    categoryId: 3,
    createdAt: '2025-08-05T20:00:00Z',
    updatedAt: '2025-08-05T20:00:00Z',
    budget: 'Entertainment Budget',
    budgetId: 3,
  },
];

const mockState = {
  currency: CURRENCIES.USD,
  defaultCategory: 1,
  budgets: mockBudgets,
  categories: mockCategories,
  expenses: mockExpenses,
};

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders analytics with data when categories and expenses exist', () => {
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Spending Overview')).toBeInTheDocument();
    expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('calculates category totals correctly', () => {
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    const pieChart = screen.getByTestId('pie-chart');
    const pieChartData = JSON.parse(
      pieChart.getAttribute('data-chart-data') || '[]'
    );

    // Food category should have total of 125 (50 + 75)
    expect(pieChartData).toContainEqual({ name: 'Food', value: 125 });
    // Transport category should have total of 25
    expect(pieChartData).toContainEqual({ name: 'Transport', value: 25 });
    // Entertainment category should have total of 30
    expect(pieChartData).toContainEqual({ name: 'Entertainment', value: 30 });
  });

  test('calculates monthly trends correctly', () => {
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    const barChart = screen.getByTestId('bar-chart');
    const barChartData = JSON.parse(
      barChart.getAttribute('data-chart-data') || '[]'
    );

    // July should have total of 75 (50 + 25)
    expect(barChartData).toContainEqual({ name: 'July', value: 75 });
    // August should have total of 105 (75 + 30)
    expect(barChartData).toContainEqual({ name: 'August', value: 105 });
  });

  test('changes timeframe and updates monthly average calculation', async () => {
    const user = userEvent.setup();
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    // Default should be "Last 30 Days"
    expect(screen.getByDisplayValue('Last 30 Days')).toBeInTheDocument();

    // Change to "Last 3 Months"
    const select = screen.getByDisplayValue('Last 30 Days');
    await user.selectOptions(select, 'last3months');

    expect(screen.getByDisplayValue('Last 3 Months')).toBeInTheDocument();
  });

  test('calculates overview trends data with correct structure', () => {
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    const lineChart = screen.getByTestId('line-chart');
    const lineChartData = JSON.parse(
      lineChart.getAttribute('data-chart-data') || '[]'
    );

    // Should have data for each month with required properties
    lineChartData.forEach((monthData: LineChartData) => {
      expect(monthData).toHaveProperty('name');
      expect(monthData).toHaveProperty('total');
      expect(monthData).toHaveProperty('average');
      expect(monthData).toHaveProperty('topCategory');
      expect(typeof monthData.total).toBe('number');
      expect(typeof monthData.average).toBe('number');
      expect(typeof monthData.topCategory).toBe('number');
    });
  });

  test('identifies top category correctly', () => {
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    const lineChart = screen.getByTestId('line-chart');
    const lineChartData = JSON.parse(
      lineChart.getAttribute('data-chart-data') || '[]'
    );

    // Find the most recent month (August)
    const augustData = lineChartData.find(
      (data: LineChartData) => data.name === 'August'
    );

    // Top category should be Food with total 125, but only August portion should be shown
    expect(augustData).toBeDefined();
    expect(augustData.topCategory).toBeGreaterThan(0);
  });

  test('handles empty expenses array gracefully', () => {
    mockUseAppState.mockReturnValue({
      ...mockState,
      expenses: [],
    });
    mockCalculateTotalExpenses.mockReturnValue(0);

    render(<AnalyticsDashboard />);

    // Should still render charts but with empty data
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const pieChart = screen.getByTestId('pie-chart');
    const pieChartData = JSON.parse(
      pieChart.getAttribute('data-chart-data') || '[]'
    );

    // All categories should have 0 total
    pieChartData.forEach((category: PieChartData) => {
      expect(category.value).toBe(0);
    });
  });

  test('sorts pie chart data by total amount descending', () => {
    mockUseAppState.mockReturnValue(mockState);
    mockCalculateTotalExpenses.mockReturnValue(180);

    render(<AnalyticsDashboard />);

    const pieChart = screen.getByTestId('pie-chart');
    const pieChartData = JSON.parse(
      pieChart.getAttribute('data-chart-data') || '[]'
    );

    // Should be sorted: Food (125), Entertainment (30), Transport (25)
    expect(pieChartData[0].name).toBe('Food');
    expect(pieChartData[0].value).toBe(125);
    expect(pieChartData[1].name).toBe('Entertainment');
    expect(pieChartData[1].value).toBe(30);
    expect(pieChartData[2].name).toBe('Transport');
    expect(pieChartData[2].value).toBe(25);
  });
});
