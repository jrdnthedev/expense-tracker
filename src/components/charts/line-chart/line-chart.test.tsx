import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomLineChart from './line-chart';

interface LineChartData {
  name: string;
  total: number;
  average: number;
  topCategory: number;
}
// Mock recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: { children: React.ReactNode; data: LineChartData[] }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, type }: { dataKey: string; stroke: string; type: string }) => (
    <div
      data-testid={`line-${dataKey}`}
      data-stroke={stroke}
      data-type={type}
    />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: ({ strokeDasharray }: { strokeDasharray: string }) => (
    <div data-testid="cartesian-grid" data-stroke-dasharray={strokeDasharray} />
  ),
  Tooltip: ({ formatter }: { formatter?: (value: number) => string }) => (
    <div data-testid="tooltip" data-formatter={formatter ? 'present' : 'absent'} />
  ),
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width: string; height: string }) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
}));

// Mock app state hook
const mockUseAppState = vi.fn();
vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: () => mockUseAppState(),
}));

// Mock currency utility
const mockFormatAmount = vi.fn();
vi.mock('../../../utils/currency', () => ({
  formatAmount: (value: number, currency: string) => mockFormatAmount(value, currency),
}));

describe('CustomLineChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockReturnValue({ currency: 'USD' });
    mockFormatAmount.mockImplementation((value, currency) => `${currency} ${value}`);
  });

  test('should render ResponsiveContainer with correct dimensions', () => {
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomLineChart data={data} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-width', '100%');
    expect(container).toHaveAttribute('data-height', '300');
  });

  test('should render LineChart with provided data', () => {
    const data = [
      { name: 'Jan', expenses: 100, income: 200 },
      { name: 'Feb', expenses: 150, income: 250 }
    ];
    
    render(<CustomLineChart data={data} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toBeInTheDocument();
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(data));
  });

  test('should render chart components', () => {
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toHaveAttribute('data-stroke-dasharray', '3 3');
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'name');
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-formatter', 'present');
  });

  test('should render lines for all data keys except name', () => {
    const data = [{ name: 'Jan', expenses: 100, income: 200, savings: 50 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(screen.getByTestId('line-expenses')).toBeInTheDocument();
    expect(screen.getByTestId('line-income')).toBeInTheDocument();
    expect(screen.getByTestId('line-savings')).toBeInTheDocument();
    expect(screen.queryByTestId('line-name')).not.toBeInTheDocument();
  });

  test('should assign colors to lines cyclically', () => {
    const data = [{ name: 'Jan', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(screen.getByTestId('line-a')).toHaveAttribute('data-stroke', '#6366F1');
    expect(screen.getByTestId('line-b')).toHaveAttribute('data-stroke', '#10B981');
    expect(screen.getByTestId('line-c')).toHaveAttribute('data-stroke', '#EF4444');
    expect(screen.getByTestId('line-d')).toHaveAttribute('data-stroke', '#F59E0B');
    expect(screen.getByTestId('line-e')).toHaveAttribute('data-stroke', '#8B5CF6');
    expect(screen.getByTestId('line-f')).toHaveAttribute('data-stroke', '#6366F1'); // Cycles back
  });

  test('should set line type to monotone', () => {
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomLineChart data={data} />);
    
    const line = screen.getByTestId('line-value');
    expect(line).toHaveAttribute('data-type', 'monotone');
  });

  test('should handle empty data array', () => {
    const data: string[] = [];
    
    render(<CustomLineChart data={data} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toBeInTheDocument();
    expect(lineChart).toHaveAttribute('data-chart-data', '[]');
  });

  test('should handle single data point', () => {
    const data = [{ name: 'Only', value: 42 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(screen.getByTestId('line-value')).toBeInTheDocument();
    expect(screen.getByTestId('line-value')).toHaveAttribute('data-stroke', '#6366F1');
    expect(screen.getByTestId('line-value')).toHaveAttribute('data-type', 'monotone');
  });

  test('should use currency from app state', () => {
    mockUseAppState.mockReturnValue({ currency: 'EUR' });
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(mockUseAppState).toHaveBeenCalled();
  });

  test('should handle data with multiple numeric fields', () => {
    const data = [
      { name: 'Q1', revenue: 1000, costs: 600, profit: 400 },
      { name: 'Q2', revenue: 1200, costs: 700, profit: 500 }
    ];
    
    render(<CustomLineChart data={data} />);
    
    expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    expect(screen.getByTestId('line-costs')).toBeInTheDocument();
    expect(screen.getByTestId('line-profit')).toBeInTheDocument();
    expect(screen.queryByTestId('line-name')).not.toBeInTheDocument();
  });

  test('should handle data with mixed field types', () => {
    const data = [{ name: 'Test', value: 100, label: 'text', active: true }];
    
    render(<CustomLineChart data={data} />);
    
    // Should render lines for all keys except 'name'
    expect(screen.getByTestId('line-value')).toBeInTheDocument();
    expect(screen.getByTestId('line-label')).toBeInTheDocument();
    expect(screen.getByTestId('line-active')).toBeInTheDocument();
    expect(screen.queryByTestId('line-name')).not.toBeInTheDocument();
  });

  test('should handle data with only name field', () => {
    const data = [{ name: 'OnlyName' }];
    
    render(<CustomLineChart data={data} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toBeInTheDocument();
    // Should not render any lines since only 'name' field exists
    expect(screen.queryByTestId('line-name')).not.toBeInTheDocument();
  });

  test('should work with generic type constraint', () => {
    interface ExpenseData {
      name: string;
      amount: number;
      category: string;
    }
    
    const data: ExpenseData[] = [
      { name: 'Jan', amount: 100, category: 'Food' }
    ];
    
    render(<CustomLineChart<ExpenseData> data={data} />);
    
    expect(screen.getByTestId('line-amount')).toBeInTheDocument();
    expect(screen.getByTestId('line-category')).toBeInTheDocument();
  });

  test('should format tooltip values with currency', () => {
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-formatter', 'present');
  });

  test('should handle multiple data points for trend visualization', () => {
    const data = [
      { name: 'Jan', expenses: 100 },
      { name: 'Feb', expenses: 120 },
      { name: 'Mar', expenses: 90 },
      { name: 'Apr', expenses: 110 }
    ];
    
    render(<CustomLineChart data={data} />);
    
    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(data));
    expect(screen.getByTestId('line-expenses')).toBeInTheDocument();
  });

  test('should handle data with different currencies', () => {
    mockUseAppState.mockReturnValue({ currency: 'GBP' });
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomLineChart data={data} />);
    
    expect(mockUseAppState).toHaveBeenCalled();
    // Verify that the correct currency context is used
    const appStateCall = mockUseAppState.mock.results[0].value;
    expect(appStateCall.currency).toBe('GBP');
  });
});