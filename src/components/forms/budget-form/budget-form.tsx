import DatePicker from '../../ui/date-picker/date-picker';
import type { Category } from '../../../types/category';
import Input from '../../ui/input/input';

export default function BudgetForm({
  formState,
  onFieldChange,
}: BudgetFormProps) {
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="name">Name</label>
        <Input  
          type="text"
          id="name"
          value={formState.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFieldChange('name', e.target.value)
          }
          placeholder="Enter budget name"
        />
      </div>
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
  formState: {
    id?: number;
    limit: number;
    name: string;
    category: string;
    categoryIds: number[];
    startDate: string;
    endDate: string;
    expenseIds?: number[];
  };
  categories: Category[];
  onFieldChange: (field: string, value: string | number) => void;
}
