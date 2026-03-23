import { describe, test, expect } from 'vitest';
import { protectedRoutes, type ProtectedRoute } from './protected-routes';

describe('protectedRoutes', () => {
  test('exports an array of routes', () => {
    expect(Array.isArray(protectedRoutes)).toBe(true);
    expect(protectedRoutes.length).toBeGreaterThan(0);
  });

  test('each route has a path and element', () => {
    protectedRoutes.forEach((route: ProtectedRoute) => {
      expect(route.path).toBeDefined();
      expect(typeof route.path).toBe('string');
      expect(route.path.startsWith('/')).toBe(true);
      expect(route.element).toBeDefined();
    });
  });

  test('contains all expected paths', () => {
    const paths = protectedRoutes.map((r) => r.path);

    expect(paths).toContain('/dashboard');
    expect(paths).toContain('/budgetmanager');
    expect(paths).toContain('/analytics');
    expect(paths).toContain('/settings');
    expect(paths).toContain('/expenselist');
    expect(paths).toContain('/categorymanagement');
  });

  test('has no duplicate paths', () => {
    const paths = protectedRoutes.map((r) => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  test('all paths are lowercase', () => {
    protectedRoutes.forEach((route) => {
      expect(route.path).toBe(route.path.toLowerCase());
    });
  });
});
