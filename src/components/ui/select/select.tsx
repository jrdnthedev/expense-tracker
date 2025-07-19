export default function Select({ name, id, options, selected, onChange }: SelectProps) {
  return (
    <select
      name={name}
      id={id}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="w-40 border border-gray-300 rounded-md px-2 py-1"
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
  selected: string;
  name: string;
  id: string;
  onChange: (value: string) => void;
}