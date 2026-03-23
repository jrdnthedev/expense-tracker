import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './landing';

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
}

describe('Landing', () => {
  test('renders the heading', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: 'Track Expenses Effortlessly' })
    ).toBeInTheDocument();
  });

  test('renders the description', () => {
    renderLanding();
    expect(
      screen.getByText(
        'Organize your spending, set budgets, and gain insights with ease.'
      )
    ).toBeInTheDocument();
  });

  test('renders Get Started link pointing to /onboarding', () => {
    renderLanding();
    const link = screen.getByRole('link', { name: 'Get Started' });
    expect(link).toHaveAttribute('href', '/onboarding');
  });
});
