import { useEffect, useState } from "react";
import ColourPicker from "../../ui/colour-picker/colour-picker";
import Button from "../../ui/button/button";
import { useAppDispatch } from "../../../context/app-state-context";

export default function EditCategoryForm({ name, icon, color,id }: EditCategoryFormProps) {
  const [selectedColor, setSelectedColor] = useState(color);
  const [categoryName, setCategoryName] = useState(name);
  const [categoryIcon, setCategoryIcon] = useState(icon);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectedColor(color);
    setCategoryName(name);
    setCategoryIcon(icon);
  }, [name, icon, color]);

  const handleSaveChanges = () => {
    dispatch({
      type: "UPDATE_CATEGORY",
      payload: { id: id, name: categoryName, icon: categoryIcon, color: selectedColor },
    });
  };

  const handleDeleteCategory = () => {
    dispatch({ type: "REMOVE_CATEGORY", payload: { id: id } });
  };
  return (
    <>
      <div className="edit-category-form mb-4 flex flex-col gap-2">
        <h2>Edit Category</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name">Category Name</label>
          <input type="text" id="category-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="icon-picker">Category Icon</label>
          <input type="text" id="icon-picker" value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block font-medium" htmlFor="color-picker">Pick Color</label>
          <ColourPicker selectedColor={selectedColor} onChange={setSelectedColor} />
          <p>Selected Color: {selectedColor}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          onClick={handleSaveChanges}
          primary
        >
          Save Changes
        </Button>
        <Button
          onClick={handleDeleteCategory}
        >
          Delete Category
        </Button>
      </div>
    </>
  );
}

interface EditCategoryFormProps {
  name: string;
  icon: string;
  color: string;
  id: number;
}