export default function Select<T>({
  name,
  id,
  options,
  value,
  onChange,
  getOptionValue,
  getOptionLabel,
  getOptionId,
}: SelectProps<T>) {
  return (
    <select
      name={name}
      id={id}
      value={value}
      aria-label={name}
      title={name}
      onChange={(e) => {
        const selectedIndex = e.target.selectedIndex;
        const selectedOption = e.target.options[selectedIndex];
        const dataId = selectedOption.getAttribute('data-id');
        onChange(e.target.value, Number(dataId));
      }}
      className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        active:outline-none active:border-transparent
        cursor-pointer
        [&:-webkit-autofill]:bg-white
        [&:-webkit-autofill:focus]:bg-white
        [&:-webkit-autofill:active]:bg-white"
      autoComplete="off"
    >
      {options.map((option: T) => (
        <option
          key={getOptionValue(option)}
          value={getOptionValue(option)}
          data-id={getOptionId(option)}
        >
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
  onChange: (value: string, dataId: number) => void;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionId: (option: T) => number;
}
