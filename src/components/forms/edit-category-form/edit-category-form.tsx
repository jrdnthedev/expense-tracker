import ColourPicker from '../../ui/colour-picker/colour-picker';
import Input from '../../ui/input/input';
export default function EditCategoryForm({
  formState,
  onFieldChange,
}: EditCategoryFormProps) {
  
  return (
    <>
      <div className="edit-category-form flex flex-col gap-2">
        <h2>Edit Category</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name">Category Name</label>
          <Input
            type="text"
            id="category-name"
            value={formState.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder="Category Name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="icon-picker">Category Icon</label>
          <Input
            type="text"
            id="category-icon"
            value={formState.icon}
            onChange={(e) => onFieldChange('icon', e.target.value)}
            placeholder="Category Icon"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block font-medium" htmlFor="color-picker">
            Pick Color
          </label>
          <ColourPicker
            selectedColor={formState.color}
            onChange={(color) => onFieldChange('color', color)}
          />
          <p>Selected Color: {formState.color}</p>
        </div>
      </div>
    </>
  );
}

interface EditCategoryFormProps {
  formState: {
    name: string;
    icon: string;
    color: string;
    id: number;
  };
  onFieldChange: (field: string, value: string | number) => void;
}
