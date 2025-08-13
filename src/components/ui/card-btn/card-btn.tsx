export default function CardButton({ label, icon, selected, onClick }: CardButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg focus:ring-2 focus:border-0 focus:outline-none focus:ring-blue-500 cursor-pointer ${
        selected ? 'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors' : 'border-gray-200 hover:border-blue-400'
      }`}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

interface CardButtonProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onClick: () => void;
}