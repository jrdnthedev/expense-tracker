import { describe, test, expect } from 'vitest';
import { formatAmount } from './currency';
import type { Currency } from '../types/currency';

// Mock currencies
const mockCurrencies = {
  usd: {
    code: 'USD',
    symbol: '$',
    decimals: 2
  } as Currency,
  eur: {
    code: 'EUR',
    symbol: '€',
    decimals: 2
  } as Currency,
  jpy: {
    code: 'JPY',
    symbol: '¥',
    decimals: 0
  } as Currency,
  btc: {
    code: 'BTC',
    symbol: '₿',
    decimals: 8
  } as Currency,
  noDecimals: {
      code: 'TEST',
      symbol: '#',
      decimals: undefined
  } as unknown as Currency
};

describe('formatAmount', () => {
  test('should format basic amounts with default 2 decimals', () => {
    const result = formatAmount(100, mockCurrencies.usd);
    expect(result).toBe('$100.00');
  });

  test('should format amounts with thousands separators', () => {
    const result = formatAmount(1234.56, mockCurrencies.usd);
    expect(result).toBe('$1,234.56');
  });

  test('should format large amounts with multiple comma separators', () => {
    const result = formatAmount(1234567.89, mockCurrencies.usd);
    expect(result).toBe('$1,234,567.89');
  });

  test('should format very large amounts', () => {
    const result = formatAmount(1234567890.12, mockCurrencies.usd);
    expect(result).toBe('$1,234,567,890.12');
  });

  test('should handle zero amount', () => {
    const result = formatAmount(0, mockCurrencies.usd);
    expect(result).toBe('$0.00');
  });

  test('should handle negative amounts', () => {
    const result = formatAmount(-1234.56, mockCurrencies.usd);
    expect(result).toBe('$-1,234.56');
  });

  test('should handle different currency symbols', () => {
    const result = formatAmount(100.50, mockCurrencies.eur);
    expect(result).toBe('€100.50');
  });

  test('should handle currencies with zero decimals', () => {
    const result = formatAmount(1234.56, mockCurrencies.jpy);
    expect(result).toBe('¥1,235');
  });

  test('should handle currencies with high decimal precision', () => {
    const result = formatAmount(1.23456789, mockCurrencies.btc);
    expect(result).toBe('₿1.23456789');
  });

  test('should handle currencies with undefined decimals (defaults to 2)', () => {
    const result = formatAmount(123.456, mockCurrencies.noDecimals);
    expect(result).toBe('#123.46');
  });

  test('should handle small decimal amounts', () => {
    const result = formatAmount(0.01, mockCurrencies.usd);
    expect(result).toBe('$0.01');
  });

  test('should handle amounts that need rounding', () => {
    const result = formatAmount(123.456789, mockCurrencies.usd);
    expect(result).toBe('$123.46');
  });

  test('should handle amounts with no decimal part needed', () => {
    const result = formatAmount(1000, mockCurrencies.usd);
    expect(result).toBe('$1,000.00');
  });

  test('should handle edge case with single digit amounts', () => {
    const result = formatAmount(5, mockCurrencies.usd);
    expect(result).toBe('$5.00');
  });

  test('should handle amounts just under thousands', () => {
    const result = formatAmount(999.99, mockCurrencies.usd);
    expect(result).toBe('$999.99');
  });

  test('should handle amounts just over thousands', () => {
    const result = formatAmount(1000.01, mockCurrencies.usd);
    expect(result).toBe('$1,000.01');
  });

  test('should handle very small amounts with high precision currency', () => {
    const result = formatAmount(0.00000001, mockCurrencies.btc);
    expect(result).toBe('₿0.00000001');
  });

  test('should handle negative zero', () => {
    const result = formatAmount(-0, mockCurrencies.usd);
    expect(result).toBe('$0.00');
  });

  test('should handle floating point precision issues', () => {
    const result = formatAmount(0.1 + 0.2, mockCurrencies.usd); // 0.30000000000000004
    expect(result).toBe('$0.30');
  });
});