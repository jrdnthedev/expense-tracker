export default function Select<T>({ name, id, options, value, onChange,getOptionValue, getOptionLabel, }: SelectProps<T>) {

  return (
    <select
      name={name}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={getOptionValue(option)} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  );
}

interface SelectProps<T> {
  options: T[];
  value: string;
  name: string;
  id: string;
  onChange: (value: string) => void;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
}