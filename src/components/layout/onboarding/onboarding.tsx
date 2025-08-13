import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/card/card';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import ExpenseForm, { type ExpenseFormData } from '../../forms/expense-form/expense-form';
import Dashboard from '../dashboard/dashboard';
import BudgetForm from '../../forms/budget-form/budget-form';
import Button from '../../ui/button/button';
import { useNextId } from '../../../hooks/nextId/next-id';
import type { Budget } from '../../../types/budget';
import { validateEndDate, validateBudgetForm } from '../../../utils/validators';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import { LocalStorage } from '../../../utils/local-storage';
import CategoryForm from '../../forms/category-form/category-form';
import type { Expense } from '../../../types/expense';
import { useCategoryManagement } from '../../../hooks/category-management/category-management';
import { useBudgetManagement } from '../../../hooks/budget-management/budget-management';

export default function Onboarding({
  setOnboardingComplete,
}: {
  setOnboardingComplete: (complete: boolean) => void;
}) {
  const { categories, currency, budgets, expenses } = useAppState();
  const [step, setStep] = useState(1);
  const dispatch = useAppDispatch();
  const nextBudgetId = useNextId<Budget>(budgets);
  const nextCategoryId = useNextId<Category>(categories);
  const navigate = useNavigate();

  // Use existing hooks
  const {
    addCategoryFormState,
    handleAddFormChange,
    handleAddCategory: handleAddCategoryBase,
  } = useCategoryManagement(categories, nextCategoryId);

  const {
    formState: budgetFormState,
    handleFieldChange: handleBudgetFieldChange,
    handleSaveBudget: handleSaveBudgetBase,
  } = useBudgetManagement(categories, expenses, budgets, nextBudgetId);

  // Wrap the handlers to include onboarding-specific logic
  const handleAddCategory = () => {
    handleAddCategoryBase();
    setStep(4);
  };

  const handleSaveBudget = () => {
    handleSaveBudgetBase();
    LocalStorage.set('onboardingComplete', true);
    setOnboardingComplete(true);
    setStep(5);
  };

  const handleAdd = (data: ExpenseFormData) => {
    const newExpense: Expense = {
      ...data,
      amount: Number(data.amount),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    console.log('Adding expense:', newExpense);
    setStep(6);
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
                onFieldChange={handleAddFormChange}
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
              <BudgetForm
                categories={categories}
                formState={budgetFormState}
                onFieldChange={handleBudgetFieldChange}
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
                    !validateBudgetForm(budgetFormState) ||
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
                currency={currency}
                onSubmit={handleAdd}
                onCancel={() => void 0}
              />
            </div>
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
