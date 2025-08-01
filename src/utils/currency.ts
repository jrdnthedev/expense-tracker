import type { Currency } from "../types/currency";

export const formatAmount = (amount: number, currency: Currency) => {
  const decimals = currency.decimals ?? 2;
  return `${currency.symbol}${amount.toFixed(decimals)}`;
};