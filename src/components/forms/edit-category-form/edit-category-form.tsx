import { useEffect, useState } from 'react';
import ColourPicker from '../../ui/colour-picker/colour-picker';
import Button from '../../ui/button/button';
import { useAppDispatch } from '../../../context/app-state-context';
import Modal from '../../ui/modal/modal';
import Input from '../../ui/input/input';

export default function EditCategoryForm({
  name,
  icon,
  color,
  id,
}: EditCategoryFormProps) {
  const [selectedColor, setSelectedColor] = useState(color);
  const [categoryName, setCategoryName] = useState(name);
  const [categoryIcon, setCategoryIcon] = useState(icon);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectedColor(color);
    setCategoryName(name);
    setCategoryIcon(icon);
  }, [name, icon, color]);

  const handleSaveChanges = () => {
    dispatch({
      type: 'UPDATE_CATEGORY',
      payload: {
        id: id,
        name: categoryName,
        icon: categoryIcon,
        color: selectedColor,
      },
    });
  };

  const handleDeleteCategory = () => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: { id: id } });
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="edit-category-form mb-4 flex flex-col gap-2">
        <h2>Edit Category</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="category-name">Category Name</label>
          <Input
            type="text"
            id="category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="icon-picker">Category Icon</label>
          <Input
            type="text"
            id="category-icon"
            value={categoryIcon}
            onChange={(e) => setCategoryIcon(e.target.value)}
            placeholder="Category Icon"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="block font-medium" htmlFor="color-picker">
            Pick Color
          </label>
          <ColourPicker
            selectedColor={selectedColor}
            onChange={setSelectedColor}
          />
          <p>Selected Color: {selectedColor}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={handleSaveChanges} variant='primary'>
          Save Changes
        </Button>
        <Button onClick={() => setIsModalOpen(true)} variant='secondary'>Delete Category</Button>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <p>Are you sure you want to delete this category?</p>
              <div className="flex justify-end mt-4 gap-4">
                <Button onClick={handleDeleteCategory} variant='primary'>
                  Delete
                </Button>
                <Button onClick={() => setIsModalOpen(false)} variant='secondary'>
                  Cancel
                </Button>
              </div>
          </Modal>
        )}
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
