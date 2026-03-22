export const LocalStorage = {
  set<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  get<T>(key: string, validate?: (value: unknown) => value is T): T | null {
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    try {
      const parsed: unknown = JSON.parse(item);
      if (validate && !validate(parsed)) return null;
      return parsed as T;
    } catch {
      return null;
    }
  },
  remove(key: string): void {
    window.localStorage.removeItem(key);
  },
  clear(): void {
    window.localStorage.clear();
  }
};