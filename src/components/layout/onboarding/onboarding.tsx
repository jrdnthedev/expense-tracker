import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/card/card';
import { useAppState } from '../../../context/app-state-context';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import ExpenseForm from '../../forms/expense-form/expense-form';
import Dashboard from '../dashboard/dashboard';
import AddBudget from '../../forms/add-budget/add-budget';
import Button from '../../ui/button/button';

export default function Onboarding() {
  const { categories, currency, defaultCategory } = useAppState();
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({
    amount: '',
    description: '',
    category: '',
    categoryId: defaultCategory,
    date: '',
    time: '00:00',
  });
  const [budgetFormState, setBudgetFormState] = useState({
    id: 0,
    limit: 0,
    category: '',
    period: 'weekly',
    startDate: '',
    endDate: '',
  });
  const navigate = useNavigate();
  const periodOptions = [
    { value: 'weekly', label: 'Weekly', id: 1 },
    { value: 'monthly', label: 'Monthly', id: 2 },
    { value: 'yearly', label: 'Yearly', id: 3 },
  ];
  const handleFieldChange = (field: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };
  const handleSaveBudget = () => {
    // Logic to save the budget can be added here
    console.log('Budget saved:', budgetFormState);
    // Navigate to the dashboard after saving
    navigate('/dashboard');
  };
  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card>
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
            <p className="mb-6">Let’s set up your default categories.</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setStep(2)}
            >
              Continue
            </button>
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
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setStep(3)}
            >
              Next: Add First Expense
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold mb-2">Add Your First Expense</h2>
            <p className="mb-6">Let’s record your first expense together.</p>
            <div>
              <ExpenseForm
                categories={categories}
                formState={formState}
                onFieldChange={handleFieldChange}
                currency={currency}
              />
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setStep(4)}
            >
              Next: View Dashboard
            </button>
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="text-xl font-bold mb-2">Dashboard Preview</h2>
            <p className="mb-6">
              Here’s how your dashboard will look with sample data.
            </p>
            <div>
              <Dashboard />
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setStep(5)}
            >
              Next: Set Up Budget
            </button>
          </>
        )}
        {step === 5 && (
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
              <div>
                <Button onClick={handleSaveBudget} variant="primary">
                  Save Budget
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
