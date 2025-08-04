import Select from '../../ui/select/select';
import DatePicker from '../../ui/date-picker/date-picker';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';

export default function AddBudget({
  categories,
  formState,
  onFieldChange,
  periodOptions,
}: BudgetFormProps) {
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold ">Add Budget</h1>
      <div>
        <label htmlFor="limit">Limit</label>
        <Input  
          type="number"
          id="limit"
          value={formState.limit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFieldChange('limit', Number(e.target.value))
          }
          placeholder="Enter budget limit"
        />
      </div>

      <div className="flex gap-4">
        <div className="w-full flex-1 flex flex-col">
          <label htmlFor="category">Category</label>
          <Select
            id="category"
            name="Select Category"
            options={categories}
            onChange={(_value: string, dataId: number) => {
              const category = categories.find((cat: Category) => cat.id === dataId);
              if (category) {
                onFieldChange('category', category.name);
                onFieldChange('categoryId', category.id);
              }
            }}
            value={formState.category}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.name}
            getOptionId={(option) => option.id}
          />
        </div>
        <div className="w-full flex-1 flex flex-col">
          <label htmlFor="period">Period</label>
          <Select
            id="period"
            value={formState.period}
            name="Select Period"
            options={periodOptions}
            onChange={(_value: string, dataId: number) =>{
              const option = periodOptions.find(opt => opt.id === dataId);
              if (option) {
                onFieldChange('period', option.value);
              }
            }}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            getOptionId={(option) => option.id}
          />
        </div>
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
            value={formState.startDate}
            onChange={(date: string) => onFieldChange('startDate', date)}
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
            value={formState.endDate}
            onChange={(date: string) => onFieldChange('endDate', date)}
            min={formState.startDate || undefined}
          />
        </div>
      </div>
    </div>
  );
}

interface BudgetFormProps {
  categories: Category[];
  formState: {
    limit: number;
    category: string;
    categoryId: number;
    period: string;
    startDate: string;
    endDate: string;
  };
  periodOptions: { value: string; label: string; id: number }[];
  onFieldChange: (field: string, value: string | number) => void;
}
