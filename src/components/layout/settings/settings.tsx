import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';
import Button from '../../ui/button/button';
import ThemeToggle from '../../ui/theme-toggle/theme-toggle';
import DataManager from '../../ui/data-manager/data-manager';
import { CURRENCIES, type Currency } from '../../../types/currency';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import type { Category } from '../../../types/category';

// Helper components for better organization
interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
  hasBorder?: boolean;
}

function SettingRow({ title, description, children, hasBorder = true }: SettingRowProps) {
  return (
    <div className={`flex items-center gap-2 justify-between ${hasBorder ? 'border-b border-gray-200 dark:border-gray-700 pb-2' : ''}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
          <span className="text-gray-600 dark:text-gray-400">{description}</span>
        </div>
      </div>
      <div className="w-auto">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { currency, defaultCategory: stateDefaultCategory, categories } = useAppState();
  const [settingCurrency, setCurrency] = useState<Currency>(currency);
  const [defaultCategory, setDefaultCategory] = useState(stateDefaultCategory);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const dispatch = useAppDispatch();

  // Event handlers
  const handleCurrencyChange = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency);
    dispatch({ type: 'SET_CURRENCY', payload: selectedCurrency });
  };

  const handleDefaultCategoryChange = (_value: string, id: number) => {
    setDefaultCategory(id);
    dispatch({ type: 'SET_DEFAULT_CATEGORY', payload: { categoryId: id } });
  };

  const openDataManager = () => setIsDataManagerOpen(true);
  const closeDataManager = () => setIsDataManagerOpen(false);

  // Helper functions
  const getCategoryById = (id: number): string => {
    return categories.find((cat: Category) => cat.id === id)?.name || '';
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
            <SettingRow
              title="Currency"
              description="Display currency for all amounts"
            >
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
            </SettingRow>

            <SettingRow
              title="Default Category"
              description="Auto-select category for new expenses"
            >
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
            </SettingRow>

            <SettingRow
              title="Theme"
              description="Switch between light and dark mode"
              hasBorder={false}
            >
              <ThemeToggle />
            </SettingRow>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          💾 Data Management
        </h2>
        <div className="flex flex-col gap-4">
          <SettingRow
            title="Backup & Restore"
            description="Export your data or import from backup files"
            hasBorder={false}
          >
            <Button
              onClick={openDataManager}
              variant="primary"
            >
              Manage Data
            </Button>
          </SettingRow>
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
        onClose={closeDataManager}
      />
    </div>
  );
}
