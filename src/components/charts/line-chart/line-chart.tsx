import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomLineChart<T>({ data }: ChartProps<T>) {
  // Get unique keys from the data, excluding 'name' which is used for X-axis
  const dataKeys = Object.keys(data[0] || {}).filter(key => key !== 'name');

  // Colors for different lines
  const colors = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface ChartProps<T> {
    data: T[];
}