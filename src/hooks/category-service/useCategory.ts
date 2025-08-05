import { useEffect, useState } from "react";
import type { Category } from "../../types/category";
import { categoryDB } from "../../services/category-service/category.service";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryDB.getCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();

    return () => {
      setCategories([]);
      setError(null);
    };
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const id = await categoryDB.addCategory(category);
      setCategories(prev => [...prev, { ...category, id }]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding category');
      throw err;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      await categoryDB.updateCategory(category);
      setCategories(prev => 
        prev.map(c => c.id === category.id ? category : c)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating category');
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryDB.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory
  };
};