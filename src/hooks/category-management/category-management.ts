import { useState, useCallback } from 'react';
import { useAppDispatch } from '../../context/app-state-hooks';
import type { Category } from '../../types/category';

const DEFAULT_CATEGORY_STATE: Category = {
  name: '',
  icon: '➕',
  id: 1,
};

export function useCategoryManagement(categories: Category[], nextId: number) {
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [previousSelectedCategory, setPreviousSelectedCategory] = 
    useState<Category | null>(categories[0] ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formState, setFormState] = useState(DEFAULT_CATEGORY_STATE);
  const [addCategoryFormState, setAddCategoryFormState] = useState<Category>({
    name: '',
    icon: '➕',
    id: nextId,
  });

  const handleSelectedCategoryChange = useCallback((category: Category) => {
    setSelectedCategory(category);
    setPreviousSelectedCategory(selectedCategory);
    setFormState({
      name: category.name,
      icon: category.icon,
      id: category.id,
    });
  }, [selectedCategory]);

  const handleDeleteCategory = useCallback(() => {
    if (selectedCategory) {
      dispatch({
        type: 'REMOVE_CATEGORY',
        payload: { id: selectedCategory.id },
      });
      setSelectedCategory(previousSelectedCategory);
    }
    setIsConfirmModalOpen(false);
  }, [dispatch, selectedCategory, previousSelectedCategory]);

  const handleSaveChanges = useCallback(() => {
    if (selectedCategory) {
      dispatch({
        type: 'UPDATE_CATEGORY',
        payload: { ...selectedCategory, ...formState },
      });
    }
  }, [dispatch, selectedCategory, formState]);

  const handleAddCategory = useCallback(() => {
    dispatch({ type: 'ADD_CATEGORY', payload: addCategoryFormState });
    setAddCategoryFormState({
      name: '',
      icon: '➕',
      id: nextId + 1,
    });
    setIsModalOpen(false);
  }, [dispatch, addCategoryFormState, nextId]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddFormChange = useCallback((field: string, value: string) => {
    setAddCategoryFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    selectedCategory,
    previousSelectedCategory,
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
  };
}