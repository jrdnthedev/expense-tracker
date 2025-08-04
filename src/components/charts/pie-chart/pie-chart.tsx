import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppState } from '../../../context/app-state-hooks';
import { formatAmount } from '../../../utils/currency';

export default function CustomPieChart<T>({ data }: ChartProps<T>) {
  const { currency } = useAppState();
  const colors = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];
  const formatTooltipValue = (value: number) => {
    return formatAmount(value, currency);
  };
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={formatTooltipValue} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ChartProps<T> {
  data: T[];
}
