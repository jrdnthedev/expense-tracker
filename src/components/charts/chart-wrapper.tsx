import { ResponsiveContainer } from 'recharts';

export default function ChartWrapper({ children, height = 300 }: ChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <>
        {children}
      </>
    </ResponsiveContainer>
  );
}

interface ChartWrapperProps {
  children: React.ReactNode;
  height?: number;
}