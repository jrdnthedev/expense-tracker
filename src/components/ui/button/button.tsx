import type React from "react";

export default function Button({ children, onClick, type = 'button', primary }: ButtonProps) {
    return (
        <button onClick={onClick} className={`flex-1 font-semibold py-2 px-4 rounded-md shadow transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${primary? ' bg-blue-600 hover:bg-blue-700 text-white':' bg-gray-200 hover:bg-gray-300 text-gray-800'}`} type={type}>
            {children}
        </button>
    );
}

interface ButtonProps {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    primary?: boolean;
    onClick: () => void;
}