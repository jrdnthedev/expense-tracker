import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

vi.mock('./App.tsx', () => ({
  default: () => <div>App</div>,
}));

import { createRoot } from 'react-dom/client';

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const root = document.createElement('div');
    root.id = 'root';
    document.body.innerHTML = '';
    document.body.appendChild(root);
  });

  test('calls createRoot with the root element and renders', async () => {
    const mockRender = vi.fn();
    vi.mocked(createRoot).mockReturnValue({ render: mockRender } as unknown as ReturnType<typeof createRoot>);

    await import('./main');

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
