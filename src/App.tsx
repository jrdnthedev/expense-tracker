import ExpenseForm from './components/forms/expense-form/expense-form'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/layout/dashboard/dashboard';
import BudgetManager from './components/layout/budget-manager/budget-manager';
import AnalyticsDashboard from './components/layout/analytics-dashboard/analytics-dashboard';
import Settings from './components/layout/settings/settings';

function App() {
  return (
    <div className='p-4 bg-gray-100 min-h-screen'>
      <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/expenseform">Form</Link>
        <Link to="/budgetmanager">Budget Manager</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <Routes>
        <Route path="/expenseform" element={<ExpenseForm />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/budgetmanager" element={<BudgetManager />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
