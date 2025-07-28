import type React from "react";

export default function Button({ children, onClick, type = 'button', variant }: ButtonProps) {
    const classNames = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    }
    return (
        <button onClick={onClick} className={`flex-1 font-semibold py-2 px-4 rounded-md shadow transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${classNames[variant]}`} type={type}>
            {children}
        </button>
    );
}

interface ButtonProps {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    variant: 'primary' | 'secondary';
    onClick: () => void;
}