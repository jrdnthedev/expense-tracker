import { useState } from 'react';
// import { useAppState } from "../../../context/app-state-context";
import ColourPicker from '../../ui/colour-picker/colour-picker';
import Button from '../../ui/button/button';
import { useAppDispatch } from '../../../context/app-state-context';
import Input from '../../ui/input/input';

export default function AddCategoryForm({onClick}: {onClick: () => void}) {
  const [categoryName, setCategoryName] = useState('');
  const categoryIcon = '➕'; // Placeholder for icon input
  const [selectedColor, setSelectedColor] = useState('#000000');
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    dispatch({ type: 'ADD_CATEGORY', payload: { id: 5, name: categoryName, icon: categoryIcon, color: selectedColor } });
    onClick();
    setCategoryName('');
    setSelectedColor('#000000');
  };

  return (
    <form onSubmit={handleSubmit} className="add-category-form">
      <div className="edit-category-form mb-4 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name">Category Name</label>
          <Input
            id="category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="icon-picker">Category Icon</label>
          <Input
            id="category-icon"
            value={categoryIcon}
            onChange={() => void 0}
            placeholder="Category Icon"
            type="text"
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
          variant='primary'
          onClick={() => void 0}
        >
          Add Category
        </Button>
      </div>
    </form>
  );
}
