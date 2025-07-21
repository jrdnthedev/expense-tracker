import { useState } from 'react';
import Card from '../../ui/card/card';
import Select from '../../ui/select/select';

export default function Settings() {
  const [currency, setCurrency] = useState('usd');
  const [defaultCategory, setDefaultCategory] = useState('food');
  const categories = [
    { value: 'food', label: 'Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'fun', label: 'Fun' },
  ];
  const currencies = [
    { value: 'usd', label: 'USD' },
    { value: 'eur', label: 'EUR' },
    { value: 'gbp', label: 'GBP' },
  ];
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
              <div className='w-auto'>
                <Select
                name="currency"
                id="currency"
                options={currencies}
                value={currency}
                onChange={setCurrency}
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
              <div className='w-auto'>
                <Select
                name="default-category"
                id="default-category"
                options={categories}
                value={defaultCategory}
                onChange={setDefaultCategory}
              />
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
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="font-medium">Budget Alerts</span>
                <span className="text-gray-600">
                  Notify when approaching budget limits
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
