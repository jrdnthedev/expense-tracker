import CardButton from '../../ui/card-btn/card-btn';
import Button from '../../ui/button/button';
import type { Category } from '../../../types/category';
import Modal from '../../ui/modal/modal';
import { useAppState } from '../../../context/app-state-hooks';
import { useNextId } from '../../../hooks/nextId/next-id';
import CategoryForm from '../../forms/category-form/category-form';
import { useCategoryManagement } from '../../../hooks/category-management/category-management';

export default function CategoryManagement() {
  const { categories } = useAppState();
  const nextId = useNextId<Category>(categories);
  
  const {
    selectedCategory,
    isModalOpen,
    isConfirmModalOpen,
    formState,
    addCategoryFormState,
    setIsModalOpen,
    setIsConfirmModalOpen,
    handleSelectedCategoryChange,
    handleDeleteCategory,
    handleSaveChanges,
    handleAddCategory,
    handleFormChange,
    handleAddFormChange,
  } = useCategoryManagement(categories, nextId);
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
                  onFieldChange={(field, value) =>
                    handleAddFormChange(field, value)
                  }
                  formState={addCategoryFormState}
                />
                <Button onClick={handleAddCategory} variant="primary">
                  Add Category
                </Button>
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
            onClick={() => handleSelectedCategoryChange(category)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {selectedCategory ? (
          <>
            <CategoryForm
              formState={formState}
              onFieldChange={(field, value) =>
                handleFormChange(field, value)
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
