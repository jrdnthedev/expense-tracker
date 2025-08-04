import { useEffect, useCallback } from 'react';

interface UseKeyTrapProps {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLElement | null>;
}

export const useKeyTrap = ({ isOpen, onClose, modalRef }: UseKeyTrapProps) => {
  // Helper function to get focusable elements
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const elements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
    
    return Array.from(elements);
  }, [modalRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || !modalRef.current) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    },
    [isOpen, onClose, modalRef, getFocusableElements]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus first non-disabled focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length) {
        focusableElements[0].focus();
      }
      
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
};