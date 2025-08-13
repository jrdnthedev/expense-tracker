import { useEffect, useState } from 'react';
import { useNextId } from '../../../hooks/nextId/next-id';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';
import Button from '../../ui/button/button';

export type CategoryFormData = {
  name: string;
  icon: string;
  id?: number;
};

interface CategoryFormProps {
  onSubmit?: (data: CategoryFormData) => void;
  categories: Category[];
  categoryFormData?: CategoryFormData;
  onDelete?: () => void;
}

export default function CategoryForm({
  onSubmit,
  onDelete,
  categories,
  categoryFormData,
}: CategoryFormProps) {
  const nextId = useNextId<Category>(categories);
  const [formState, setFormState] = useState<CategoryFormData>({
    name: categoryFormData?.name || '',
    icon: categoryFormData?.icon || '➕',
    id: categoryFormData?.id || nextId,
  });
  const [errorState, setErrorState] = useState({
    name: '',
    icon: '',
  });

  useEffect(() => {
    if (categoryFormData) {
      setFormState({
        name: categoryFormData.name,
        icon: categoryFormData.icon,
      });
    }
  }, [categoryFormData]);

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      icon: '',
    };

    if (!formState.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formState.icon.trim()) {
      errors.icon = 'Icon is required';
    }

    setErrorState(errors);
    return !Object.values(errors).some((error) => error !== '');
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (errorState[name as keyof typeof errorState]) {
      setErrorState((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setFormState((prevState: CategoryFormData) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formState);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="category-form flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name">Category Name</label>
          <Input
            id="category-name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Category Name"
            type="text"
          />
          {errorState.name && <p className="text-red-500 text-sm mt-1">{errorState.name}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category-icon">Category Icon</label>
          <Input
            id="category-icon"
            name="icon"
            value={formState.icon}
            onChange={handleChange}
            placeholder="Category Icon"
            type="text"
          />
          {errorState.icon && <p className="text-red-500 text-sm mt-1">{errorState.icon}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={() => void 0} type="submit" variant="primary">
            Save Changes
          </Button>
          {categoryFormData && onDelete && (
            <Button onClick={onDelete} type="button" variant="secondary">
              Delete Category
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
