import { Link } from 'react-router-dom';
export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-4">Track Expenses Effortlessly</h1>
      <p className="text-lg text-gray-600 mb-8">
        Organize your spending, set budgets, and gain insights with ease.
      </p>
      <Link to="/onboarding" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
        Get Started
      </Link>
    </div>
  );
}