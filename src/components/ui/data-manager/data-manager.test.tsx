import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataManager from './data-manager';
import type { Currency } from '../../../types/currency';
import type { Category } from '../../../types/category';
import type { Budget } from '../../../types/budget';
import type { Expense } from '../../../types/expense';

// --- Mock data ---

const mockCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  decimals: 2,
  label: 'USD',
  id: 1,
};

const mockCategories: Category[] = [
  { id: 1, name: 'Food', icon: '🍕' },
];

const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly',
    categoryIds: [1],
    limit: 500,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    amount: 25,
    description: 'Groceries',
    category: 'Food',
    categoryId: 1,
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-03-10T10:00:00.000Z',
    budget: 'Monthly',
    budgetId: 1,
  },
];

const defaultState = {
  expenses: mockExpenses,
  budgets: mockBudgets,
  categories: mockCategories,
  currency: mockCurrency,
  defaultCategory: 1,
  theme: 'light' as const,
};

// --- Mocks ---

const mockDispatch = vi.fn();

vi.mock('../../../context/app-state-hooks', () => ({
  useAppState: vi.fn(() => defaultState),
  useAppDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('../../../utils/data-export', () => ({
  DataExport: {
    exportAllData: vi.fn(),
    exportExpensesCSV: vi.fn(),
    exportBudgetsCSV: vi.fn(),
  },
}));

vi.mock('../../../utils/data-import', () => ({
  DataImport: {
    readFile: vi.fn(),
    parseJSON: vi.fn(),
    parseExpensesCSV: vi.fn(),
    mergeData: vi.fn(),
  },
}));

vi.mock('../modal/modal', () => ({
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
          X
        </button>
        {children}
      </div>
    ) : null,
}));

import { DataExport } from '../../../utils/data-export';
import { DataImport } from '../../../utils/data-import';

// --- Helpers ---

const mockOnClose = vi.fn();

function renderDataManager(isOpen = true) {
  return render(<DataManager isOpen={isOpen} onClose={mockOnClose} />);
}

// --- Tests ---

describe('DataManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
    renderDataManager(false);
    expect(screen.queryByText('Data Management')).not.toBeInTheDocument();
  });

  test('renders the modal when isOpen is true', () => {
    renderDataManager();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  test('renders export section with all export buttons', () => {
    renderDataManager();

    expect(screen.getByText('📤 Export Data')).toBeInTheDocument();
    expect(screen.getByText('Export All Data (JSON)')).toBeInTheDocument();
    expect(screen.getByText('Export Expenses (CSV)')).toBeInTheDocument();
    expect(screen.getByText('Export Budgets (CSV)')).toBeInTheDocument();
  });

  test('renders import section', () => {
    renderDataManager();

    expect(screen.getByText('📥 Import Data')).toBeInTheDocument();
    expect(screen.getByText('Select File to Import')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Supports JSON (full backup) and CSV (expenses only) files'
      )
    ).toBeInTheDocument();
  });

  test('renders import options', () => {
    renderDataManager();

    expect(screen.getByText('Merge with existing data')).toBeInTheDocument();
    expect(screen.getByText('Replace existing data')).toBeInTheDocument();
    expect(screen.getByText('Skip duplicates')).toBeInTheDocument();
  });

  test('merge mode is selected by default', () => {
    renderDataManager();

    const mergeRadio = screen.getByRole('radio', {
      name: /merge with existing data/i,
    });
    const replaceRadio = screen.getByRole('radio', {
      name: /replace existing data/i,
    });

    expect(mergeRadio).toBeChecked();
    expect(replaceRadio).not.toBeChecked();
  });

  test('skip duplicates checkbox is checked by default', () => {
    renderDataManager();

    const checkbox = screen.getByRole('checkbox', {
      name: /skip duplicates/i,
    });
    expect(checkbox).toBeChecked();
  });

  test('can toggle import options', async () => {
    const user = userEvent.setup();
    renderDataManager();

    const replaceRadio = screen.getByRole('radio', {
      name: /replace existing data/i,
    });
    await user.click(replaceRadio);
    expect(replaceRadio).toBeChecked();

    const checkbox = screen.getByRole('checkbox', {
      name: /skip duplicates/i,
    });
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('renders Close button', () => {
    renderDataManager();

    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  test('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    renderDataManager();

    await user.click(screen.getByText('Close'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // --- Export ---

  test('calls exportAllData on Export All click', async () => {
    const user = userEvent.setup();
    renderDataManager();

    await user.click(screen.getByText('Export All Data (JSON)'));

    expect(DataExport.exportAllData).toHaveBeenCalledWith(
      mockExpenses,
      mockBudgets,
      mockCategories,
      mockCurrency
    );
  });

  test('calls exportExpensesCSV on Export Expenses click', async () => {
    const user = userEvent.setup();
    renderDataManager();

    await user.click(screen.getByText('Export Expenses (CSV)'));

    expect(DataExport.exportExpensesCSV).toHaveBeenCalledWith(
      mockExpenses,
      mockCategories,
      mockCurrency
    );
  });

  test('calls exportBudgetsCSV on Export Budgets click', async () => {
    const user = userEvent.setup();
    renderDataManager();

    await user.click(screen.getByText('Export Budgets (CSV)'));

    expect(DataExport.exportBudgetsCSV).toHaveBeenCalledWith(
      mockBudgets,
      mockCategories,
      mockCurrency
    );
  });

  // --- Import ---

  test('shows success message after successful JSON import', async () => {
    const user = userEvent.setup();

    const importedData = {
      categories: [{ id: 10, name: 'Health', icon: '💊' }],
      budgets: [],
      expenses: [],
    };

    vi.mocked(DataImport.readFile).mockResolvedValue('{}');
    vi.mocked(DataImport.parseJSON).mockReturnValue({
      success: true,
      message: 'Imported successfully',
      data: importedData,
    });
    vi.mocked(DataImport.mergeData).mockReturnValue(importedData);

    renderDataManager();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['{}'], 'backup.json', {
      type: 'application/json',
    });

    await user.upload(fileInput, file);

    expect(await screen.findByText('✅ Success')).toBeInTheDocument();
    expect(screen.getByText('Imported successfully')).toBeInTheDocument();
  });

  test('shows error message after failed import', async () => {
    const user = userEvent.setup();

    vi.mocked(DataImport.readFile).mockResolvedValue('bad');
    vi.mocked(DataImport.parseJSON).mockReturnValue({
      success: false,
      message: 'Invalid JSON format',
      errors: ['Parse error'],
    });

    renderDataManager();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['bad'], 'backup.json', {
      type: 'application/json',
    });

    await user.upload(fileInput, file);

    expect(await screen.findByText('❌ Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
    expect(screen.getByText('• Parse error')).toBeInTheDocument();
  });

  test('dispatches ADD_CATEGORY for new categories on import', async () => {
    const user = userEvent.setup();

    const newCategory = { id: 10, name: 'Health', icon: '💊' };
    const importedData = {
      categories: [newCategory],
      budgets: [],
      expenses: [],
    };

    vi.mocked(DataImport.readFile).mockResolvedValue('{}');
    vi.mocked(DataImport.parseJSON).mockReturnValue({
      success: true,
      message: 'OK',
      data: importedData,
    });
    vi.mocked(DataImport.mergeData).mockReturnValue(importedData);

    renderDataManager();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['{}'], 'backup.json', {
      type: 'application/json',
    });

    await user.upload(fileInput, file);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_CATEGORY',
      payload: newCategory,
    });
  });

  test('shows error when file read fails', async () => {
    const user = userEvent.setup();

    vi.mocked(DataImport.readFile).mockRejectedValue(
      new Error('File read failed')
    );

    renderDataManager();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File([''], 'backup.json', {
      type: 'application/json',
    });

    await user.upload(fileInput, file);

    expect(await screen.findByText('❌ Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to process file')).toBeInTheDocument();
    expect(screen.getByText('• File read failed')).toBeInTheDocument();
  });

  test('dismisses import result when clicking ✕', async () => {
    const user = userEvent.setup();

    vi.mocked(DataImport.readFile).mockResolvedValue('{}');
    vi.mocked(DataImport.parseJSON).mockReturnValue({
      success: true,
      message: 'Done',
      data: {},
    });
    vi.mocked(DataImport.mergeData).mockReturnValue(null as never);

    renderDataManager();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['{}'], 'backup.json', {
      type: 'application/json',
    });

    await user.upload(fileInput, file);

    expect(await screen.findByText('✅ Success')).toBeInTheDocument();

    await user.click(screen.getByText('✕'));
    expect(screen.queryByText('✅ Success')).not.toBeInTheDocument();
  });

  test('uses parseExpensesCSV for CSV files', async () => {
    const user = userEvent.setup();

    vi.mocked(DataImport.readFile).mockResolvedValue('csv content');
    vi.mocked(DataImport.parseExpensesCSV).mockReturnValue({
      success: true,
      message: 'CSV imported',
      data: { expenses: [] },
    });
    vi.mocked(DataImport.mergeData).mockReturnValue({ expenses: [] });

    renderDataManager();

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(['csv content'], 'expenses.csv', {
      type: 'text/csv',
    });

    await user.upload(fileInput, file);

    expect(DataImport.parseExpensesCSV).toHaveBeenCalledWith(
      'csv content',
      mockCategories
    );
  });
});
