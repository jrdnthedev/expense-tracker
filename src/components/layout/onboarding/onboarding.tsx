import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/card/card';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card>
        {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="mb-6">Let’s set up your default categories.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)}>
            Continue
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-2">Default Categories</h2>
          <p className="mb-6">We’ve added some categories for you. You can edit them later.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(3)}>
            Next: Add First Expense
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="text-xl font-bold mb-2">Add Your First Expense</h2>
          <p className="mb-6">Let’s record your first expense together.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(4)}>
            Next: View Dashboard
          </button>
        </>
      )}
      {step === 4 && (
        <>
          <h2 className="text-xl font-bold mb-2">Dashboard Preview</h2>
          <p className="mb-6">Here’s how your dashboard will look with sample data.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(5)}>
            Next: Set Up Budget
          </button>
        </>
      )}
      {step === 5 && (
        <>
          <h2 className="text-xl font-bold mb-2">Set Up Your First Budget</h2>
          <p className="mb-6">Let’s help you set a budget for a category.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => navigate('/dashboard')}>
            Finish & Go to Dashboard
          </button>
        </>
      )}
      </Card>
    </div>
  );
}