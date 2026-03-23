import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './header';
import { navLinks } from '../../../constants/data';

function renderHeader(onboardingComplete: boolean, route = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Header onboardingComplete={onboardingComplete} />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the logo and brand name', () => {
    renderHeader(true);

    expect(screen.getByAltText('Flowbite Logo')).toBeInTheDocument();
    expect(screen.getByText('Flowbite')).toBeInTheDocument();
  });

  test('renders all nav links when onboarding is complete', () => {
    renderHeader(true);

    for (const link of navLinks) {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    }
  });

  test('does not render nav links when onboarding is not complete', () => {
    renderHeader(false);

    for (const link of navLinks) {
      expect(screen.queryByText(link.label)).not.toBeInTheDocument();
    }
  });

  test('does not render the mobile menu toggle when onboarding is not complete', () => {
    renderHeader(false);

    expect(screen.queryByText('Open main menu')).not.toBeInTheDocument();
  });

  test('renders mobile menu toggle when onboarding is complete', () => {
    renderHeader(true);

    expect(screen.getByText('Open main menu')).toBeInTheDocument();
  });

  test('nav links have correct href attributes', () => {
    renderHeader(true);

    for (const link of navLinks) {
      expect(screen.getByText(link.label).closest('a')).toHaveAttribute(
        'href',
        link.to
      );
    }
  });

  test('sets aria-current="page" on the active link', () => {
    renderHeader(true, '/dashboard');

    expect(screen.getByText('Dashboard')).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByText('Budget')).not.toHaveAttribute('aria-current');
  });

  test('mobile menu is hidden by default', () => {
    renderHeader(true);

    const menu = screen.getByLabelText('main menu');
    expect(menu).toHaveClass('hidden');
  });

  test('toggles mobile menu visibility when clicking the toggle button', async () => {
    const user = userEvent.setup();
    renderHeader(true);

    const toggleBtn = screen.getByText('Open main menu').closest('button')!;
    const menu = screen.getByLabelText('main menu');

    // Initially hidden
    expect(menu).toHaveClass('hidden');

    // Click to show
    await user.click(toggleBtn);
    expect(menu).not.toHaveClass('hidden');

    // Click to hide again
    await user.click(toggleBtn);
    expect(menu).toHaveClass('hidden');
  });

  test('toggle button aria-expanded reflects menu state', async () => {
    const user = userEvent.setup();
    renderHeader(true);

    const toggleBtn = screen.getByText('Open main menu').closest('button')!;

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('clicking a nav link toggles the menu', async () => {
    const user = userEvent.setup();
    renderHeader(true);

    const toggleBtn = screen.getByText('Open main menu').closest('button')!;
    const menu = screen.getByLabelText('main menu');

    // Open menu first
    await user.click(toggleBtn);
    expect(menu).not.toHaveClass('hidden');

    // Click a link
    await user.click(screen.getByText('Budget'));
    expect(menu).toHaveClass('hidden');
  });
});
