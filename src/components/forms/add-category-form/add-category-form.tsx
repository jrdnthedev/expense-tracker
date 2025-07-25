import { useState } from 'react';
// import { useAppState } from "../../../context/app-state-context";
import ColourPicker from '../../ui/colour-picker/colour-picker';
import Button from '../../ui/button/button';

export default function AddCategoryForm() {
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  //   const { categories } = useAppState();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // categories.addCategory({ name: categoryName, icon: categoryIcon, color: selectedColor });
    setCategoryName('');
    setCategoryIcon('');
    setSelectedColor('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-category-form">
      <div className="edit-category-form mb-4 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="icon-picker">Category Icon</label>
          <input
            type="text"
            value={categoryIcon}
            onChange={(e) => setCategoryIcon(e.target.value)}
            placeholder="Category Icon"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block font-medium" htmlFor="color-picker">Pick Color</label>
          <ColourPicker
            selectedColor={selectedColor}
            onChange={setSelectedColor}
          />
        </div>
        <Button
          type="submit"
          primary
          onClick={() =>
            console.log('Add category', {
              categoryName,
              categoryIcon,
              color: selectedColor,
            })
          }
        >
          Add Category
        </Button>
      </div>
    </form>
  );
}
