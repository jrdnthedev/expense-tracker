import Card from '../card/card';

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-800 opacity-20"></div>
      <div className='w-full max-w-md mx-auto'>
        <Card>
        <div className="relative z-10">
          <button onClick={onClose} className="absolute top-2 right-2">
            Close
          </button>
          {children}
        </div>
      </Card>
      </div>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
