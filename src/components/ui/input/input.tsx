export default function Input({
  value,
  onChange,
  placeholder,
  type,
  id,
  required,
}: InputProps) {
  return (
    <input
      type={type}
      className="w-full rounded-md border border-gray-300 px-3 py-2 
        focus:outline-none focus:ring-2 focus:ring-blue-500 
        focus:border-transparent
        active:outline-none active:border-transparent
        cursor-pointer
        focus:border-transparent
        active:outline-none active:border-transparent
        cursor-pointer
        [-webkit-appearance:none]
        [&:-webkit-autofill]:bg-white
        [&:-webkit-autofill:focus]:bg-white
        [&:-webkit-autofill:active]:bg-white"
      id={id}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      required={required}
      autoComplete="off"
    />
  );
}

interface InputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  id?: string;
  required?: boolean;
}
