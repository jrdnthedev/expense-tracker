import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function CustomBarChart<T>({ data }: ChartProps<T>) {
  const colors = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];
  const dataKeys = Object.keys(data[0] || {}).filter(key => key !== 'name');
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ChartProps<T> {
  data: T[];
}
