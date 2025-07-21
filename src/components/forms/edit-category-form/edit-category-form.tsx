import Card from "../../ui/card/card";

export default function EditCategoryForm({ name, icon, color }: EditCategoryFormProps) {
  // This component will handle the form for editing categories
  return (
    <Card>
      <div className="edit-category-form">
        {/* Form implementation goes here */}
        <h2>Edit Category</h2>
        {name && <p>Current Name: {name}</p>}
        {icon && <p>Current Icon: {icon}</p>}
      {color && <p>Current Color: {color}</p>}
      {/* Add form fields and submit button */}
    </div>
    </Card>
  );
}

interface EditCategoryFormProps {
    name: string | undefined;
    icon: string | undefined;
    color: string | undefined;
}