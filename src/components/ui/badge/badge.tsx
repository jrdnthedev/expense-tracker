export default function Badge({ message, variant = 'default' }: BadgeProps) {
  const className = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-sm font-semibold px-2 py-1 rounded ${className[variant]}`}>
      {message}
    </span>
  );
}

interface BadgeProps {
  message: string;
  variant: 'default' | 'success' | 'error';
}
