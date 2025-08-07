import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LocalStorage } from './local-storage';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('LocalStorage', () => {
  beforeEach(() => {
    mockLocalStorage.store = {};
    vi.clearAllMocks();
  });

  describe('set', () => {
    test('should store string value', () => {
      LocalStorage.set('test-key', 'test-value');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '"test-value"');
    });

    test('should store object value as JSON', () => {
      const testObject = { name: 'John', age: 30 };
      LocalStorage.set('user', testObject);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(testObject));
    });

    test('should store array value as JSON', () => {
      const testArray = [1, 2, 3, 'test'];
      LocalStorage.set('numbers', testArray);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('numbers', JSON.stringify(testArray));
    });

    test('should store null value', () => {
      LocalStorage.set('null-key', null);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('null-key', 'null');
    });

    test('should store boolean value', () => {
      LocalStorage.set('bool-key', true);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bool-key', 'true');
    });

    test('should store number value', () => {
      LocalStorage.set('num-key', 42);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('num-key', '42');
    });
  });

  describe('get', () => {
    test('should retrieve and parse stored string value', () => {
      mockLocalStorage.store['test-key'] = '"test-value"';
      
      const result = LocalStorage.get<string>('test-key');
      
      expect(result).toBe('test-value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    test('should retrieve and parse stored object value', () => {
      const testObject = { name: 'John', age: 30 };
      mockLocalStorage.store['user'] = JSON.stringify(testObject);
      
      const result = LocalStorage.get<typeof testObject>('user');
      
      expect(result).toEqual(testObject);
    });

    test('should retrieve and parse stored array value', () => {
      const testArray = [1, 2, 3, 'test'];
      mockLocalStorage.store['numbers'] = JSON.stringify(testArray);
      
      const result = LocalStorage.get<typeof testArray>('numbers');
      
      expect(result).toEqual(testArray);
    });

    test('should return null for non-existent key', () => {
      const result = LocalStorage.get('non-existent');
      
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('non-existent');
    });

    test('should return null for invalid JSON', () => {
      mockLocalStorage.store['invalid'] = 'invalid-json{';
      
      const result = LocalStorage.get('invalid');
      
      expect(result).toBeNull();
    });

    test('should retrieve null value correctly', () => {
      mockLocalStorage.store['null-key'] = 'null';
      
      const result = LocalStorage.get('null-key');
      
      expect(result).toBeNull();
    });

    test('should retrieve boolean value correctly', () => {
      mockLocalStorage.store['bool-key'] = 'true';
      
      const result = LocalStorage.get<boolean>('bool-key');
      
      expect(result).toBe(true);
    });

    test('should retrieve number value correctly', () => {
      mockLocalStorage.store['num-key'] = '42';
      
      const result = LocalStorage.get<number>('num-key');
      
      expect(result).toBe(42);
    });
  });

  describe('remove', () => {
    test('should remove item from localStorage', () => {
      LocalStorage.remove('test-key');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    test('should remove existing item', () => {
      mockLocalStorage.store['existing-key'] = '"some-value"';
      
      LocalStorage.remove('existing-key');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('existing-key');
      expect(mockLocalStorage.store['existing-key']).toBeUndefined();
    });
  });

  describe('clear', () => {
    test('should clear all localStorage items', () => {
      LocalStorage.clear();
      
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    test('should remove all stored items', () => {
      mockLocalStorage.store['key1'] = '"value1"';
      mockLocalStorage.store['key2'] = '"value2"';
      
      LocalStorage.clear();
      
      expect(mockLocalStorage.store).toEqual({});
    });
  });

  describe('integration tests', () => {
    test('should set and get the same value', () => {
      const testData = { id: 1, name: 'Test', active: true };
      
      LocalStorage.set('integration-test', testData);
      const result = LocalStorage.get<typeof testData>('integration-test');
      
      expect(result).toEqual(testData);
    });

    test('should handle set, get, and remove workflow', () => {
      const testValue = 'workflow-test';
      
      // Set
      LocalStorage.set('workflow', testValue);
      expect(LocalStorage.get<string>('workflow')).toBe(testValue);
      
      // Remove
      LocalStorage.remove('workflow');
      expect(LocalStorage.get('workflow')).toBeNull();
    });

    test('should handle complex nested objects', () => {
      const complexObject = {
        user: {
          id: 1,
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true,
              preferences: ['email', 'sms']
            }
          }
        },
        metadata: {
          lastLogin: '2025-08-07T12:00:00Z',
          loginCount: 42
        }
      };
      
      LocalStorage.set('complex', complexObject);
      const result = LocalStorage.get<typeof complexObject>('complex');
      
      expect(result).toEqual(complexObject);
    });
  });
});