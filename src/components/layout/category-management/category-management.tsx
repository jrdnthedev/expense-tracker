import { useState } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import Button from '../../ui/button/button';
import EditCategoryForm from '../../forms/edit-category-form/edit-category-form';
import type { Category } from '../../../types/category';

export default function CategoryManagement() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const categories: Category[] = [
    { name: 'Food', icon: '🍕', color: 'bg-red-100', isDefault: true, id: 1 },
    { name: 'Transport', icon: '🚗', color: 'bg-blue-100', isDefault: false, id: 2 },
    { name: 'Fun', icon: '🎬', color: 'bg-green-100', isDefault: false, id: 3 },
    { name: 'Shopping', icon: '🛍️', color: 'bg-yellow-100', isDefault: false, id: 4 },
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
      <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Expense Categories</h3>
          <span className="w-auto">
            <Button onClick={() => console.log('Add new category')} primary>
              Add New Category
            </Button>
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {categories.map((category: Category) => (
            <CardButton
              key={category.id}
              label={category.name}
              icon={category.icon}
              selected={selectedCategory?.name === category.name}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>
        <div>
            {selectedCategory ? <EditCategoryForm name={selectedCategory?.name} icon={selectedCategory?.icon} color={selectedCategory?.color} /> : <p>Select a category to edit</p>}
        </div>
    </div>
  );
}
