import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/card/card';
import { useAppState } from '../../../context/app-state-context';
import CardButton from '../../ui/card-btn/card-btn';
import type { Category } from '../../../types/category';
import ExpenseForm from '../../forms/expense-form/expense-form';
import Dashboard from '../dashboard/dashboard';

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
  const navigate = useNavigate();

  const handleFieldChange = (field: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
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
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => navigate('/dashboard')}
            >
              Finish & Go to Dashboard
            </button>
          </>
        )}
      </Card>
    </div>
  );
}
