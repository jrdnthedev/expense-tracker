export default function Select({ name, id, options, value, onChange }: SelectProps) {

  return (
    <select
      name={name}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  name: string;
  id: string;
  onChange: (value: string) => void;
}