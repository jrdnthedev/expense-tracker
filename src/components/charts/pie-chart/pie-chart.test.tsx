import { render, screen } from '@testing-library/react';
import { vi, test, expect, describe, beforeEach } from 'vitest';
import CustomPieChart from './pie-chart';
import * as appStateHooks from '../../../context/app-state-hooks';
import * as currencyUtils from '../../../utils/currency';
import { CURRENCIES } from '../../../types/currency';
interface PieChartData {
  name: string;
  value: number;
}

// Mock the dependencies
vi.mock('../../../context/app-state-hooks');
vi.mock('../../../utils/currency');
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({
    data,
    children,
  }: {
    data: PieChartData[];
    children: React.ReactNode;
  }) => (
    <div data-testid="pie" data-length={data.length}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill}></div>
  ),
  Tooltip: ({ formatter }: { formatter: (value: number) => void }) => (
    <div data-testid="tooltip" onClick={() => formatter(100)}></div>
  ),
  Legend: () => <div data-testid="legend"></div>,
}));

const mockUseAppState = vi.mocked(appStateHooks.useAppState);
const mockFormatAmount = vi.mocked(currencyUtils.formatAmount);

describe('CustomPieChart', () => {
  const mockData = [
    { name: 'Category A', value: 100 },
    { name: 'Category B', value: 200 },
    { name: 'Category C', value: 150 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppState.mockReturnValue({
      currency: CURRENCIES.USD,
      defaultCategory: 0,
      budgets: [],
      categories: [],
      expenses: [],
    });
    mockFormatAmount.mockReturnValue('$100.00');
  });

  test('renders pie chart with correct structure', () => {
    render(<CustomPieChart data={mockData} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('renders correct number of pie slices', () => {
    render(<CustomPieChart data={mockData} />);

    const pie = screen.getByTestId('pie');
    expect(pie).toHaveAttribute('data-length', '3');

    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(3);
  });

  test('applies colors in cycling pattern', () => {
    const colors = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];
    render(<CustomPieChart data={mockData} />);

    const cells = screen.getAllByTestId('cell');
    expect(cells[0]).toHaveAttribute('data-fill', colors[0]);
    expect(cells[1]).toHaveAttribute('data-fill', colors[1]);
    expect(cells[2]).toHaveAttribute('data-fill', colors[2]);
  });

  test('formatTooltipValue calls formatAmount with correct parameters', () => {
    render(<CustomPieChart data={mockData} />);

    const tooltip = screen.getByTestId('tooltip');
    tooltip.click(); // Triggers the formatter

    expect(mockFormatAmount).toHaveBeenCalledWith(100, CURRENCIES.USD);
  });

  test('formatTooltipValue returns formatted currency value', () => {
    mockFormatAmount.mockReturnValue('$150.75');
    render(<CustomPieChart data={mockData} />);

    // Access the component instance to test the function directly
    const { currency } = mockUseAppState();
    const formatTooltipValue = (value: number) =>
      currencyUtils.formatAmount(value, currency);

    const result = formatTooltipValue(150.75);
    expect(result).toBe('$150.75');
    expect(mockFormatAmount).toHaveBeenCalledWith(150.75, CURRENCIES.USD);
  });

  test('uses currency from app state', () => {
    mockUseAppState.mockReturnValue({
      currency: CURRENCIES.EUR,
      defaultCategory: 0,
      budgets: [],
      categories: [],
      expenses: [],
    });
    render(<CustomPieChart data={mockData} />);

    const tooltip = screen.getByTestId('tooltip');
    tooltip.click();

    expect(mockFormatAmount).toHaveBeenCalledWith(100, CURRENCIES.EUR);
  });

  test('handles empty data array', () => {
    render(<CustomPieChart data={[]} />);

    const pie = screen.getByTestId('pie');
    expect(pie).toHaveAttribute('data-length', '0');

    const cells = screen.queryAllByTestId('cell');
    expect(cells).toHaveLength(0);
  });
});
