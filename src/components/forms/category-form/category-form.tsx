import Input from '../../ui/input/input';

export default function CategoryForm({ formState, onFieldChange }: CategoryFormProps) {
  return (
    <div className="category-form flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="category-name">Category Name</label>
        <Input
          id="category-name"
          value={formState.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFieldChange('name', e.target.value)
          }
          placeholder="Category Name"
          type="text"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="icon-picker">Category Icon</label>
        <Input
          id="category-icon"
          value={formState.icon}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFieldChange('icon', e.target.value)
          }
          placeholder="Category Icon"
          type="text"
          required
        />
      </div>
    </div>
  );
}

interface CategoryFormProps {
  formState: {
    name: string;
    icon: string;
    id?: number;
  };
  onFieldChange: (field: string, value: string) => void;
}