import Button from '../../ui/button/button';
import Card from '../../ui/card/card';
import Modal from '../../ui/modal/modal';
import BudgetForm from '../../forms/budget-form/budget-form';
import type { Budget } from '../../../types/budget';
import { useNextId } from '../../../hooks/nextId/next-id';
import {
  formatDate,
  validateEndDate,
  validateBudgetForm,
} from '../../../utils/validators';
import { useAppState } from '../../../context/app-state-hooks';
import { formatAmount } from '../../../utils/currency';
import EmptyState from '../../ui/empty-state/empty-state';
import { useBudgetManagement } from '../../../hooks/budget-management/budget-management';

export default function BudgetManager() {
  const { budgets, categories, expenses, currency } = useAppState();
  const nextBudgetId = useNextId<Budget>(budgets);

  const {
    isModalOpen,
    formState,
    budgetToEdit,
    setIsModalOpen,
    setBudgetToEdit,
    handleFieldChange,
    handleSaveBudget,
    calculateSpentAmount,
    handleBudgetEdit,
    handleSaveChanges,
    handleDeleteBudget,
  } = useBudgetManagement(categories, expenses, budgets, nextBudgetId);
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex-1">🎯 Budget Manager</h1>
      </div>

      <div>
        {categories.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-gray-600">
                Manage your budget effectively with our intuitive tools.
              </p>
              <span className="w-auto">
                <Button onClick={() => setIsModalOpen(true)} variant="primary">
                  Add Budget
                </Button>
                {isModalOpen && (
                  <Modal
                    onClose={() => setIsModalOpen(false)}
                    isOpen={isModalOpen}
                  >
                    <h1 className="text-2xl font-bold ">Add Budget</h1>
                    <div className="flex flex-col gap-4">
                      <BudgetForm
                        categories={categories}
                        formState={formState}
                        onFieldChange={(field, value) =>
                          handleFieldChange(field, value)
                        }
                      />
                      {!validateEndDate(formState) && (
                        <div className="text-red-500 text-sm">
                          End date must be after start date.
                        </div>
                      )}
                      <Button
                        onClick={handleSaveBudget}
                        variant="primary"
                        disabled={
                          !validateBudgetForm(formState) ||
                          !validateEndDate(formState)
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </Modal>
                )}
              </span>
            </div>
            <ul>
              {budgets.map((budget: Budget) => {
                const spentAmount = calculateSpentAmount(budget);
                const remainingAmount = budget.limit - spentAmount;
                const percentageUsed = (spentAmount / budget.limit) * 100;
                const isCurrentOrPast =
                  new Date(budget.startDate) <= new Date();
                return (
                  <li key={budget.id} className="mb-4">
                    <Card>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-end">
                          <div className="flex gap-1">
                            <span className="text-sm text-gray-500">
                              <button onClick={() => handleBudgetEdit(budget)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  strokeWidth={2}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </span>
                            <span className="text-sm text-gray-500 ">
                              <button
                                onClick={() => handleDeleteBudget(budget.id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  strokeWidth={2}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900">
                            {budget.name}
                            {!isCurrentOrPast && (
                              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Future
                              </span>
                            )}
                          </h2>
                          <span
                            className="text-xl font-semibold"
                            style={{
                              color: remainingAmount < 0 ? 'red' : 'green',
                            }}
                          >
                            {formatAmount(spentAmount, currency)}/
                            {formatAmount(Number(budget.limit), currency)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className={`h-2.5 rounded-full ${
                              percentageUsed > 100
                                ? 'bg-red-600'
                                : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min(percentageUsed, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Remaining: {formatAmount(remainingAmount, currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(budget.startDate)} -{' '}
                            {formatDate(budget.endDate)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <Card>
            <EmptyState
              title="No Categories Found"
              description="Create a category to start tracking your expenses."
              cta="Add Category"
              link="categorymanagement"
            />
          </Card>
        )}
        {budgetToEdit && (
          <Modal isOpen={!!budgetToEdit} onClose={() => setBudgetToEdit(null)}>
            <h1 className="text-2xl font-bold ">Edit Budget</h1>
            <div className="flex flex-col gap-4">
              <BudgetForm
                formState={budgetToEdit}
                categories={categories}
                onFieldChange={(field, value) =>
                  setBudgetToEdit((prev) =>
                    prev ? { ...prev, [field]: value } : null
                  )
                }
              />
              <Button onClick={handleSaveChanges} variant="primary">
                Save Changes
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
