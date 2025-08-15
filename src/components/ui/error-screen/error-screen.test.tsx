import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorScreen } from './error-screen';

describe('ErrorScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with required message prop only', () => {
    render(<ErrorScreen message="Test error message" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should render with custom title', () => {
    render(<ErrorScreen title="Custom Error" message="Test message" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  test('should render action button when onAction is provided', () => {
    const mockAction = vi.fn();
    render(<ErrorScreen message="Test message" onAction={mockAction} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Try Again');
  });

  test('should render custom action label', () => {
    const mockAction = vi.fn();
    render(
      <ErrorScreen 
        message="Test message" 
        onAction={mockAction} 
        actionLabel="Retry Now" 
      />
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Retry Now');
  });

  test('should call onAction when button is clicked', () => {
    const mockAction = vi.fn();
    render(<ErrorScreen message="Test message" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  test('should not render button when onAction is not provided', () => {
    render(<ErrorScreen message="Test message" />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should render all props correctly', () => {
    const mockAction = vi.fn();
    render(
      <ErrorScreen
        title="Network Error"
        message="Failed to connect to server"
        actionLabel="Reconnect"
        onAction={mockAction}
      />
    );
    
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Reconnect');
  });

  test('should have proper HTML structure and accessibility', () => {
    render(<ErrorScreen message="Test message" />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Something went wrong');
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should handle long messages correctly', () => {
    const longMessage = 'This is a very long error message that should still be displayed correctly even when it contains multiple sentences and detailed information about what went wrong.';
    
    render(<ErrorScreen message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('should handle empty title with custom value', () => {
    render(<ErrorScreen title="" message="Test message" />);
    
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('');
  });

  test('should handle multiple button clicks', () => {
    const mockAction = vi.fn();
    render(<ErrorScreen message="Test message" onAction={mockAction} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(mockAction).toHaveBeenCalledTimes(3);
  });

  test('should apply correct CSS classes for styling', () => {
    render(<ErrorScreen message="Test message" />);
    
    const container = document.querySelector('.p-4.bg-gray-100.min-h-screen');
    expect(container).toBeInTheDocument();
    
    const card = document.querySelector('.max-w-md.w-full.bg-white.rounded-lg.shadow-lg');
    expect(card).toBeInTheDocument();
  });

  test('should render warning icon with correct attributes', () => {
    render(<ErrorScreen message="Test message" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-16', 'w-16', 'mx-auto');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    
    const path = document.querySelector('path');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
    expect(path).toHaveAttribute('stroke-width', '2');
  });
});