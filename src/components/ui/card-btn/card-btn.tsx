export default function CardButton({ label, icon, selected, onClick }: { label: string; icon?: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 border-2 rounded-lg cursor-pointer ${
        selected ? 'bg-blue-50 text-blue-700 font-medium focus:outline-none hover:bg-blue-100 transition-colors' : 'border-gray-200 hover:border-blue-400'
      }`}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}