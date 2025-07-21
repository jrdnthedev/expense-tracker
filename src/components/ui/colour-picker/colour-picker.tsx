export default function ColourPicker({
  selectedColor,
  onChange,
}: {
  selectedColor: string;
  onChange: (color: string) => void;
}) {
  return (
    <input
      type="color"
      id="color-picker"
      value={selectedColor}
      onChange={(e) => onChange(e.target.value)}
      className="border-gray-300 p-0 w-full rounded-lg"
    />
  );
}
