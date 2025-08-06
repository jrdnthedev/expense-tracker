import { useState } from 'react';
import Button from '../../ui/button/button';
import Card from '../../ui/card/card';
import Modal from '../../ui/modal/modal';
import BudgetForm from '../../forms/budget-form/budget-form';
import type { Budget } from '../../../types/budget';
import { useNextId } from '../../../hooks/nextId/next-id';
import {
  formatDate,
  validateEndDate,
  validateForm,
} from '../../../utils/validators';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import { startOfDay, parseISO, isWithinInterval } from 'date-fns';
import { formatAmount } from '../../../utils/currency';
import EmptyState from '../../ui/empty-state/empty-state';
import type { Expense } from '../../../types/expense';

export default function BudgetManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { budgets, categories, expenses, currency } = useAppState();
  const [formState, setFormState] = useState<Budget>({
    id: 0,
    limit: 0,
    name: '',
    category: categories[0]?.name,
    categoryIds: [],
    startDate: '',
    endDate: '',
    expenseIds: [],
  });
  const nextBudgetId = useNextId<Budget>(budgets);
  const dispatch = useAppDispatch();
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const handleSaveBudget = () => {
    const categoryId = categories.find(
      (c) => c.name === formState.category
    )?.id;

    // Find existing expenses that match the budget criteria
    const relevantExpenses = expenses.filter((expense) => {
      if (expense.categoryId !== categoryId) return false;

      const expenseDate = startOfDay(parseISO(expense.createdAt));
      const budgetStart = startOfDay(parseISO(formState.startDate));
      const budgetEnd = startOfDay(parseISO(formState.endDate));

      return isWithinInterval(expenseDate, {
        start: budgetStart,
        end: budgetEnd,
      });
    });

    const newBudget = {
      ...formState,
      id: nextBudgetId,
      limit: Number(formState.limit),
      categoryIds: categoryId ? [categoryId] : [], // Fix: Add categoryId to array
      expenseIds: relevantExpenses.map((e: Expense) => e.id),
    };

    console.log('Adding new budget:', newBudget);
    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
    setFormState({
      id: 0,
      limit: 0,
      name: '',
      category: categories[0].name,
      categoryIds: [],
      startDate: '',
      endDate: '',
      expenseIds: [],
    });
    setIsModalOpen(false);
  };

  const calculateSpentAmount = (budget: Budget) => {
    return expenses
      .filter((expense) => {
        // Only include expenses that are in this budget's expenseIds array
        if (!budget.expenseIds.includes(expense.id)) return false;

        const expenseDate = startOfDay(parseISO(expense.createdAt));
        const budgetStart = startOfDay(parseISO(budget.startDate));
        const budgetEnd = startOfDay(parseISO(budget.endDate));

        return isWithinInterval(expenseDate, {
          start: budgetStart,
          end: budgetEnd,
        });
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const handleBudgetEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setFormState({
      id: budget.id,
      limit: budget.limit,
      name: budget.name,
      category:
        categories.find((c) => c.id === budget.categoryIds[0])?.name || '',
      categoryIds: budget.categoryIds,
      startDate: budget.startDate,
      endDate: budget.endDate,
      expenseIds: budget.expenseIds,
    });
    console.log('Edit budget', budgetToEdit);
  };
  const handleSaveChanges = () => {
    if (budgetToEdit) {
      dispatch({ type: 'UPDATE_BUDGET', payload: budgetToEdit });
      setBudgetToEdit(null);
      // setFormState({
      //   id: 0,
      //   limit: 0,
      //   name: '',
      //   category: categories[0].name,
      //   categoryIds: [],
      //   startDate: '',
      //   endDate: '',
      //   expenseIds: [],
      // });
    }
  };

  const handleDeleteBudget = (budgetId: number) => {
    dispatch({ type: 'REMOVE_BUDGET', payload: { id: budgetId } });
    setBudgetToEdit(null);
  };
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
                          setFormState((prev) => ({ ...prev, [field]: value }))
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
                          !validateForm(formState) ||
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
