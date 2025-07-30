import { render, screen } from '@testing-library/react';
import { describe, test, expect,vi } from 'vitest';
import Button from './button';

describe('Button', () => {
  test('renders button with text', () => {
    render(
      <Button onClick={() => {}} variant="primary">
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies primary variant styles', () => {
    render(
      <Button onClick={() => {}} variant="primary">
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('bg-blue-600');
    expect(buttonElement).toHaveClass('hover:bg-blue-700');
  });

  test('applies secondary variant styles', () => {
    render(
      <Button onClick={() => {}} variant="secondary">
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('bg-gray-200');
    expect(buttonElement).toHaveClass('hover:bg-gray-300');
  });

  test('applies disabled styles', () => {
    render(
      <Button onClick={() => {}} variant="primary" disabled>
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toHaveClass('bg-gray-400');
    expect(buttonElement).toHaveClass('cursor-not-allowed');
    expect(buttonElement).toBeDisabled();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} variant="primary">
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick handler when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} variant="primary" disabled>
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(0);
  });
});
