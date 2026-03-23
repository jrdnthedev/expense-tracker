import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from './app-state-context';
import { useAppState, useAppDispatch } from './app-state-hooks';

// Helper component that displays state and exposes dispatch via buttons
function TestConsumer({
  onState,
}: {
  onState?: (state: ReturnType<typeof useAppState>) => void;
}) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  onState?.(state);

  return (
    <div>
      <span data-testid="currency">{state.currency.code}</span>
      <span data-testid="theme">{state.theme}</span>
      <span data-testid="defaultCategory">{state.defaultCategory}</span>
      <span data-testid="categories">
        {state.categories.map((c) => c.name).join(',')}
      </span>
      <span data-testid="expenses">
        {state.expenses.map((e) => e.description).join(',')}
      </span>
      <span data-testid="budgets">
        {state.budgets.map((b) => b.name).join(',')}
      </span>

      {/* Currency */}
      <button
        onClick={() =>
          dispatch({
            type: 'SET_CURRENCY',
            payload: {
              code: 'EUR',
              symbol: '€',
              decimals: 2,
              label: 'EUR',
              id: 2,
            },
          })
        }
      >
        Set EUR
      </button>

      {/* Theme */}
      <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}>
        Set Dark
      </button>

      {/* Default category */}
      <button
        onClick={() =>
          dispatch({
            type: 'SET_DEFAULT_CATEGORY',
            payload: { categoryId: 99 },
          })
        }
      >
        Set Default Category
      </button>

      {/* Category actions */}
      <button
        onClick={() =>
          dispatch({
            type: 'ADD_CATEGORY',
            payload: { id: 10, name: 'Travel', icon: '✈️' },
          })
        }
      >
        Add Category
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'UPDATE_CATEGORY',
            payload: { id: 1, name: 'Dining', icon: '🍽️' },
          })
        }
      >
        Update Category
      </button>
      <button
        onClick={() =>
          dispatch({ type: 'REMOVE_CATEGORY', payload: { id: 1 } })
        }
      >
        Remove Category
      </button>

      {/* Expense actions */}
      <button
        onClick={() =>
          dispatch({
            type: 'ADD_EXPENSE',
            payload: {
              id: 100,
              amount: 42,
              description: 'Test expense',
              category: 'Food',
              categoryId: 1,
              createdAt: '2026-03-23T00:00:00.000Z',
              updatedAt: '2026-03-23T00:00:00.000Z',
              budget: 'Monthly',
              budgetId: 1,
            },
          })
        }
      >
        Add Expense
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'UPDATE_EXPENSE',
            payload: {
              id: 100,
              amount: 99,
              description: 'Updated expense',
              category: 'Food',
              categoryId: 1,
              createdAt: '2026-03-23T00:00:00.000Z',
              updatedAt: '2026-03-23T00:00:00.000Z',
              budget: 'Monthly',
              budgetId: 1,
            },
          })
        }
      >
        Update Expense
      </button>
      <button
        onClick={() =>
          dispatch({ type: 'REMOVE_EXPENSE', payload: { id: 100 } })
        }
      >
        Remove Expense
      </button>

      {/* Budget actions */}
      <button
        onClick={() =>
          dispatch({
            type: 'ADD_BUDGET',
            payload: {
              id: 50,
              name: 'Weekly',
              categoryIds: [1],
              limit: 200,
              startDate: '2026-03-01',
              endDate: '2026-03-07',
            },
          })
        }
      >
        Add Budget
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'UPDATE_BUDGET',
            payload: {
              id: 50,
              name: 'Weekly Updated',
              categoryIds: [1, 2],
              limit: 300,
              startDate: '2026-03-01',
              endDate: '2026-03-07',
            },
          })
        }
      >
        Update Budget
      </button>
      <button
        onClick={() =>
          dispatch({ type: 'REMOVE_BUDGET', payload: { id: 50 } })
        }
      >
        Remove Budget
      </button>
    </div>
  );
}

function renderWithProvider() {
  const user = userEvent.setup();
  render(
    <AppProvider>
      <TestConsumer />
    </AppProvider>
  );
  return { user };
}

describe('AppProvider', () => {
  test('provides initial state to consumers', () => {
    renderWithProvider();

    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('defaultCategory')).toHaveTextContent('1');
    expect(screen.getByTestId('categories')).toHaveTextContent(
      'Food,Transport,Fun,Shopping'
    );
    expect(screen.getByTestId('expenses')).toHaveTextContent('');
    expect(screen.getByTestId('budgets')).toHaveTextContent('');
  });

  test('renders children', () => {
    render(
      <AppProvider>
        <p>child content</p>
      </AppProvider>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  describe('SET_CURRENCY', () => {
    test('updates currency', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Set EUR'));

      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
    });
  });

  describe('SET_THEME', () => {
    test('updates theme', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Set Dark'));

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });

  describe('SET_DEFAULT_CATEGORY', () => {
    test('updates default category', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Set Default Category'));

      expect(screen.getByTestId('defaultCategory')).toHaveTextContent('99');
    });
  });

  describe('Category actions', () => {
    test('ADD_CATEGORY appends a category', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Category'));

      expect(screen.getByTestId('categories')).toHaveTextContent(
        'Food,Transport,Fun,Shopping,Travel'
      );
    });

    test('UPDATE_CATEGORY updates an existing category', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Update Category'));

      expect(screen.getByTestId('categories')).toHaveTextContent(
        'Dining,Transport,Fun,Shopping'
      );
    });

    test('REMOVE_CATEGORY removes a category by id', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Remove Category'));

      expect(screen.getByTestId('categories')).toHaveTextContent(
        'Transport,Fun,Shopping'
      );
    });
  });

  describe('Expense actions', () => {
    test('ADD_EXPENSE appends an expense', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Expense'));

      expect(screen.getByTestId('expenses')).toHaveTextContent('Test expense');
    });

    test('UPDATE_EXPENSE updates an existing expense', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Expense'));
      await user.click(screen.getByText('Update Expense'));

      expect(screen.getByTestId('expenses')).toHaveTextContent(
        'Updated expense'
      );
    });

    test('REMOVE_EXPENSE removes an expense by id', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Expense'));
      expect(screen.getByTestId('expenses')).toHaveTextContent('Test expense');

      await user.click(screen.getByText('Remove Expense'));
      expect(screen.getByTestId('expenses')).toHaveTextContent('');
    });
  });

  describe('Budget actions', () => {
    test('ADD_BUDGET appends a budget', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Budget'));

      expect(screen.getByTestId('budgets')).toHaveTextContent('Weekly');
    });

    test('UPDATE_BUDGET updates an existing budget', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Budget'));
      await user.click(screen.getByText('Update Budget'));

      expect(screen.getByTestId('budgets')).toHaveTextContent(
        'Weekly Updated'
      );
    });

    test('REMOVE_BUDGET removes a budget by id', async () => {
      const { user } = renderWithProvider();

      await user.click(screen.getByText('Add Budget'));
      expect(screen.getByTestId('budgets')).toHaveTextContent('Weekly');

      await user.click(screen.getByText('Remove Budget'));
      expect(screen.getByTestId('budgets')).toHaveTextContent('');
    });
  });

  test('multiple dispatches compose correctly', async () => {
    const { user } = renderWithProvider();

    await user.click(screen.getByText('Set EUR'));
    await user.click(screen.getByText('Set Dark'));
    await user.click(screen.getByText('Add Expense'));
    await user.click(screen.getByText('Add Budget'));

    expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('expenses')).toHaveTextContent('Test expense');
    expect(screen.getByTestId('budgets')).toHaveTextContent('Weekly');
  });
});
