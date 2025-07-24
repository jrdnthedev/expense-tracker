import { useState } from 'react';
import Button from '../../ui/button/button';
import Card from '../../ui/card/card';
import Modal from '../../ui/modal/modal';
import AddBudget from '../../forms/add-budget/add-budget';
import type { Budget } from '../../../types/budget';
import { useAppState } from '../../../context/app-state-context';

export default function BudgetManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { budgets } = useAppState();

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
            <Button onClick={() => setIsModalOpen(true)} primary>
              Add Budget
            </Button>
            {isModalOpen && (
              <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
                <AddBudget />
              </Modal>
            )}
          </span>
        </div>
        <ul>
          {budgets.map((budget: Budget) => (
            <li key={budget.category} className="mb-4">
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
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{
                        width: `${(budget.limit / budget.limit) * 100}%`,
                      }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Remaining: {budget.limit - budget.limit}
                    </p>
                    <p className="text-sm text-gray-600">{budget.startDate.toDateString()} - {budget.endDate.toDateString()}</p>
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

