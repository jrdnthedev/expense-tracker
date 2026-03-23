import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import LoadingStencil from './loading-stencil';

describe('LoadingStencil', () => {
  test('renders without crashing', () => {
    const { container } = render(<LoadingStencil />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders three skeleton cards', () => {
    const { container } = render(<LoadingStencil />);

    const cards = container.querySelectorAll('.bg-white.rounded-lg.shadow-md');
    expect(cards).toHaveLength(3);
  });

  test('renders pulse animation placeholders', () => {
    const { container } = render(<LoadingStencil />);

    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  test('each card contains a circular avatar placeholder', () => {
    const { container } = render(<LoadingStencil />);

    const avatars = container.querySelectorAll('.rounded-full.animate-pulse');
    expect(avatars).toHaveLength(3);
  });

  test('renders a header placeholder area', () => {
    const { container } = render(<LoadingStencil />);

    const header = container.querySelector('.mb-8');
    expect(header).toBeInTheDocument();
    expect(header!.querySelectorAll('.animate-pulse')).toHaveLength(2);
  });
});
