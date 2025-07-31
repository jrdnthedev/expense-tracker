import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Modal from './modal';

describe('Modal', () => {
  describe('Rendering', () => {
    test('renders modal when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    test('does not render modal when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onClose when clicking close button', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      );

      fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when clicking overlay', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      );

      // Find the overlay div (the semi-transparent background)
      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});