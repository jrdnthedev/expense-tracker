import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmptyState from './empty-state';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EmptyState', () => {
  test('should render with required link prop only', () => {
    renderWithRouter(<EmptyState link="add-expense" />);
    
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
    expect(screen.getByText('Start tracking your expenses by adding your first transaction.')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Add Expense');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/add-expense');
  });

  test('should render with custom title', () => {
    renderWithRouter(
      <EmptyState 
        title="No transactions found" 
        link="add-expense" 
      />
    );
    
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.queryByText('No expenses yet')).not.toBeInTheDocument();
  });

  test('should render with custom description', () => {
    renderWithRouter(
      <EmptyState 
        description="Create your first expense to get started." 
        link="add-expense" 
      />
    );
    
    expect(screen.getByText('Create your first expense to get started.')).toBeInTheDocument();
    expect(screen.queryByText('Start tracking your expenses by adding your first transaction.')).not.toBeInTheDocument();
  });

  test('should render with custom CTA text', () => {
    renderWithRouter(
      <EmptyState 
        link="create-expense" 
        cta="Create First Expense" 
      />
    );
    
    expect(screen.getByRole('link')).toHaveTextContent('Create First Expense');
    expect(screen.queryByText('Add Expense')).not.toBeInTheDocument();
  });

  test('should generate correct link URL', () => {
    renderWithRouter(<EmptyState link="expenses/new" />);
    
    expect(screen.getByRole('link')).toHaveAttribute('href', '/expenses/new');
  });

  test('should render all custom props correctly', () => {
    renderWithRouter(
      <EmptyState
        title="No budgets available"
        description="Set up your first budget to manage your finances."
        link="budgets/create"
        cta="Create Budget"
      />
    );
    
    expect(screen.getByText('No budgets available')).toBeInTheDocument();
    expect(screen.getByText('Set up your first budget to manage your finances.')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Create Budget');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/budgets/create');
  });

  test('should have proper HTML structure and accessibility', () => {
    renderWithRouter(<EmptyState link="add-expense" />);
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('No expenses yet');
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass('text-blue-600', 'hover:underline');
  });

  test('should apply correct CSS classes for styling', () => {
    renderWithRouter(<EmptyState link="add-expense" />);
    
    const container = document.querySelector('.text-center.py-8.flex.flex-col.items-center.gap-4');
    expect(container).toBeInTheDocument();
    
    const iconContainer = document.querySelector('.mx-auto.h-12.w-12.rounded-full.bg-blue-50.flex.items-center.justify-center.mb-4');
    expect(iconContainer).toBeInTheDocument();
  });

  test('should handle empty string values', () => {
    renderWithRouter(
      <EmptyState
        title=""
        description=""
        link="add-expense"
        cta=""
      />
    );
    
    expect(screen.getByRole('heading')).toHaveTextContent('');
    expect(screen.getByRole('link')).toHaveTextContent('');
    
    const description = document.querySelector('.text-sm.text-gray-500');
    expect(description).toHaveTextContent('');
  });

  test('should handle special characters in link', () => {
    renderWithRouter(<EmptyState link="expenses/category-1" />);
    
    expect(screen.getByRole('link')).toHaveAttribute('href', '/expenses/category-1');
  });

  test('should render icon container without content', () => {
    renderWithRouter(<EmptyState link="add-expense" />);
    
    const iconContainer = document.querySelector('.mx-auto.h-12.w-12.rounded-full.bg-blue-50.flex.items-center.justify-center.mb-4');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toBeEmptyDOMElement();
  });

  test('should handle long text content', () => {
    const longTitle = 'This is a very long title that should still be displayed correctly even when it contains multiple words and detailed information';
    const longDescription = 'This is an extremely long description that provides comprehensive details about what the user should do next and why this empty state exists in the first place.';
    const longCta = 'Click here to create your very first expense entry';
    
    renderWithRouter(
      <EmptyState
        title={longTitle}
        description={longDescription}
        link="add-expense"
        cta={longCta}
      />
    );
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent(longCta);
  });

  test('should handle numeric and special character links', () => {
    renderWithRouter(<EmptyState link="category/123/add-expense" />);
    
    expect(screen.getByRole('link')).toHaveAttribute('href', '/category/123/add-expense');
  });
});