import { useState } from "react";
import Card from "../../ui/card/card";
import ColourPicker from "../../ui/colour-picker/colour-picker";
import Button from "../../ui/button/button";

export default function EditCategoryForm({ name, icon, color }: EditCategoryFormProps) {
  const [selectedColor, setSelectedColor] = useState(color ?? "#000000");

  return (
    <Card>
      <div className="edit-category-form mb-4">
        <h2>Edit Category</h2>
        {name && <p>Current Name: {name}</p>}
        {icon && <p>Current Icon: {icon}</p>}
        <label className="block mb-2 font-medium" htmlFor="color-picker">Pick Color</label>
        <ColourPicker selectedColor={selectedColor} onChange={setSelectedColor} />
        <p className="mt-2">Selected Color: {selectedColor}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          onClick={() => console.log('Save changes ', { name, icon, color: selectedColor })}
          primary
        >
          Save Changes
        </Button>
        <Button
          onClick={() => console.log('Delete category')}
        >
          Delete Category
        </Button>
      </div>
    </Card>
  );
}

interface EditCategoryFormProps {
  name: string | undefined;
  icon: string | undefined;
  color: string | undefined;
}