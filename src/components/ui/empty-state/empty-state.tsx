// import { PlusIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  title = 'No expenses yet',
  description = 'Start tracking your expenses by adding your first transaction.',
  onAction,
  cta = 'Add Expense',
}: {
  title?: string;
  description?: string;
  onAction?: () => void;
  cta?: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
