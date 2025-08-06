import { useCallback, useState } from 'react';
import Select from '../../ui/select/select';
import Card from '../../ui/card/card';
import { useDebounce } from '../../../hooks/debounce/use-debounce';
import type { Category } from '../../../types/category';
import type { Expense } from '../../../types/expense';
import Button from '../../ui/button/button';
import Modal from '../../ui/modal/modal';
import ExpenseForm from '../../forms/expense-form/expense-form';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import { useNextId } from '../../../hooks/nextId/next-id';
import { formatAmount } from '../../../utils/currency';
import { getBudgetStartDate } from '../../../utils/budget';
import { formatDate } from '../../../utils/validators';
import EmptyState from '../../ui/empty-state/empty-state';

export default function ExpenseList() {
  const { categories, expenses, currency, budgets } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: 0,
    name: 'All',
    color: '',
    icon: '📦',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [formState, setFormState] = useState<Expense>({
    amount: expenseToEdit?.amount ?? 0,
    description: expenseToEdit?.description ?? '',
    category: expenseToEdit?.category ?? '',
    categoryId: expenseToEdit?.categoryId ?? categories[0]?.id ?? 1,
    budget: expenseToEdit?.budget ?? '',
    budgetId: expenseToEdit?.budgetId ?? 0,
    createdAt: expenseToEdit?.createdAt ?? new Date().toISOString(),
    updatedAt: expenseToEdit?.updatedAt ?? new Date().toISOString(),
    id: expenseToEdit?.id ?? 0,
  });
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const handleFieldChange = useCallback(
    (field: string, value: string | number) =>
      setFormState((prev) => ({ ...prev, [field]: value })),
    []
  );
  const id = useNextId<Expense>(expenses);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const categoriesWithAll: Category[] = [
    { id: 0, name: 'All', color: '', icon: '📦' },
    ...categories,
  ];
  const handleDeleteExpense = (id: number) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: { id } });
    setExpenseToDelete(null);
  };
  const handleSave = () => {
    if (!expenseToEdit || typeof expenseToEdit.id !== 'number') {
      return;
    }

    const newCategory =
      categories.find((cat: Category) => cat.id === formState.categoryId)
        ?.name ?? '';

    const updatedExpense: Expense = {
      ...formState,
      id: formState.id,
      amount: Number(formState.amount),
      description: formState.description,
      category: newCategory.toLowerCase(),
      categoryId: formState.categoryId,
      // date: formState.date,
      createdAt: formState.createdAt,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    setExpenseToEdit(null);
  };
  const handleReset = () => {
    setFormState({
      amount: 0,
      description: '',
      category: '',
      categoryId: categories[0]?.id ?? 1,
      // date: '',
      // tags: [],
      budget: '',
      budgetId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: 0,
    });
    setExpenseToEdit(null);
  };
  const handleFormEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setFormState({
      ...expense,
      amount: Number(formState.amount),
      description: formState.description,
      category:
        categories.find((cat) => cat.id === formState.categoryId)?.name || '',
      categoryId: formState.categoryId,
      // date: expense.date,
    });
  };
  const handleAddExpense = () => {
    const newExpense: Expense = {
      id: id,
      amount: Number(formState.amount),
      description: formState.description,
      category:
        categories.find((cat) => cat.id === formState.categoryId)?.name || '',
      categoryId: formState.categoryId,
      budget: formState.budget,
      budgetId: formState.budgetId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Adding new expense:', newExpense);
    console.log('Current budgets:', budgets);
    console.log('Current expenses:', expenses);
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });

    if (formState.budgetId) {
      const budget = budgets.find((b) => b.id === formState.budgetId);
      if (budget) {
        const updatedBudget = {
          ...budget,
          expenseIds: [...budget.expenseIds, newExpense.id],
        };
        console.log('Updating budget:', updatedBudget.expenseIds);
        // dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
      }
    }
    setIsAddExpenseModalOpen(false);
    setFormState({
      amount: 0,
      description: '',
      category: '',
      categoryId: categories[0]?.id ?? 1,
      budget: '',
      budgetId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold flex-1">📝 Expense List</h1>
      </div>
      {categories.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="w-auto">
              <Button
                onClick={() => setIsAddExpenseModalOpen(true)}
                variant="primary"
              >
                Add Expense
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                name="search"
                id="search"
                aria-label="Search expenses"
                value={searchTerm}
                onChange={handleSearchChange}
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search expenses..."
              />
              <div className="w-auto">
                <Select
                  name="sort"
                  id="sort"
                  options={categoriesWithAll}
                  onChange={(_value: string, dataId: number) => {
                    const category = categoriesWithAll.find(
                      (cat: Category) => cat.id === dataId
                    );
                    if (category) setSelectedCategory(category);
                  }}
                  value={selectedCategory.name}
                  getOptionValue={(cat: Category) => cat.name}
                  getOptionLabel={(cat: Category) => cat.name}
                  getOptionId={(cat: Category) => cat.id}
                />
              </div>
            </div>
          </div>
          <div>
            <Card>
              <ul>
                {expenses
                  .filter(
                    (expense: Expense) =>
                      (selectedCategory.id === 0 ||
                        expense.categoryId === selectedCategory.id) &&
                      (debouncedSearchTerm === '' ||
                        expense.description
                          .toLowerCase()
                          .includes(debouncedSearchTerm.toLowerCase()))
                  )
                  .map((expense: Expense) => (
                    <li
                      key={expense.id}
                      className="flex items-center justify-between py-2 border-b border-gray-200 last-of-type:border-0"
                    >
                      <div className="flex items-center">
                        {/* <span className="text-xl mr-2">{expense.icon}</span> */}
                        <div>
                          <h2 className="font-semibold">
                            {expense.description}
                          </h2>
                          <p className="text-gray-500">
                            {formatDate(expense.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xl text-green-700 font-semibold">
                          {formatAmount(expense.amount, currency)}
                        </span>
                        <Button
                          onClick={() => handleFormEdit(expense)}
                          variant="primary"
                        >
                          Edit
                        </Button>

                        <Button
                          onClick={() => setExpenseToDelete(expense.id)}
                          variant="secondary"
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
              {expenseToDelete !== null && (
                <Modal isOpen={true} onClose={() => setExpenseToDelete(null)}>
                  <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                  <p>Are you sure you want to delete this expense?</p>
                  <div className="flex justify-end mt-4 gap-4">
                    <Button
                      onClick={() => handleDeleteExpense(expenseToDelete)}
                      variant="primary"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => setExpenseToDelete(null)}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </Modal>
              )}
              {expenseToEdit !== null && (
                <Modal isOpen={true} onClose={handleReset}>
                  <ExpenseForm
                    categories={categories}
                    budgets={budgets}
                    formState={formState}
                    onFieldChange={handleFieldChange}
                    currency={currency}
                    minDate={getBudgetStartDate(formState.categoryId, budgets)}
                  />
                  <div className="flex justify-end mt-4 gap-4">
                    <Button onClick={handleSave} variant="primary">
                      Save
                    </Button>
                    <Button onClick={handleReset} variant="secondary">
                      Cancel
                    </Button>
                  </div>
                </Modal>
              )}
            </Card>
          </div>
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
      {isAddExpenseModalOpen && (
        <Modal onClose={() => setIsAddExpenseModalOpen(false)} isOpen={true}>
          <ExpenseForm
            categories={categories}
            budgets={budgets}
            formState={formState}
            onFieldChange={handleFieldChange}
            currency={currency}
          />
          <Button onClick={handleAddExpense} variant="primary">
            Add Expense
          </Button>
        </Modal>
      )}
    </div>
  );
}
