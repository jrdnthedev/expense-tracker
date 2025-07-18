export default function Button({ label, onClick, type = 'button', primary }: ButtonProps) {
    return (
        <button onClick={onClick} className={`flex-1 font-semibold py-2 px-4 rounded-md shadow transition-colors cursor-pointer${primary? ' bg-blue-600 hover:bg-blue-700 text-white':' bg-gray-200 hover:bg-gray-300 text-gray-800'}`} type={type}>
            {label}
        </button>
    );
}

interface ButtonProps {
    label: string;
    type?: 'button' | 'submit' | 'reset';
    primary?: boolean;
    onClick: () => void;
}