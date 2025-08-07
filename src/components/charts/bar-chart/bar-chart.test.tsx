import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomBarChart from './bar-chart';

interface BarChartData {
  name: string;
  value: number;
}
// Mock recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: BarChartData[] }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }: { dataKey: string; fill: string }) => (
    <div data-testid={`bar-${dataKey}`} data-fill={fill} />
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

describe('CustomBarChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockReturnValue({ currency: 'USD' });
    mockFormatAmount.mockImplementation((value, currency) => `${currency} ${value}`);
  });

  test('should render ResponsiveContainer with correct dimensions', () => {
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomBarChart data={data} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('data-width', '100%');
    expect(container).toHaveAttribute('data-height', '300');
  });

  test('should render BarChart with provided data', () => {
    const data = [
      { name: 'Jan', expenses: 100, income: 200 },
      { name: 'Feb', expenses: 150, income: 250 }
    ];
    
    render(<CustomBarChart data={data} />);
    
    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
    expect(barChart).toHaveAttribute('data-chart-data', JSON.stringify(data));
  });

  test('should render chart components', () => {
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomBarChart data={data} />);
    
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toHaveAttribute('data-stroke-dasharray', '3 3');
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toHaveAttribute('data-key', 'name');
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-formatter', 'present');
  });

  test('should render bars for all data keys except name', () => {
    const data = [{ name: 'Jan', expenses: 100, income: 200, savings: 50 }];
    
    render(<CustomBarChart data={data} />);
    
    expect(screen.getByTestId('bar-expenses')).toBeInTheDocument();
    expect(screen.getByTestId('bar-income')).toBeInTheDocument();
    expect(screen.getByTestId('bar-savings')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-name')).not.toBeInTheDocument();
  });

  test('should assign colors to bars cyclically', () => {
    const data = [{ name: 'Jan', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }];
    
    render(<CustomBarChart data={data} />);
    
    expect(screen.getByTestId('bar-a')).toHaveAttribute('data-fill', '#6366F1');
    expect(screen.getByTestId('bar-b')).toHaveAttribute('data-fill', '#10B981');
    expect(screen.getByTestId('bar-c')).toHaveAttribute('data-fill', '#EF4444');
    expect(screen.getByTestId('bar-d')).toHaveAttribute('data-fill', '#F59E0B');
    expect(screen.getByTestId('bar-e')).toHaveAttribute('data-fill', '#8B5CF6');
    expect(screen.getByTestId('bar-f')).toHaveAttribute('data-fill', '#6366F1'); // Cycles back
  });

  test('should handle empty data array', () => {
    const data: string[] = [];
    
    render(<CustomBarChart data={data} />);
    
    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
    expect(barChart).toHaveAttribute('data-chart-data', '[]');
  });

  test('should handle single data point', () => {
    const data = [{ name: 'Only', value: 42 }];
    
    render(<CustomBarChart data={data} />);
    
    expect(screen.getByTestId('bar-value')).toBeInTheDocument();
    expect(screen.getByTestId('bar-value')).toHaveAttribute('data-fill', '#6366F1');
  });

  test('should use currency from app state', () => {
    mockUseAppState.mockReturnValue({ currency: 'EUR' });
    const data = [{ name: 'Jan', value: 100 }];
    
    render(<CustomBarChart data={data} />);
    
    expect(mockUseAppState).toHaveBeenCalled();
  });

  test('should handle data with multiple numeric fields', () => {
    const data = [
      { name: 'Q1', revenue: 1000, costs: 600, profit: 400 },
      { name: 'Q2', revenue: 1200, costs: 700, profit: 500 }
    ];
    
    render(<CustomBarChart data={data} />);
    
    expect(screen.getByTestId('bar-revenue')).toBeInTheDocument();
    expect(screen.getByTestId('bar-costs')).toBeInTheDocument();
    expect(screen.getByTestId('bar-profit')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-name')).not.toBeInTheDocument();
  });

  test('should handle data with mixed field types', () => {
    const data = [{ name: 'Test', value: 100, label: 'text', active: true }];
    
    render(<CustomBarChart data={data} />);
    
    // Should render bars for all keys except 'name'
    expect(screen.getByTestId('bar-value')).toBeInTheDocument();
    expect(screen.getByTestId('bar-label')).toBeInTheDocument();
    expect(screen.getByTestId('bar-active')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-name')).not.toBeInTheDocument();
  });

  test('should handle data with only name field', () => {
    const data = [{ name: 'OnlyName' }];
    
    render(<CustomBarChart data={data} />);
    
    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();
    // Should not render any bars since only 'name' field exists
    expect(screen.queryByTestId('bar-name')).not.toBeInTheDocument();
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
    
    render(<CustomBarChart<ExpenseData> data={data} />);
    
    expect(screen.getByTestId('bar-amount')).toBeInTheDocument();
    expect(screen.getByTestId('bar-category')).toBeInTheDocument();
  });
});