import { useState } from 'react';
import CardButton from '../../ui/card-btn/card-btn';
import Button from '../../ui/button/button';
import EditCategoryForm from '../../forms/edit-category-form/edit-category-form';
import type { Category } from '../../../types/category';
import { useAppDispatch, useAppState } from '../../../context/app-state-context';
import Modal from '../../ui/modal/modal';
import AddCategoryForm from '../../forms/add-category-form/add-category-form';

export default function CategoryManagement() {
  const { categories } = useAppState();
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [previousSelectedCategory, setPreviousSelectedCategory] = useState<Category | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    icon: '',
    color: '',
    id: 1,
  });
  const handleSelectedCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setPreviousSelectedCategory(selectedCategory);
    setFormState({
      name: category.name,
      icon: category.icon,
      color: category.color,
      id: category.id,
    });
  };
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      // Dispatch action to remove category
      dispatch({ type: 'REMOVE_CATEGORY', payload: { id: selectedCategory.id } });
      setSelectedCategory(previousSelectedCategory);
    }
    setIsConfirmModalOpen(false);
  };
  const handleSaveChanges = () => {
    if (selectedCategory) {
      // Dispatch action to update category
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...selectedCategory, ...formState } });
    }
  };
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
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Expense Categories
        </h3>
        <span className="w-auto">
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Add New Category
          </Button>
          {isModalOpen && (
            <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Add New Category
              </h2>
              <AddCategoryForm onClick={() => setIsModalOpen(false)} />
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
            onClick={() => handleSelectedCategoryChange(category)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {selectedCategory ? (
          <>
            <EditCategoryForm
              formState={formState}
              onFieldChange={(field, value) =>
                setFormState((prev) => ({ ...prev, [field]: value }))
              }
            />
            <div className="flex justify-end gap-2">
              <Button onClick={handleSaveChanges} variant="primary">
                Save Changes
              </Button>
              <Button
                onClick={() => setIsConfirmModalOpen(true)}
                variant="secondary"
              >
                Delete Category
              </Button>
            </div>
          </>
        ) : (
          <p>Select a category to edit</p>
        )}
      </div>
      {/* modal here */}

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
