import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Category } from '../types/category';
import type { Currency } from '../types/currency';
import { formatDate } from './validators';

export interface ExportData {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  currency: Currency;
  exportDate: string;
  version: string;
}

export const DataExport = {
  /**
   * Export data to JSON format
   */
  exportToJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  },

  /**
   * Export expenses to CSV format
   */
  exportExpensesToCSV(expenses: Expense[], categories: Category[], currency: Currency): string {
    if (expenses.length === 0) {
      return 'No expenses to export';
    }

    // CSV headers
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Currency',
      'Category',
      'Budget',
      'Created At',
      'Updated At'
    ];

    // Convert expenses to CSV rows
    const rows = expenses.map(expense => {
      const category = categories.find(cat => cat.id === expense.categoryId);
      return [
        formatDate(expense.createdAt),
        `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
        expense.amount.toString(),
        currency.code,
        category?.name || 'Unknown',
        expense.budget || '',
        expense.createdAt,
        expense.updatedAt || expense.createdAt
      ];
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  },

  /**
   * Export budgets to CSV format
   */
  exportBudgetsToCSV(budgets: Budget[], categories: Category[], currency: Currency): string {
    if (budgets.length === 0) {
      return 'No budgets to export';
    }

    const headers = [
      'Name',
      'Limit',
      'Currency',
      'Categories',
      'Start Date',
      'End Date'
    ];

    const rows = budgets.map(budget => {
      const budgetCategories = budget.categoryIds
        .map(id => categories.find(cat => cat.id === id)?.name)
        .filter(Boolean)
        .join('; ');

      return [
        `"${budget.name.replace(/"/g, '""')}"`,
        budget.limit.toString(),
        currency.code,
        `"${budgetCategories}"`,
        budget.startDate,
        budget.endDate
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  },

  /**
   * Download data as a file
   */
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  },

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix: string, extension: string): string {
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    return `${prefix}_${timestamp}.${extension}`;
  },

  /**
   * Export all data as JSON
   */
  exportAllData(
    expenses: Expense[],
    budgets: Budget[],
    categories: Category[],
    currency: Currency
  ): void {
    const exportData: ExportData = {
      expenses,
      budgets,
      categories,
      currency,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const jsonContent = this.exportToJSON(exportData);
    const filename = this.generateFilename('expense_tracker_backup', 'json');
    
    this.downloadFile(jsonContent, filename, 'application/json');
  },

  /**
   * Export expenses as CSV
   */
  exportExpensesCSV(
    expenses: Expense[],
    categories: Category[],
    currency: Currency
  ): void {
    const csvContent = this.exportExpensesToCSV(expenses, categories, currency);
    const filename = this.generateFilename('expenses', 'csv');
    
    this.downloadFile(csvContent, filename, 'text/csv');
  },

  /**
   * Export budgets as CSV
   */
  exportBudgetsCSV(
    budgets: Budget[],
    categories: Category[],
    currency: Currency
  ): void {
    const csvContent = this.exportBudgetsToCSV(budgets, categories, currency);
    const filename = this.generateFilename('budgets', 'csv');
    
    this.downloadFile(csvContent, filename, 'text/csv');
  }
};
