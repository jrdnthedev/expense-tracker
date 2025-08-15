interface ProgressBarProps {
    percentageUsed: number;
}
export default function ProgressBar({ percentageUsed }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        role="progressbar"
        aria-valuenow={percentageUsed}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`h-2.5 rounded-full ${
          percentageUsed > 100 ? 'bg-red-600' : 'bg-blue-600'
        }`}
        style={{
          width: `${Math.min(percentageUsed, 100)}%`,
        }}
      ></div>
    </div>
  );
}
