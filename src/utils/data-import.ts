import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Category } from '../types/category';
import type { Currency } from '../types/currency';
import type { ExportData } from './data-export';

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    expenses?: Expense[];
    budgets?: Budget[];
    categories?: Category[];
    currency?: Currency;
  };
  errors?: string[];
}

export interface ImportOptions {
  mergeMode: 'replace' | 'merge';
  skipDuplicates: boolean;
}

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
        return {
          success: false,
          message: 'CSV file must contain at least a header and one data row'
        };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const expenses: Expense[] = [];
      const errors: string[] = [];

      // Expected headers
      const requiredHeaders = ['Date', 'Description', 'Amount', 'Category'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        return {
          success: false,
          message: `Missing required headers: ${missingHeaders.join(', ')}`
        };
      }

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const expense = this.parseExpenseFromCSV(values, headers, existingCategories);
          
          if (expense) {
            expenses.push(expense);
          }
        } catch (error) {
          errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: expenses.length > 0,
        message: `Parsed ${expenses.length} expenses${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        data: { expenses },
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to parse CSV',
        errors: [error instanceof Error ? error.message : 'Unknown parsing error']
      };
    }
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
        icon: '📦' // Default icon
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
    if (typedData.version && typeof typedData.version === 'string' && typedData.version !== '1.0') {
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
    imported: ImportResult['data'],
    existing: {
      expenses: Expense[];
      budgets: Budget[];
      categories: Category[];
    },
    options: ImportOptions
  ): ImportResult['data'] {
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

    // Merge categories (avoid duplicates by name)
    if (imported.categories) {
      imported.categories.forEach(importedCat => {
        const exists = result.categories.some(cat => 
          cat.name.toLowerCase() === importedCat.name.toLowerCase()
        );
        if (!exists) {
          result.categories.push({
            ...importedCat,
            id: Date.now() + Math.random() // Generate new ID
          });
        }
      });
    }

    // Merge budgets (avoid duplicates by name)
    if (imported.budgets) {
      imported.budgets.forEach(importedBudget => {
        if (options.skipDuplicates) {
          const exists = result.budgets.some(budget => 
            budget.name.toLowerCase() === importedBudget.name.toLowerCase()
          );
          if (!exists) {
            result.budgets.push({
              ...importedBudget,
              id: Date.now() + Math.random()
            });
          }
        } else {
          result.budgets.push({
            ...importedBudget,
            id: Date.now() + Math.random()
          });
        }
      });
    }

    // Merge expenses
    if (imported.expenses) {
      imported.expenses.forEach(importedExpense => {
        result.expenses.push({
          ...importedExpense,
          id: Date.now() + Math.random()
        });
      });
    }

    return result;
  }
};
