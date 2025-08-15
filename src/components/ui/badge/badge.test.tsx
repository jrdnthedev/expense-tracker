import { render, screen } from '@testing-library/react';
import { test, expect, describe } from 'vitest';
import Badge from './badge';

describe('Badge', () => {
  test('renders with default variant when no variant is provided', () => {
    render(<Badge message="Test message" variant="default" />);
    const badge = screen.getByText('Test message');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  test('renders with default variant classes', () => {
    render(<Badge message="Default badge" variant="default" />);
    const badge = screen.getByText('Default badge');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'text-sm', 'font-semibold', 'px-2', 'py-1', 'rounded');
  });

  test('renders with success variant classes', () => {
    render(<Badge message="Success badge" variant="success" />);
    const badge = screen.getByText('Success badge');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'text-sm', 'font-semibold', 'px-2', 'py-1', 'rounded');
  });

  test('renders with error variant classes', () => {
    render(<Badge message="Error badge" variant="error" />);
    const badge = screen.getByText('Error badge');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'text-sm', 'font-semibold', 'px-2', 'py-1', 'rounded');
  });

  test('displays the correct message text', () => {
    const testMessage = 'Custom test message';
    render(<Badge message={testMessage} variant="default" />);
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  test('renders as a span element', () => {
    render(<Badge message="Test" variant="default" />);
    const badge = screen.getByText('Test');
    expect(badge.tagName).toBe('SPAN');
  });

  test('handles empty message', () => {
    const { container } = render(<Badge message="" variant="default" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  test('handles special characters in message', () => {
    const specialMessage = 'Test & <script>alert("xss")</script>';
    render(<Badge message={specialMessage} variant="success" />);
    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });
});