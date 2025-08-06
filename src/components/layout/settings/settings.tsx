import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';
import { CURRENCIES, type Currency } from '../../../types/currency';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import type { Category } from '../../../types/category';
import BudgetAlert from '../../ui/alert/alert';
import { checkBudgetThreshold } from '../../../utils/budget';

export default function Settings() {
  const {
    currency,
    defaultCategory: stateDefaultCategory,
    categories,
    budgets,
    expenses,
  } = useAppState();
  const [settingCurrency, setCurrency] = useState<Currency>(currency);
  const [defaultCategory, setDefaultCategory] = useState(stateDefaultCategory);
  const dispatch = useAppDispatch();

  const handleCurrencyChange = (currency: Currency) => {
    setCurrency(currency);
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };
  const handleDefaultCategoryChange = (_value: string, id: number) => {
    setDefaultCategory(id);
    dispatch({ type: 'SET_DEFAULT_CATEGORY', payload: { categoryId: id } });
  };
  const getCategoryById = (id: number) => {
    return categories.find((cat) => cat.id === id)?.name || '';
  };

  const budgetAlerts = budgets
    .map((budget) => {
      // Get all expenses that belong to categories associated with this budget
      const budgetExpenses = expenses.filter((expense) =>
        budget.categoryIds.includes(expense.categoryId)
      );

      const { remainingBudget, percentageUsed, isApproachingLimit } =
        checkBudgetThreshold(budget, budgetExpenses);

      if (!isApproachingLimit) return null;

      // Find the first category for display purposes
      const category = categories.find((cat) =>
        budget.categoryIds.includes(cat.id)
      );
      if (!category) return null;

      return (
        <BudgetAlert
          key={budget.id}
          budgetName={budget.name}
          remainingBudget={remainingBudget}
          percentageUsed={percentageUsed}
          currency={currency}
        />
      );
    })
    .filter(Boolean);
  const currencyOptions = Object.values(CURRENCIES);
  return (
    <div className="settings-container">
      <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>
      <p className="text-gray-600 mb-6">
        Manage your application settings and preferences here.
      </p>
      <div className="mb-4">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            💰 General Settings
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-medium">Currency</span>
                  <span className="text-gray-600">
                    Display currency for all amounts
                  </span>
                </div>
              </div>
              <div className="w-auto">
                <Select
                  name="currency"
                  id="currency"
                  options={currencyOptions}
                  value={settingCurrency.label}
                  onChange={(_value, id) => {
                    const selected = currencyOptions.find((c) => c.id === id);
                    if (selected) handleCurrencyChange(selected);
                  }}
                  getOptionValue={(option: Currency) => option.label}
                  getOptionLabel={(option: Currency) => option.label}
                  getOptionId={(option: Currency) => option.id}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-medium">Default Category</span>
                  <span className="text-gray-600">
                    Auto-select category for new expenses
                  </span>
                </div>
              </div>
              <div className="w-auto">
                {categories.length > 0 ? (
                  <Select
                    name="default-category"
                    id="default-category"
                    options={categories}
                    value={getCategoryById(defaultCategory)}
                    onChange={handleDefaultCategoryChange}
                    getOptionValue={(cat: Category) => cat.name}
                    getOptionLabel={(cat: Category) => cat.name}
                    getOptionId={(cat: Category) => cat.id}
                  />
                ) : (
                  <span className="text-gray-600">No categories available</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          🔔 Notifications
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-between pb-2">
            <div className="text-gray-600 flex flex-col gap-4">
              {budgetAlerts.length > 0 ? (
                budgetAlerts
              ) : (
                <p className="text-gray-600">No budget alerts at this time</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
