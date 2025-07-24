export const LocalStorage = {
  set<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  get<T>(key: string): T | null {
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
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