export default function DatePicker({
  value,
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
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      min={min}
    />
  );
}

interface DatePickerProps {
  value?: string;
  id?: string;
  onChange?: (date: string) => void;
  min?: string;
}
