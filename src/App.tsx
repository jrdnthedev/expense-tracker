import ExpenseForm from './components/forms/expense-form/expense-form'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ExpenseForm />} />
      </Routes>
    </Router>
  );
}

export default App;
