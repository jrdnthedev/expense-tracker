import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Card from './card';

describe('Card', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <h1>Test Card</h1>
      </Card>
    );
    expect(getByText('Test Card')).toBeInTheDocument();
  });
  test('applies correct styles', () => {
    const { container } = render(
      <Card>
        <h1>Styled Card</h1>
      </Card>
    );
    expect(container.firstChild).toHaveClass(
      'shadow-md border border-gray-900/10 bg-white rounded-lg p-4 flex-1 relative'
    );
  });
  test('renders multiple children', () => {
    const { getByText } = render(
      <Card>
        <h1>First Child</h1>
        <p>Second Child</p>
      </Card>
    );
    expect(getByText('First Child')).toBeInTheDocument();
    expect(getByText('Second Child')).toBeInTheDocument();
  });
});
