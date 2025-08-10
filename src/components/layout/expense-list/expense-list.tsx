import {useState } from 'react';
import Select from '../../ui/select/select';
import Card from '../../ui/card/card';
import { useDebounce } from '../../../hooks/debounce/use-debounce';
import type { Category } from '../../../types/category';
import type { Expense } from '../../../types/expense';
import Button from '../../ui/button/button';
import Modal from '../../ui/modal/modal';
import ExpenseForm from '../../forms/expense-form/expense-form';
import { useAppState } from '../../../context/app-state-hooks';
import { useNextId } from '../../../hooks/nextId/next-id';
import { formatAmount } from '../../../utils/currency';
import { formatDate } from '../../../utils/validators';
import EmptyState from '../../ui/empty-state/empty-state';
import { useExpenseManagement } from '../../../hooks/expense-management/expense-management';
import Input from '../../ui/input/input';

function DeleteConfirmationModal({
  expenseId,
  onClose,
  onDelete,
}: {
  expenseId: number;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <h3 className="text-lg font-semibold">Confirm Deletion</h3>
      <p>Are you sure you want to delete this expense?</p>
      <div className="flex justify-end mt-4 gap-4">
        <Button onClick={() => onDelete(expenseId)} variant="primary">
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
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const id = useNextId<Expense>(expenses);
  
  const {
    expenseToEdit,
    expenseToDelete,
    formState,
    isAddExpenseModalOpen,
    setExpenseToDelete,
    setIsAddExpenseModalOpen,
    handleFieldChange,
    handleDeleteExpense,
    handleSave,
    handleReset,
    handleFormEdit,
    handleAddExpense,
  } = useExpenseManagement(categories, budgets);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const categoriesWithAll: Category[] = [
    { id: 0, name: 'All', icon: '📦' },
    ...categories,
  ];

  console.log("expenses:", expenses);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold flex-1">📝 Expense List</h1>
      </div>
      {budgets.length > 0 ? (
        <>
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
                  {/* <input
                    type="text"
                    name="search"
                    id="search"
                    aria-label="Search expenses"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search expenses..."
                  /> */}
                  <Input
                    type="search"
                    id="search"
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
                      .map((expense: Expense) => (
                        <li
                          key={expense.id}
                          className="flex items-center justify-between py-2 border-b border-gray-200 last-of-type:border-0"
                        >
                          <div className="flex items-center">
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
                    <DeleteConfirmationModal
                      expenseId={expenseToDelete}
                      onClose={() => setExpenseToDelete(null)}
                      onDelete={handleDeleteExpense}
                    />
                  )}
                  {expenseToEdit !== null && (
                    <Modal isOpen={true} onClose={handleReset}>
                      <h3 className="text-xl font-bold text-gray-800 mb-6">
                        Edit Expense
                      </h3>
                      <ExpenseForm
                        categories={categories}
                        budgets={budgets}
                        formState={formState}
                        onFieldChange={handleFieldChange}
                        currency={currency}
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
                formState={formState}
                onFieldChange={handleFieldChange}
                currency={currency}
              />
              <Button onClick={() => handleAddExpense(id)} variant="primary">
                Add Expense
              </Button>
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
