import type { Currency } from '../../../types/currency';
import { formatAmount } from '../../../utils/currency';

interface BudgetAlertProps {
  budgetName: string;
  remainingBudget: number;
  percentageUsed: number;
  currency: Currency;
}

export default function BudgetAlert({
  budgetName,
  remainingBudget,
  percentageUsed,
  currency,
}: BudgetAlertProps) {
  const getAlertType = () => {
    if (percentageUsed >= 100) return 'error';
    if (percentageUsed >= 80) return 'warning';
    return 'info';
  };

  const alertStyles = {
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const alertType = getAlertType();

  return (
    <div className={`rounded-md p-4 border ${alertStyles[alertType]}`}>
      <div className="flex gap-2">
        <div className="items-center justify-center">
          {alertType === 'error' ? '⚠️' : '💡'}
        </div>
        <div className="flex gap-1 flex-col">
          <h3 className="text-sm font-medium">Budget Alert: {budgetName}</h3>
          <div className=" text-sm">
            {percentageUsed >= 100 ? (
              <p>You have exceeded your budget!</p>
            ) : (
              <p>You have used {percentageUsed.toFixed(1)}% of your budget</p>
            )}
            <p className="">
              Remaining: {formatAmount(remainingBudget, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
