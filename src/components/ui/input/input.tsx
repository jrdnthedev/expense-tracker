export default function Input({
  value,
  onChange,
  placeholder,
  type,
  id,
  required
}: InputProps) {
  return (
    <input
      type={type}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      id={id}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      required={required}
    />
  );
}

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  id?: string;
  required?: boolean;
}
