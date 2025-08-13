import CardButton from '../../ui/card-btn/card-btn';
import Button from '../../ui/button/button';
import type { Category } from '../../../types/category';
import Modal from '../../ui/modal/modal';
import { useAppDispatch, useAppState } from '../../../context/app-state-hooks';
import { useNextId } from '../../../hooks/nextId/next-id';
import CategoryForm, { type CategoryFormData } from '../../forms/category-form/category-form';
import { useState } from 'react';

export default function CategoryManagement() {
  const { categories } = useAppState();
  const dispatch = useAppDispatch();
  const nextId = useNextId<Category>(categories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [previousSelectedCategory, setPreviousSelectedCategory] = 
    useState<Category | null>(categories[0] ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleAddCategory = (data: CategoryFormData) => {
    dispatch({ type: 'ADD_CATEGORY', payload: { ...data, id: nextId } });
    setIsModalOpen(false);
    console.log(data);
  };
  const handleEditCategory = (data: CategoryFormData) => {
    if (selectedCategory) {
      dispatch({
        type: 'UPDATE_CATEGORY',
        payload: { ...selectedCategory, ...data },
      });
    }
    console.log('Editing Category:', data);
  };
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      dispatch({
        type: 'REMOVE_CATEGORY',
        payload: { id: selectedCategory.id },
      });
      setSelectedCategory(previousSelectedCategory);
    }
    setIsConfirmModalOpen(false);
    console.log('Deleting Category:', selectedCategory);
  };
  return (
    <div className="border border-gray-900/10 max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-lg font-semibold text-gray-900 mb-2">
        <h1 className="text-xl font-bold text-gray-800">➕ Manage Categories</h1>
      </div>
      <div className="text-sm text-gray-500 mb-6">
        Easily manage your expense categories. Select a category to edit or
        delete.
      </div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Expense Categories
        </h2>
        <span className="w-auto">
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Add New Category
          </Button>
          {isModalOpen && (
            <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Add New Category
              </h2>
              <div className="flex flex-col gap-4">
                <CategoryForm
                  categories={categories}
                  onSubmit={handleAddCategory}
                />
              </div>
            </Modal>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {categories.map((category: Category) => (
          <CardButton
            key={category.id}
            label={category.name}
            icon={category.icon}
            selected={selectedCategory?.name === category.name}
            onClick={() => {setSelectedCategory(category); setPreviousSelectedCategory(category);}}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {selectedCategory ? (
          <>
            <CategoryForm
              categories={categories}
              onSubmit={handleEditCategory}
              categoryFormData={selectedCategory}
              onDelete={() => setIsConfirmModalOpen(true)}
            />
            
          </>
        ) : (
          <p>Select a category to edit</p>
        )}
      </div>
      {isConfirmModalOpen && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
        >
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          <p>Are you sure you want to delete this category?</p>
          <div className="flex justify-end mt-4 gap-4">
            <Button onClick={handleDeleteCategory} variant="primary">
              Delete
            </Button>
            <Button
              onClick={() => setIsConfirmModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
