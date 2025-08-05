export const ErrorScreen = ({
  title = 'Something went wrong',
  message,
  actionLabel = 'Try Again',
  onAction
}: ErrorScreenProps) => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg 
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

interface ErrorScreenProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}