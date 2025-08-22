import { useEffect } from 'react';
import { useNextId } from '../../../hooks/nextId/next-id';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';
import Button from '../../ui/button/button';
import useFormManagement from '../../../hooks/form-management/form-management';
import type { CategoryFormData } from '../../../constants/form-data';

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
  const validationRules = {
    name: (value: string) => (!value.trim() ? 'Name is required' : ''),
    icon: (value: string) => (!value.trim() ? 'Icon is required' : ''),
  };

  const { formState, errorState, handleChange, handleSubmit, setFormState } =
    useFormManagement<CategoryFormData>({
      initialFormState: {
        name: categoryFormData?.name || '',
        icon: categoryFormData?.icon || '➕',
        id: categoryFormData?.id || nextId,
      },
      onSubmit: onSubmit || (() => {}),
      initialErrorState: {
        name: '',
        icon: '',
      },
      validationRules,
    });

  useEffect(() => {
    if (categoryFormData) {
      setFormState({
        name: categoryFormData.name,
        icon: categoryFormData.icon,
      });
    }
  }, [categoryFormData, setFormState]);

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
          {errorState.name && (
            <p className="text-red-500 text-sm mt-1">{errorState.name}</p>
          )}
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
          {errorState.icon && (
            <p className="text-red-500 text-sm mt-1">{errorState.icon}</p>
          )}
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
