import { useState } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import Button from '../../ui/button/button';

export default function CategoryManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = [
    { name: 'Food', icon: '🍕' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Fun', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
  ];

  return (
    <div className="border border-gray-900/10 max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-lg font-semibold text-gray-900 mb-2">
        ➕ Manage Categories
      </div>
      <div className="text-sm text-gray-500 mb-6">
        Easily manage your expense categories. Select a category to edit or
        delete.
      </div>
      <div>
        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Expense Categories</h3>
          <span className="w-auto">
            <Button onClick={() => console.log('Add new category')} primary>
              Add New Category
            </Button>
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => (
            <CardButton
              key={category.name}
              label={category.name}
              icon={category.icon}
              selected={selectedCategory === category.name}
              onClick={() => setSelectedCategory(category.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
