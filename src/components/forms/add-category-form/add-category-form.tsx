import ColourPicker from '../../ui/colour-picker/colour-picker';
import Input from '../../ui/input/input';

export default function AddCategoryForm({
  onFieldChange,
  formState,
}: AddCategoryFormProps) {
  return (
    <>
      <div className="edit-category-form flex flex-col gap-2">
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
            onChange={() => void 0}
            placeholder="Category Icon"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block font-medium" htmlFor="color-picker">
            Pick Color
          </label>
          <ColourPicker
            selectedColor={formState.color}
            onChange={(color: string) => onFieldChange('color', color)}
          />
        </div>
      </div>
    </>
  );
}

interface AddCategoryFormProps {
  formState: {
    name: string;
    icon: string;
    color: string;
  };
  onFieldChange: (field: string, value: string | number) => void;
}
