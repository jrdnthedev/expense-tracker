import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import CardButton from './card-btn';
import userEvent from '@testing-library/user-event';

describe('Card Button', () => {
  describe('renders correctly', () => {
    test('should render correctly', () => {
      render(<CardButton label="Click Me" onClick={() => {}} />);

      const buttonElement = screen.getByRole('button', { name: /click me/i });
      expect(buttonElement).toBeInTheDocument();
    });

    test('renders with icon when provided', () => {
      render(<CardButton label="Settings" icon="⚙️" onClick={() => {}} />);

      expect(screen.getByText('⚙️')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders without icon when not provided', () => {
      render(<CardButton label="No Icon" onClick={() => {}} />);

      expect(screen.getByText('No Icon')).toBeInTheDocument();

      expect(screen.queryByText('⚙️')).not.toBeInTheDocument();
    });
  });

  describe('Selected State', () => {
    test('applies selected styles when selected is true', () => {
      render(
        <CardButton label="Selected" selected={true} onClick={() => {}} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-50', 'text-blue-700', 'font-medium');
    });

    test('applies default styles when selected is false', () => {
      render(
        <CardButton label="Not Selected" selected={false} onClick={() => {}} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-gray-200');
      expect(button).not.toHaveClass(
        'bg-blue-50',
        'text-blue-700',
        'font-medium'
      );
    });

    test('applies default styles when selected is not provided', () => {
      render(<CardButton label="Default" onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-gray-200');
      expect(button).not.toHaveClass('bg-blue-50');
    });
  });

  describe('User Interactions', () => {
    test('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<CardButton label="Click Me" onClick={handleClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('supports keyboard interaction', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<CardButton label="Keyboard Test" onClick={handleClick} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper focus styles', () => {
      render(<CardButton label="Focus Test" onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:outline-none'
      );
    });

    test('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<CardButton label="Tab Test" onClick={() => {}} />);

      await user.tab();
      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });
  });

  describe('Combined Props', () => {
    test('renders with all props together', () => {
      const handleClick = vi.fn();
      render(
        <CardButton
          label="Complete Button"
          icon="🎯"
          selected={true}
          onClick={handleClick}
        />
      );

      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('Complete Button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('bg-blue-50');
    });

    test('handles empty label gracefully', () => {
      render(<CardButton label="" onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Should still be accessible even with empty label
    });
  });
});
