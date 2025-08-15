import { Link } from "react-router-dom";

export default function EmptyState({
  title = 'No expenses yet',
  description = 'Start tracking your expenses by adding your first transaction.',
  link,
  cta = 'Add Expense',
}: {
  title?: string;
  description?: string;
  link: string;
  cta?: string;
}) {
  return (
    <div className="text-center py-8 flex flex-col items-center gap-4">
      <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      <Link to={`/${link}`} className="text-blue-600 hover:underline">
        {cta}
      </Link>
    </div>
  );
}
