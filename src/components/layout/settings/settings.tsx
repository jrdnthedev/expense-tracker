import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';
import { CURRENCIES, type Currency } from '../../../types/currency';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import type { Category } from '../../../types/category';
import ThemeToggle from '../../ui/theme-toggle/theme-toggle';
import Button from '../../ui/button/button';
import DataManager from '../../ui/data-manager/data-manager';

export default function Settings() {
  const {
    currency,
    defaultCategory: stateDefaultCategory,
    categories,
  } = useAppState();
  const [settingCurrency, setCurrency] = useState<Currency>(currency);
  const [defaultCategory, setDefaultCategory] = useState(stateDefaultCategory);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
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
  
  const currencyOptions = Object.values(CURRENCIES);
  return (
    <div className="settings-container flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">⚙️ Settings</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Manage your application settings and preferences here.
      </p>
      <div>
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            💰 General Settings
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Currency</span>
                  <span className="text-gray-600 dark:text-gray-400">
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
            <div className="flex items-center gap-2 justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Default Category</span>
                  <span className="text-gray-600 dark:text-gray-400">
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
                  <span className="text-gray-600 dark:text-gray-400">No categories available</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Theme</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Switch between light and dark mode
                  </span>
                </div>
              </div>
              <div className="w-auto">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          💾 Data Management
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-between pb-2">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-100">Backup & Restore</span>
              <span className="text-gray-600 dark:text-gray-400">
                Export your data or import from backup files
              </span>
            </div>
            <div className="w-auto">
              <Button
                onClick={() => setIsDataManagerOpen(true)}
                variant="primary"
              >
                Manage Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🔔 Notifications
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-between pb-2">
            <div className="text-gray-600 dark:text-gray-400 flex flex-col gap-4">
            </div>
          </div>
        </div>
      </Card>

      <DataManager
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </div>
  );
}
