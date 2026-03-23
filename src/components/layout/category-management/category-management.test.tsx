import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryManagement from './category-management';
import type { Category } from '../../../types/category';
import type { CategoryFormData } from '../../../constants/form-data';

// --- Mocks ---

const mockDispatch = vi.fn();
const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
  { id: 3, name: 'Entertainment', icon: '🎬' },
];

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: vi.fn(() => ({ categories: mockCategories })),
}));

vi.mock('../../../hooks/persisted-dispatch/usePersistedDispatch', () => ({
  usePersistedDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('../../../hooks/nextId/next-id', () => ({
  useNextId: vi.fn(() => 4),
}));

vi.mock('../../forms/category-form/category-form', () => ({
  default: ({
    onSubmit,
    onDelete,
    categoryFormData,
  }: {
    onSubmit?: (data: CategoryFormData) => void;
    categories: Category[];
    categoryFormData?: CategoryFormData;
    onDelete?: () => void;
  }) => {
    return (
      <div data-testid="category-form">
        {categoryFormData && (
          <span data-testid="form-editing">{categoryFormData.name}</span>
        )}
        {onSubmit && (
          <button
            data-testid="form-submit"
            onClick={() => onSubmit({ name: 'New Cat', icon: '🐱' })}
          >
            Submit
          </button>
        )}
        {onDelete && (
          <button data-testid="form-delete" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    );
  },
}));

vi.mock('../../ui/modal/modal', () => ({
  default: ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../ui/card-btn/card-btn', () => ({
  default: ({
    label,
    icon,
    selected,
    onClick,
  }: {
    label: string;
    icon?: string;
    selected?: boolean;
    onClick: () => void;
  }) => (
    <button
      data-testid={`category-${label}`}
      onClick={onClick}
      className={selected ? 'selected' : ''}
    >
      {icon} {label}
    </button>
  ),
}));

vi.mock('../../ui/button/button', () => ({
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant: string;
  }) => (
    <button data-testid={`btn-${children}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

// --- Tests ---

describe('CategoryManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders heading and description', () => {
    render(<CategoryManagement />);

    expect(screen.getByText('➕ Manage Categories')).toBeInTheDocument();
    expect(
      screen.getByText(/easily manage your expense categories/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Expense Categories')).toBeInTheDocument();
  });

  test('renders all category card buttons', () => {
    render(<CategoryManagement />);

    expect(screen.getByTestId('category-Food')).toBeInTheDocument();
    expect(screen.getByTestId('category-Transport')).toBeInTheDocument();
    expect(screen.getByTestId('category-Entertainment')).toBeInTheDocument();
  });

  test('shows "Select a category to edit" when none selected', () => {
    render(<CategoryManagement />);

    expect(screen.getByText('Select a category to edit')).toBeInTheDocument();
  });

  test('selecting a category shows the edit form', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));

    expect(screen.getByTestId('form-editing')).toHaveTextContent('Food');
    expect(
      screen.queryByText('Select a category to edit')
    ).not.toBeInTheDocument();
  });

  test('selecting a different category updates the form', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));
    expect(screen.getByTestId('form-editing')).toHaveTextContent('Food');

    await user.click(screen.getByTestId('category-Transport'));
    expect(screen.getByTestId('form-editing')).toHaveTextContent('Transport');
  });

  test('opens add category modal when clicking "Add New Category"', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('btn-Add New Category'));

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add New Category' })).toBeInTheDocument();
  });

  test('closes add category modal via modal close', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('btn-Add New Category'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    await user.click(screen.getByTestId('modal-close'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  test('dispatches ADD_CATEGORY when submitting the add form', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('btn-Add New Category'));

    // The modal contains a CategoryForm whose onSubmit triggers handleAddCategory
    const submitButtons = screen.getAllByTestId('form-submit');
    // The submit inside the modal is the last rendered one
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_CATEGORY',
      payload: { name: 'New Cat', icon: '🐱', id: 4 },
    });
  });

  test('closes modal after adding a category', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('btn-Add New Category'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const submitButtons = screen.getAllByTestId('form-submit');
    await user.click(submitButtons[submitButtons.length - 1]);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  test('dispatches UPDATE_CATEGORY when editing a selected category', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));
    await user.click(screen.getByTestId('form-submit'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CATEGORY',
      payload: { id: 1, name: 'New Cat', icon: '🐱' },
    });
  });

  test('opens confirm deletion modal when clicking delete on a category', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));
    await user.click(screen.getByTestId('form-delete'));

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this category?')
    ).toBeInTheDocument();
  });

  test('dispatches REMOVE_CATEGORY when confirming deletion', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));
    await user.click(screen.getByTestId('form-delete'));
    await user.click(screen.getByTestId('btn-Delete'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_CATEGORY',
      payload: { id: 1 },
    });
  });

  test('closes confirm modal after deletion', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));
    await user.click(screen.getByTestId('form-delete'));
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    await user.click(screen.getByTestId('btn-Delete'));
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  test('closes confirm modal when clicking Cancel', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));
    await user.click(screen.getByTestId('form-delete'));
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    await user.click(screen.getByTestId('btn-Cancel'));
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  test('selected card button has selected class', async () => {
    const user = userEvent.setup();
    render(<CategoryManagement />);

    await user.click(screen.getByTestId('category-Food'));

    expect(screen.getByTestId('category-Food')).toHaveClass('selected');
    expect(screen.getByTestId('category-Transport')).not.toHaveClass(
      'selected'
    );
  });
});
