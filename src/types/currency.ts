export interface Currency {
  code: string;
  symbol: string;
  decimals: number;
  label: string;
  id: number;
}

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', decimals: 2, label: 'USD', id: 1 },
  EUR: { code: 'EUR', symbol: '€', decimals: 2, label: 'EUR', id: 2 },
  GBP: { code: 'GBP', symbol: '£', decimals: 2, label: 'GBP', id: 3 },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0, label: 'JPY', id: 4 },
  BHD: { code: 'BHD', symbol: '.د.ب', decimals: 3, label: 'BHD', id: 5 },
  CLF: { code: 'CLF', symbol: 'CLF$', decimals: 4, label: 'CLF', id: 6 },
};
