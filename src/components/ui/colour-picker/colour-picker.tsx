import type React from 'react';

const normalizeHexColor = (color: string): string => {
  if (!color) return '';

  // Determine if original color was uppercase
  const isUpperCase = color === color.toUpperCase();

  // Remove # if present
  const hex = color.replace('#', '');

  // Validate hex format (3 or 6 digits)
  const isValid3Digit = /^[A-Fa-f0-9]{3}$/.test(hex);
  const isValid6Digit = /^[A-Fa-f0-9]{6}$/.test(hex);

  if (!isValid3Digit && !isValid6Digit) {
    return color;
  }

  // For 3-digit hex, expand to 6 digits
  if (isValid3Digit) {
    const expanded = hex
      .split('')
      .map((char) => char + char)
      .join('');
    // Return in original case
    return isUpperCase
      ? `#${expanded.toUpperCase()}`
      : `#${expanded.toLowerCase()}`;
  }

  // For 6-digit hex, preserve original case
  return isUpperCase ? `#${hex.toUpperCase()}` : `#${hex.toLowerCase()}`;
};

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
      role="textbox"
      id="color-picker"
      value={normalizeHexColor(selectedColor)}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(normalizeHexColor(e.target.value))
      }
      className="border-gray-300 p-0 w-full rounded-lg"
    />
  );
}
