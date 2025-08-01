import type { Currency } from "../types/currency";

export const formatAmount = (amount: number, currency: Currency) => {
  const decimals = currency.decimals ?? 2;
  
  // Format the number with commas for thousands
  const parts = amount.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${currency.symbol}${parts.join('.')}`;
};