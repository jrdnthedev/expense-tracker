import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/card/card';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import ExpenseForm from '../../forms/expense-form/expense-form';
import Dashboard from '../dashboard/dashboard';
import AddBudget from '../../forms/add-budget/add-budget';
import Button from '../../ui/button/button';
import { useNextId } from '../../../hooks/nextId/next-id';
import type { Budget } from '../../../types/budget';
import { periodOptions } from '../../../constants/data';
import { validateEndDate, validateForm } from '../../../utils/validators';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import { LocalStorage } from '../../../utils/local-storage';
import { getBudgetStartDate } from '../../../utils/budget';
import CategoryForm from '../../forms/category-form/category-form';
import type { Expense } from '../../../types/expense';

export default function Onboarding({
  setOnboardingComplete,
}: {
  setOnboardingComplete: (complete: boolean) => void;
}) {
  const { categories, currency, defaultCategory, budgets, expenses } =
    useAppState();
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<Expense>({
    amount: 0,
    description: '',
    category: categories[0]?.name ?? '',
    categoryId: defaultCategory,
    // date: '',
    // tags: [],
    budget: '',
    budgetId: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: 0,
  });
  const [budgetFormState, setBudgetFormState] = useState<Budget>({
    id: 0,
    limit: 0,
    name: '',
    category: categories[0]?.name,
    categoryIds: [],
    startDate: '',
    endDate: '',
    expenseIds: []
  });
  const handleFieldChange = useCallback(
    (field: string, value: string | number) =>
      setFormState((prev) => ({ ...prev, [field]: value })),
    []
  );
  const nextBudgetId = useNextId<Budget>(budgets);
  const nextCategoryId = useNextId<Category>(categories);
  const nextExpenseId = useNextId<Expense>(expenses);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [addCategoryFormState, setAddCategoryFormState] = useState<Category>({
    name: '',
    icon: '➕',
    id: nextCategoryId,
  });
  const handleSaveBudget = () => {
    if (budgetFormState) {
      const budgetState = {
        ...budgetFormState,
        id: nextBudgetId,
      };
      LocalStorage.set('onboardingComplete', true);
      setOnboardingComplete(true);
      dispatch({ type: 'ADD_BUDGET', payload: budgetState });
      setStep(5);
    }
  };

  const handleSaveExpense = () => {
    console.log('Expense saved:', formState);
    const expenseState: Expense = {
      ...formState,
      amount: Number(formState.amount),
      id: nextExpenseId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: expenseState });
    setStep(6);
  };

  const handleAddCategory = () => {
    console.log('Adding new category:', addCategoryFormState);
    dispatch({
      type: 'ADD_CATEGORY',
      payload: addCategoryFormState,
    });
    setAddCategoryFormState({
      name: '',
      icon: '➕',
      id: nextCategoryId,
    });
    setStep(4);
  };
  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card>
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
            <p className="mb-6">Let’s set up your default categories.</p>
            <Button onClick={() => setStep(2)} variant="primary" type="button">
              Continue
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-2">Default Categories</h2>
            <p className="mb-6">
              We’ve added some categories for you. You can edit them later.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {categories.map((category: Category) => (
                <CardButton
                  key={category.id}
                  label={category.name}
                  icon={category.icon}
                  selected={false}
                  onClick={() => void 0} // No action needed here
                />
              ))}
            </div>
            <Button onClick={() => setStep(3)} variant="primary" type="button">
              Next: Add First Category
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-2">Add Your First Category</h2>
            <p className="mb-6">Let’s create your first category together.</p>
            <div>
              <CategoryForm
                formState={addCategoryFormState}
                onFieldChange={(field, value) =>
                  setAddCategoryFormState((prev) => ({
                    ...prev,
                    [field]: value,
                  }))
                }
              />
              <Button
                onClick={handleAddCategory}
                variant="primary"
                type="button"
              >
                Save Category
              </Button>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="text-xl font-bold mb-2">Set Up Your First Budget</h2>
            <p className="mb-6">Let’s help you set a budget for a category.</p>
            <div className="flex flex-col gap-4">
              <AddBudget
                categories={categories}
                formState={budgetFormState}
                onFieldChange={(field, value) =>
                  setBudgetFormState((prev) => ({ ...prev, [field]: value }))
                }
                periodOptions={periodOptions}
              />
              {!validateEndDate(budgetFormState) && (
                <div className="text-red-500 text-sm">
                  End date must be after start date.
                </div>
              )}
              <div>
                <Button
                  onClick={handleSaveBudget}
                  variant="primary"
                  disabled={
                    !validateForm(budgetFormState) ||
                    !validateEndDate(budgetFormState)
                  }
                >
                  Save Budget
                </Button>
              </div>
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h2 className="text-xl font-bold mb-2">Add Your First Expense</h2>
            <p className="mb-6">Let’s record your first expense together.</p>
            <div>
              <ExpenseForm
                categories={categories}
                budgets={budgets}
                formState={formState}
                onFieldChange={handleFieldChange}
                currency={currency}
                minDate={getBudgetStartDate(formState.categoryId, budgets)}
              />
            </div>
            <Button
              onClick={handleSaveExpense}
              variant="primary"
              type="button"
              // disabled={!validateForm(formState)}
            >
              Save Expense
            </Button>
          </>
        )}
        {step === 6 && (
          <>
            <h2 className="text-xl font-bold mb-2">Dashboard Preview</h2>
            <p className="mb-6">
              Here’s how your dashboard will look with sample data.
            </p>
            <div className="flex flex-col gap-4">
              <Dashboard />
              <div className="w-auto">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                  type="button"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
