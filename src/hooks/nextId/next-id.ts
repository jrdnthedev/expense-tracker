import { useMemo } from "react";

export function useNextId<T extends { id: number }>(items: T[] | null | undefined) {
  return useMemo(() => {
    if (!items || items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  }, [items]);
}