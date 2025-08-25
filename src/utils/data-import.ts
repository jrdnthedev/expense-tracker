import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Category } from '../types/category';
import type { Currency } from '../types/currency';
import type { ExportData } from './data-export';

export interface ImportData {
  expenses?: Expense[];
  budgets?: Budget[];
  categories?: Category[];
  currency?: Currency;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: ImportData;
  errors?: string[];
}

export interface ImportOptions {
  mergeMode: 'replace' | 'merge';
  skipDuplicates: boolean;
}

// Constants for better maintainability
const REQUIRED_CSV_HEADERS = ['Date', 'Description', 'Amount', 'Category'] as const;
const DEFAULT_CATEGORY_ICON = '📦';
const SUPPORTED_VERSION = '1.0';

export const DataImport = {
  /**
   * Parse JSON file content
   */
  parseJSON(content: string): ImportResult {
    try {
      const data = JSON.parse(content) as ExportData;
      
      // Validate the structure
      const validationResult = this.validateImportData(data);
      if (!validationResult.success) {
        return validationResult;
      }

      return {
        success: true,
        message: 'Data parsed successfully',
        data: {
          expenses: data.expenses || [],
          budgets: data.budgets || [],
          categories: data.categories || [],
          currency: data.currency
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid JSON format',
        errors: [error instanceof Error ? error.message : 'Unknown parsing error']
      };
    }
  },

  /**
   * Parse CSV content for expenses
   */
  parseExpensesCSV(content: string, existingCategories: Category[]): ImportResult {
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        return this.createErrorResult('CSV file must contain at least a header and one data row');
      }

      const headers = this.parseCSVHeaders(lines[0]);
      const missingHeaders = this.validateHeaders(headers);

      if (missingHeaders.length > 0) {
        return this.createErrorResult(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const { expenses, errors } = this.parseExpenseRows(lines.slice(1), headers, existingCategories);

      return {
        success: expenses.length > 0,
        message: `Parsed ${expenses.length} expenses${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        data: { expenses },
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return this.createErrorResult('Failed to parse CSV', [error instanceof Error ? error.message : 'Unknown parsing error']);
    }
  },

  /**
   * Helper method to create error results
   */
  createErrorResult(message: string, errors?: string[]): ImportResult {
    return {
      success: false,
      message,
      errors
    };
  },

  /**
   * Parse CSV headers
   */
  parseCSVHeaders(headerLine: string): string[] {
    return headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
  },

  /**
   * Validate required headers are present
   */
  validateHeaders(headers: string[]): string[] {
    return REQUIRED_CSV_HEADERS.filter(h => !headers.includes(h));
  },

  /**
   * Parse expense rows from CSV
   */
  parseExpenseRows(
    dataLines: string[],
    headers: string[],
    existingCategories: Category[]
  ): { expenses: Expense[]; errors: string[] } {
    const expenses: Expense[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = this.parseCSVLine(dataLines[i]);
        const expense = this.parseExpenseFromCSV(values, headers, existingCategories);

        if (expense) {
          expenses.push(expense);
        }
      } catch (error) {
        errors.push(`Line ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { expenses, errors };
  },

  /**
   * Parse a single CSV line handling quoted values
   */
  parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    values.push(current.trim());
    
    return values;
  },

  /**
   * Parse expense from CSV values
   */
  parseExpenseFromCSV(
    values: string[],
    headers: string[],
    categories: Category[]
  ): Expense | null {
    const getValue = (header: string): string => {
      const index = headers.indexOf(header);
      return index >= 0 ? values[index] || '' : '';
    };

    const description = getValue('Description').replace(/"/g, '');
    const amountStr = getValue('Amount');
    const categoryName = getValue('Category').replace(/"/g, '');
    const dateStr = getValue('Date');

    if (!description || !amountStr || !categoryName) {
      throw new Error('Missing required fields: Description, Amount, or Category');
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount: ${amountStr}`);
    }

    // Find or create category
    let category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      // Create a new category with a temporary ID
      category = {
        id: Date.now() + Math.random(), // Temporary ID
        name: categoryName,
        icon: DEFAULT_CATEGORY_ICON
      };
    }

    const now = new Date().toISOString();
    const createdAt = dateStr ? new Date(dateStr).toISOString() : now;

    return {
      id: Date.now() + Math.random(), // Temporary ID
      amount,
      description,
      category: category.name,
      categoryId: category.id,
      budget: getValue('Budget') || '',
      budgetId: 0, // Will need to be resolved later
      createdAt,
      updatedAt: now
    };
  },

  /**
   * Validate imported data structure
   */
  validateImportData(data: unknown): ImportResult {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        message: 'Invalid data format'
      };
    }

    // Type guard to check if data has the expected properties
    const typedData = data as Record<string, unknown>;

    // Check version compatibility
    if (typedData.version && typeof typedData.version === 'string' && typedData.version !== SUPPORTED_VERSION) {
      errors.push(`Unsupported version: ${typedData.version}`);
    }

    // Validate expenses
    if (typedData.expenses && !Array.isArray(typedData.expenses)) {
      errors.push('Expenses must be an array');
    }

    // Validate budgets
    if (typedData.budgets && !Array.isArray(typedData.budgets)) {
      errors.push('Budgets must be an array');
    }

    // Validate categories
    if (typedData.categories && !Array.isArray(typedData.categories)) {
      errors.push('Categories must be an array');
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Data validation failed',
        errors
      };
    }

    return {
      success: true,
      message: 'Data validation passed'
    };
  },

  /**
   * Read file content
   */
  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  },

  /**
   * Merge imported data with existing data
   */
  mergeData(
    imported: ImportData | undefined,
    existing: {
      expenses: Expense[];
      budgets: Budget[];
      categories: Category[];
    },
    options: ImportOptions
  ): ImportData {
    if (!imported) return existing;

    if (options.mergeMode === 'replace') {
      return {
        expenses: imported.expenses || existing.expenses,
        budgets: imported.budgets || existing.budgets,
        categories: imported.categories || existing.categories,
        currency: imported.currency
      };
    }

    // Merge mode
    const result = {
      expenses: [...existing.expenses],
      budgets: [...existing.budgets],
      categories: [...existing.categories],
      currency: imported.currency
    };

    // Merge data using helper functions
    this.mergeCategories(imported.categories, result.categories);
    this.mergeBudgets(imported.budgets, result.budgets, options.skipDuplicates);
    this.mergeExpenses(imported.expenses, result.expenses);

    return result;
  },

  /**
   * Generate a unique ID for imported items
   */
  generateUniqueId(): number {
    return Date.now() + Math.random();
  },

  /**
   * Merge categories avoiding duplicates by name
   */
  mergeCategories(importedCategories: Category[] | undefined, existingCategories: Category[]): void {
    if (!importedCategories) return;

    importedCategories.forEach(importedCat => {
      const exists = existingCategories.some(cat =>
        cat.name.toLowerCase() === importedCat.name.toLowerCase()
      );
      if (!exists) {
        existingCategories.push({
          ...importedCat,
          id: this.generateUniqueId()
        });
      }
    });
  },

  /**
   * Merge budgets with optional duplicate checking
   */
  mergeBudgets(importedBudgets: Budget[] | undefined, existingBudgets: Budget[], skipDuplicates: boolean): void {
    if (!importedBudgets) return;

    importedBudgets.forEach(importedBudget => {
      if (skipDuplicates) {
        const exists = existingBudgets.some(budget =>
          budget.name.toLowerCase() === importedBudget.name.toLowerCase()
        );
        if (!exists) {
          existingBudgets.push({
            ...importedBudget,
            id: this.generateUniqueId()
          });
        }
      } else {
        existingBudgets.push({
          ...importedBudget,
          id: this.generateUniqueId()
        });
      }
    });
  },

  /**
   * Merge expenses (always add all imported expenses)
   */
  mergeExpenses(importedExpenses: Expense[] | undefined, existingExpenses: Expense[]): void {
    if (!importedExpenses) return;

    importedExpenses.forEach(importedExpense => {
      existingExpenses.push({
        ...importedExpense,
        id: this.generateUniqueId()
      });
    });
  }
};
