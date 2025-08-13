export default function DatePicker({
  value,
  id,
  onChange,
  name,
  min,
}: DatePickerProps) {
  return (
    <input
      type="date"
      role="textbox"
      name={name}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer focus:border-transparent
        active:outline-none active:border-transparent
        cursor-pointer
        [-webkit-appearance:none]
        [&:-webkit-autofill]:bg-white
        [&:-webkit-autofill:focus]:bg-white
        [&:-webkit-autofill:active]:bg-white"
      autoComplete="off"
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
  name?: string;
}
