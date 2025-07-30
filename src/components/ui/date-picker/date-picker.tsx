export default function DatePicker({
  defaultValue,
  id,
  onChange,
  min,
}: DatePickerProps) {
  return (
    <input
      type="date"
      role="textbox"
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      id={id}
      defaultValue={defaultValue}
      onChange={(e) => onChange && onChange(e.target.value)}
      min={min}
    />
  );
}

interface DatePickerProps {
  defaultValue?: string;
  id?: string;
  onChange?: (date: string) => void;
  min?: string;
}
