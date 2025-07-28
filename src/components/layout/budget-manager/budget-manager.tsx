import { useState } from 'react';
import Button from '../../ui/button/button';
import Card from '../../ui/card/card';
import Modal from '../../ui/modal/modal';
import AddBudget from '../../forms/add-budget/add-budget';
import type { Budget } from '../../../types/budget';
import {
  useAppDispatch,
  useAppState,
} from '../../../context/app-state-context';
import { useNextId } from '../../../hooks/nextId/next-id';

export default function BudgetManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { budgets, categories } = useAppState();
  const [formState, setFormState] = useState<Budget>({
    id: 0,
    limit: 0,
    category: '',
    period: 'weekly',
    startDate: '',
    endDate: '',
  });
  const nextBudgetId = useNextId<Budget>(budgets);
  const dispatch = useAppDispatch();
  const periodOptions = [
    { value: 'weekly', label: 'Weekly', id: 1 },
    { value: 'monthly', label: 'Monthly', id: 2 },
    { value: 'yearly', label: 'Yearly', id: 3 },
  ];
  const isEndDateValid =
    !formState.startDate ||
    !formState.endDate ||
    new Date(formState.endDate) > new Date(formState.startDate);
  const handleSaveBudget = () => {
    const newBudget = {
      ...formState,
      id: nextBudgetId,
    };
    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
    setIsModalOpen(false);
  };
  return (
    <div className="budget-manager-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex-1">🎯 Budget Manager</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Manage your budget effectively with our intuitive tools.
      </p>
      <div>
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold flex-1">Budget Overview</h2>
          <span className="w-auto">
            <Button onClick={() => setIsModalOpen(true)} variant="primary">
              Add Budget
            </Button>
            {isModalOpen && (
              <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
                <div className="flex flex-col gap-4">
                  <AddBudget
                    categories={categories}
                    formState={formState}
                    onFieldChange={(field, value) =>
                      setFormState((prev) => ({ ...prev, [field]: value }))
                    }
                    periodOptions={periodOptions}
                  />
                  {!isEndDateValid && (
                    <div className="text-red-500 text-sm">
                      End date must be after start date.
                    </div>
                  )}
                  <Button onClick={handleSaveBudget} variant="primary">
                    Save
                  </Button>
                </div>
              </Modal>
            )}
          </span>
        </div>
        <ul>
          {budgets.map((budget: Budget) => (
            <li key={budget.id} className="mb-4">
              <Card>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* <span className="text-xl">{budget.icon}</span> */}
                      <h2 className="text-lg font-semibold text-gray-900">
                        {budget.category}
                      </h2>
                    </div>
                    <span className="text-xl text-green-700 font-semibold">
                      {budget.limit}/{budget.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${(budget.limit / budget.limit) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Remaining: {budget.limit - budget.limit}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(budget.startDate).toDateString()} -{' '}
                      {new Date(budget.endDate).toDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
