import type React from "react";

export default function Button({ children, onClick, type = 'button', variant, disabled }: ButtonProps) {
    const classNames = {
        primary: 'transition-colors focus:ring-2 focus:ring-blue-500 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'transition-colors focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800',
        disabled: 'bg-gray-400 text-gray-600 cursor-not-allowed transition-colors hover:bg-gray-400',
    }
    return (
        <button disabled={disabled} onClick={onClick} className={`flex-1 font-semibold py-2 px-4 rounded-md shadow  focus:outline-none  ${classNames[variant]} ${disabled ? classNames.disabled : ''}`} type={type}>
            {children}
        </button>
    );
}

interface ButtonProps {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    variant: 'primary' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
}