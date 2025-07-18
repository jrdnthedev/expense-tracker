import ExpenseForm from './components/forms/expense-form/expense-form'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/layout/dashboard/dashboard';

function App() {
  return (
    <div className='p-4 bg-gray-100 min-h-screen'>
      <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/expenseform">Form</Link>
      </nav>
      <Routes>
        <Route path="/expenseform" element={<ExpenseForm />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
