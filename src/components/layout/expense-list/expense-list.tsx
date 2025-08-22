import { useState } from 'react';
import Select from '../../ui/select/select';
import Card from '../../ui/card/card';
import { useDebounce } from '../../../hooks/debounce/use-debounce';
import type { Category } from '../../../types/category';
import type { Expense } from '../../../types/expense';
import Button from '../../ui/button/button';
import Modal from '../../ui/modal/modal';
import ExpenseForm from '../../forms/expense-form/expense-form';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import { formatAmount } from '../../../utils/currency';
import { formatDate } from '../../../utils/validators';
import EmptyState from '../../ui/empty-state/empty-state';
import Input from '../../ui/input/input';
import { getBudgetById } from '../../../utils/state';
import Badge from '../../ui/badge/badge';
import type { ExpenseFormData } from '../../../constants/form-data';

function DeleteConfirmationModal({
  expense,
  onClose,
  onDelete,
}: {
  expense: Expense;
  onClose: () => void;
  onDelete: (expense: Expense) => void;
}) {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <h3 className="text-lg font-semibold">Confirm Deletion</h3>
      <p>Are you sure you want to delete this expense?</p>
      <div className="flex justify-end mt-4 gap-4">
        <Button onClick={() => onDelete(expense)} variant="primary">
          Delete
        </Button>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default function ExpenseList() {
  const { categories, expenses, currency, budgets } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<Category>({
    id: 0,
    name: 'All',
    icon: '📦',
  });
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const categoriesWithAll: Category[] = [
    { id: 0, name: 'All', icon: '📦' },
    ...categories,
  ];
  const handleAdd = (data: ExpenseFormData) => {
    const newExpense: Expense = {
      ...data,
      amount: Number(data.amount),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
    console.log('Adding expense:', newExpense);
    setIsAddExpenseModalOpen(false);
  };

  const handleEdit = (data: ExpenseFormData) => {
    const updatedExpense: Expense = {
      ...data,
      id: Number(data.id),
      amount: Number(data.amount),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    console.log('Updating expense:', updatedExpense);
    setExpenseToEdit(null);
  };
  const handleDeleteExpense = (expense: Expense) => {
    dispatch({ type: 'REMOVE_EXPENSE', payload: { id: expense.id } });
    setExpenseToDelete(null);
  };
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold flex-1">📝 Expense List</h1>
      </div>
      {budgets.length > 0 ? (
        <>
          {categories.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-auto">
                  <Button
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    variant="primary"
                  >
                    Add Expense
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="search"
                    id="search"
                    name="search"
                    aria-label="Search expenses"
                    value={searchTerm}
                    onChange={handleSearchChange}
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
                      .map((expense: Expense) => {
                        const budget = getBudgetById(budgets, expense.budgetId);
                        const isCurrentOrPast = budget
                          ? new Date(budget.startDate) <= new Date()
                          : false;
                        return (
                          <li
                            key={expense.id}
                            className="flex-col flex sm:flex-row sm:items-center justify-between py-2 border-b border-gray-200 last-of-type:border-0 gap-2"
                          >
                            <div className="flex items-center">
                              <div>
                                <div className="flex gap-2">
                                  <h2 className="font-semibold">
                                    {expense.description}
                                  </h2>
                                  {!isCurrentOrPast && (
                                    <Badge
                                      message="Future Expense"
                                      variant="default"
                                    />
                                  )}
                                </div>
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
                                onClick={() => setExpenseToEdit(expense)}
                                variant="primary"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => setExpenseToDelete(expense)}
                                variant="secondary"
                              >
                                Delete
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                  </ul>

                  {expenseToDelete !== null && (
                    <DeleteConfirmationModal
                      expense={expenseToDelete}
                      onClose={() => setExpenseToDelete(null)}
                      onDelete={handleDeleteExpense}
                    />
                  )}

                  {expenseToEdit !== null && (
                    <Modal isOpen={true} onClose={() => setExpenseToEdit(null)}>
                      <h3 className="text-xl font-bold text-gray-800 mb-6">
                        Edit Expense
                      </h3>
                      <ExpenseForm
                        categories={categories}
                        budgets={budgets}
                        currency={currency}
                        onSubmit={handleEdit}
                        onCancel={() => setExpenseToEdit(null)}
                        expenseFormData={expenseToEdit}
                      />
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
            <Modal
              onClose={() => setIsAddExpenseModalOpen(false)}
              isOpen={true}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Add New Expense
              </h3>
              <ExpenseForm
                categories={categories}
                budgets={budgets}
                currency={currency}
                onSubmit={handleAdd}
                expenses={expenses}
                onCancel={() => setIsAddExpenseModalOpen(false)}
              />
            </Modal>
          )}
        </>
      ) : (
        <Card>
          <EmptyState
            title="No Budgets Found"
            description="Create a budget to start tracking your expenses."
            cta="Add Budget"
            link="budgetmanager"
          />
        </Card>
      )}
    </div>
  );
}
