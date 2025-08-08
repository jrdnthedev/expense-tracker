import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNextId } from './next-id';

interface TestItem {
  id: number;
  name: string;
}

describe('useNextId', () => {
  test('should return 1 for empty array', () => {
    const { result } = renderHook(() => useNextId([]));
    
    expect(result.current).toBe(1);
  });

  test('should return 1 for null or undefined items', () => {
  const { result: nullResult } = renderHook(() => 
    useNextId(null as TestItem[] | null)
  );
  
  const { result: undefinedResult } = renderHook(() => 
    useNextId(undefined as TestItem[] | undefined)
  );
  
  expect(nullResult.current).toBe(1);
  expect(undefinedResult.current).toBe(1);
});

  test('should return next id for single item', () => {
    const items: TestItem[] = [{ id: 5, name: 'Item 1' }];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(6);
  });

  test('should return next id for multiple items', () => {
    const items: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 3, name: 'Item 2' },
      { id: 2, name: 'Item 3' },
    ];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(4);
  });

  test('should handle non-sequential ids', () => {
    const items: TestItem[] = [
      { id: 10, name: 'Item 1' },
      { id: 25, name: 'Item 2' },
      { id: 5, name: 'Item 3' },
    ];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(26);
  });

  test('should handle negative ids', () => {
    const items: TestItem[] = [
      { id: -5, name: 'Item 1' },
      { id: -1, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(4);
  });

  test('should handle zero id', () => {
    const items: TestItem[] = [
      { id: 0, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(3);
  });

  test('should memoize result when items array reference is same', () => {
    const items: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    
    const { result, rerender } = renderHook(
      ({ items }) => useNextId(items),
      { initialProps: { items } }
    );

    const firstResult = result.current;
    expect(firstResult).toBe(3);

    // Rerender with same array reference
    rerender({ items });
    
    expect(result.current).toBe(firstResult);
    expect(result.current).toBe(3);
  });

  test('should recalculate when items array changes', () => {
    const initialItems: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    
    const { result, rerender } = renderHook(
      ({ items }) => useNextId(items),
      { initialProps: { items: initialItems } }
    );

    expect(result.current).toBe(3);

    // Add new item with higher id
    const updatedItems: TestItem[] = [
      ...initialItems,
      { id: 5, name: 'Item 3' },
    ];
    
    rerender({ items: updatedItems });
    
    expect(result.current).toBe(6);
  });

  test('should handle items with only id property', () => {
    const items = [{ id: 10 }, { id: 20 }, { id: 15 }];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(21);
  });

  test('should work with different object shapes', () => {
    interface Category {
      id: number;
      name: string;
      icon: string;
    }

    interface Expense {
      id: number;
      amount: number;
      description: string;
    }

    const categories: Category[] = [
      { id: 1, name: 'Food', icon: '🍕' },
      { id: 3, name: 'Transport', icon: '🚗' },
    ];

    const expenses: Expense[] = [
      { id: 5, amount: 25.50, description: 'Lunch' },
      { id: 8, amount: 15.00, description: 'Bus fare' },
    ];

    const { result: categoryResult } = renderHook(() => useNextId(categories));
    const { result: expenseResult } = renderHook(() => useNextId(expenses));
    
    expect(categoryResult.current).toBe(4);
    expect(expenseResult.current).toBe(9);
  });

  test('should handle very large ids', () => {
    const items: TestItem[] = [
      { id: Number.MAX_SAFE_INTEGER - 1, name: 'Item 1' },
      { id: 1000, name: 'Item 2' },
    ];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(Number.MAX_SAFE_INTEGER);
  });

  test('should not recalculate when items content changes but array reference stays same', () => {
    const items: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    
    const { result, rerender } = renderHook(
      ({ items }) => useNextId(items),
      { initialProps: { items } }
    );

    const firstResult = result.current;
    expect(firstResult).toBe(3);

    // Mutate the array content (not recommended in React, but testing memoization)
    items[0].name = 'Changed Item 1';
    
    rerender({ items });
    
    // Should still be the same result due to memoization
    expect(result.current).toBe(firstResult);
    expect(result.current).toBe(3);
  });

  test('should handle array with duplicate ids', () => {
    const items: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 3, name: 'Item 2' },
      { id: 3, name: 'Item 3' }, // Duplicate id
      { id: 2, name: 'Item 4' },
    ];
    const { result } = renderHook(() => useNextId(items));
    
    expect(result.current).toBe(4);
  });
});