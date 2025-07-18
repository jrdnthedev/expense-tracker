export default function Card ({children}: {children: React.ReactNode}) {
    return (
        <div className="shadow-md border border-gray-900/10 bg-white rounded-lg shadow-md p-4">
        {children}
        </div>
    );
}