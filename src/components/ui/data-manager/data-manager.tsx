import { useState, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../../context/app-state-hooks';
import { DataExport } from '../../../utils/data-export';
import { DataImport, type ImportResult, type ImportOptions } from '../../../utils/data-import';
import Button from '../button/button';
import Modal from '../modal/modal';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataManager({ isOpen, onClose }: DataManagerProps) {
  const { expenses, budgets, categories, currency } = useAppState();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    mergeMode: 'merge',
    skipDuplicates: true
  });

  const handleExportAll = () => {
    DataExport.exportAllData(expenses, budgets, categories, currency);
  };

  const handleExportExpenses = () => {
    DataExport.exportExpensesCSV(expenses, categories, currency);
  };

  const handleExportBudgets = () => {
    DataExport.exportBudgetsCSV(budgets, categories, currency);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const content = await DataImport.readFile(file);
      let result: ImportResult;

      if (file.name.endsWith('.json')) {
        result = DataImport.parseJSON(content);
      } else if (file.name.endsWith('.csv')) {
        result = DataImport.parseExpensesCSV(content, categories);
      } else {
        result = {
          success: false,
          message: 'Unsupported file format. Please use JSON or CSV files.'
        };
      }

      setImportResult(result);

      if (result.success && result.data) {
        // Apply the imported data
        const mergedData = DataImport.mergeData(
          result.data,
          { expenses, budgets, categories },
          importOptions
        );

        if (mergedData) {
          // Dispatch actions to update the state
          if (mergedData.categories) {
            mergedData.categories.forEach(category => {
              const exists = categories.some(cat => cat.id === category.id);
              if (!exists) {
                dispatch({ type: 'ADD_CATEGORY', payload: category });
              }
            });
          }

          if (mergedData.budgets) {
            mergedData.budgets.forEach(budget => {
              const exists = budgets.some(b => b.id === budget.id);
              if (!exists) {
                dispatch({ type: 'ADD_BUDGET', payload: budget });
              }
            });
          }

          if (mergedData.expenses) {
            mergedData.expenses.forEach(expense => {
              const exists = expenses.some(e => e.id === expense.id);
              if (!exists) {
                dispatch({ type: 'ADD_EXPENSE', payload: expense });
              }
            });
          }

          if (mergedData.currency) {
            dispatch({ type: 'SET_CURRENCY', payload: mergedData.currency });
          }
        }
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to process file',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetImportResult = () => {
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Data Management
        </h3>
        
        {/* Export Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📤 Export Data
          </h4>
          <div className="space-y-2">
            <Button
              onClick={handleExportAll}
              variant="primary"
            >
              Export All Data (JSON)
            </Button>
            <Button
              onClick={handleExportExpenses}
              variant="secondary"
            >
              Export Expenses (CSV)
            </Button>
            <Button
              onClick={handleExportBudgets}
              variant="secondary"
            >
              Export Budgets (CSV)
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📥 Import Data
          </h4>
          
          {/* Import Options */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mergeMode"
                  value="merge"
                  checked={importOptions.mergeMode === 'merge'}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    mergeMode: e.target.value as 'merge' | 'replace'
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Merge with existing data
                </span>
              </label>
            </div>
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mergeMode"
                  value="replace"
                  checked={importOptions.mergeMode === 'replace'}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    mergeMode: e.target.value as 'merge' | 'replace'
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Replace existing data
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={importOptions.skipDuplicates}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    skipDuplicates: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Skip duplicates
                </span>
              </label>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={handleImportClick}
            variant="primary"
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Select File to Import'}
          </Button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Supports JSON (full backup) and CSV (expenses only) files
          </p>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`p-3 rounded-lg mb-4 ${
            importResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`font-medium ${
                  importResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {importResult.success ? '✅ Success' : '❌ Error'}
                </p>
                <p className={`text-sm ${
                  importResult.success 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {importResult.message}
                </p>
                {importResult.errors && (
                  <ul className="text-xs mt-2 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="text-red-600 dark:text-red-400">
                        • {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={resetImportResult}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
