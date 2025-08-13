import { useState } from 'react';
import DatePicker from '../../ui/date-picker/date-picker';
import Input from '../../ui/input/input';
import type { Currency } from '../../../types/currency';
import Button from '../../ui/button/button';

export type BudgetFormData = {
  id?: number;
  limit: number;
  name: string;
  categoryIds: number[];
  startDate: string;
  endDate: string;
};

interface BudgetFormProps {
  onCancel: () => void;
  onSubmit: (data: BudgetFormData) => void;
  budgetFormData?: BudgetFormData;
  currency: Currency;
}

export default function BudgetForm({
  budgetFormData,
  currency,
  onSubmit,
}: BudgetFormProps) {
  const [formState, setFormState] = useState<BudgetFormData>({
    id: budgetFormData?.id || 0,
    name: budgetFormData?.name || '',
    limit: budgetFormData?.limit || 0,
    categoryIds: budgetFormData?.categoryIds || [],
    startDate: budgetFormData?.startDate || '',
    endDate: budgetFormData?.endDate || '',
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState: BudgetFormData) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDatePickerChange = (
    field: keyof BudgetFormData,
    value: string | number
  ) => {
    setFormState((prevState: BudgetFormData) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(formState);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="name">Name</label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Enter budget name"
          />
        </div>
        <div>
          <label htmlFor="limit">Limit</label>
          <Input
            type="number"
            id="limit"
            name="limit"
            value={formState.limit}
            onChange={handleChange}
            placeholder={`${currency.symbol}0.00`}
          />
        </div>
        <div className="flex max-sm:flex-col gap-4">
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="startDate"
            >
              Start Date
            </label>
            <DatePicker
              id="startDate"
              name="startDate"
              value={formState.startDate}
              onChange={(date) => handleDatePickerChange('startDate', date)}
            />
          </div>
          <div className="w-full flex-1">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="endDate"
            >
              End Date
            </label>
            <DatePicker
              id="endDate"
              name="endDate"
              value={formState.endDate}
              onChange={(date) => handleDatePickerChange('endDate', date)}
              min={formState.startDate || undefined}
            />
          </div>
        </div>
        <div>
          <Button type="submit" onClick={() => void 0} variant="primary">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}

// const BudgetForm = forwardRef<BudgetFormRef, BudgetFormProps>(

//   ({ initialData }, ref) => {
//     const [formState, setFormState] = useState<BudgetFormData>(initialData);

//     const isFormValid =
//       formState.name.trim() !== '' &&
//       formState.limit > 0 &&
//       formState.startDate !== '' &&
//       formState.endDate !== '' &&
//       new Date(formState.endDate) > new Date(formState.startDate);

//     useEffect(() => {
//       if (initialData.id !== formState.id) {
//         setFormState(initialData);
//       }
//     }, [initialData.id]);

//     useImperativeHandle(ref, () => ({
//       getFormData: () => formState,
//       isValid: () => isFormValid,
//       reset: (newData?: BudgetFormData) => setFormState(newData || initialData),
//     }));

//     const updateField = (field: keyof BudgetFormData, value: string | number) => {
//       setFormState(prev => ({ ...prev, [field]: value }));
//     };

//     return (
//       <div className="flex flex-col gap-4">
//         <div>
//           <label htmlFor="name">Name</label>
//           <Input
//             type="text"
//             id="name"
//             value={formState.name}
//             onChange={(e) => updateField('name', e.target.value)}
//             placeholder="Enter budget name"
//           />
//         </div>
//         <div>
//           <label htmlFor="limit">Limit</label>
//           <Input
//             type="number"
//             id="limit"
//             value={formState.limit}
//             onChange={(e) => updateField('limit', Number(e.target.value))}
//             placeholder="Enter budget limit"
//           />
//         </div>
//         <div className="flex max-sm:flex-col gap-4">
//           <div className="w-full flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
//               Start Date
//             </label>
//             <DatePicker
//               id="startDate"
//               value={formState.startDate}
//               onChange={(date) => updateField('startDate', date)}
//             />
//           </div>
//           <div className="w-full flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
//               End Date
//             </label>
//             <DatePicker
//               id="endDate"
//               value={formState.endDate}
//               onChange={(date) => updateField('endDate', date)}
//               min={formState.startDate || undefined}
//             />
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// BudgetForm.displayName = 'BudgetForm';

// export default BudgetForm;
