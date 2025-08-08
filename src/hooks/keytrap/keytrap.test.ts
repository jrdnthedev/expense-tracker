import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyTrap } from './keytrap';
import { createRef } from 'react';

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  cb(0);
  return 0;
});

describe('useKeyTrap', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let modalRef: React.RefObject<HTMLElement | null>;
  let mockModal: HTMLElement;
  let mockButton1: HTMLButtonElement;
  let mockButton2: HTMLButtonElement;
  let mockInput: HTMLInputElement;

  beforeEach(() => {
    mockOnClose = vi.fn();
    modalRef = createRef<HTMLElement>();

    // Create mock DOM elements
    mockModal = document.createElement('div');
    mockButton1 = document.createElement('button');
    mockButton2 = document.createElement('button');
    mockInput = document.createElement('input');

    mockButton1.textContent = 'Button 1';
    mockButton2.textContent = 'Button 2';
    mockInput.type = 'text';

    mockModal.appendChild(mockButton1);
    mockModal.appendChild(mockInput);
    mockModal.appendChild(mockButton2);

    document.body.appendChild(mockModal);

    // Set the modal ref
    Object.defineProperty(modalRef, 'current', {
      value: mockModal,
      writable: true,
    });

    // Mock focus methods
    mockButton1.focus = vi.fn();
    mockButton2.focus = vi.fn();
    mockInput.focus = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    document.body.style.overflow = 'unset';
  });

  test('should not add event listeners when modal is closed', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() =>
      useKeyTrap({
        isOpen: false,
        onClose: mockOnClose,
        modalRef,
      })
    );

    // Check specifically for keydown event listener, not all event listeners
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  test('should add event listeners and set body overflow when modal is open', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('should focus first focusable element when modal opens', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    expect(mockButton1.focus).toHaveBeenCalled();
  });

  test('should store and restore last focused element', () => {
    const mockExistingElement = document.createElement('button');
    document.body.appendChild(mockExistingElement);
    mockExistingElement.focus = vi.fn();

    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: mockExistingElement,
      writable: true,
    });

    const { rerender } = renderHook(
      ({ isOpen }) =>
        useKeyTrap({
          isOpen,
          onClose: mockOnClose,
          modalRef,
        }),
      { initialProps: { isOpen: true } }
    );

    // Close the modal
    rerender({ isOpen: false });

    expect(mockExistingElement.focus).toHaveBeenCalled();
  });

  test('should call onClose when Escape key is pressed', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(keydownEvent);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not call onClose when Escape is pressed and modal is closed', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: false,
        onClose: mockOnClose,
        modalRef,
      })
    );

    const keydownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(keydownEvent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should handle Tab key to focus next element', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    // Mock activeElement as last element
    Object.defineProperty(document, 'activeElement', {
      value: mockButton2,
      writable: true,
    });

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
    });

    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
    document.dispatchEvent(tabEvent);

    expect(mockButton1.focus).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('should handle Shift+Tab key to focus previous element', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    // Mock activeElement as first element
    Object.defineProperty(document, 'activeElement', {
      value: mockButton1,
      writable: true,
    });

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
    });

    const preventDefaultSpy = vi.spyOn(shiftTabEvent, 'preventDefault');
    document.dispatchEvent(shiftTabEvent);

    expect(mockButton2.focus).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('should not trap focus when Tab is pressed on middle element', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );
    vi.clearAllMocks();
    // Mock activeElement as middle element
    Object.defineProperty(document, 'activeElement', {
      value: mockInput,
      writable: true,
    });

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
    document.dispatchEvent(tabEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(mockButton1.focus).not.toHaveBeenCalled();
    expect(mockButton2.focus).not.toHaveBeenCalled();
  });

  test('should handle modal with no focusable elements', () => {
    const emptyModal = document.createElement('div');
    document.body.appendChild(emptyModal);

    const emptyModalRef = createRef<HTMLElement>();
    Object.defineProperty(emptyModalRef, 'current', {
      value: emptyModal,
      writable: true,
    });

    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef: emptyModalRef,
      })
    );

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
    document.dispatchEvent(tabEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  test('should handle disabled elements correctly', () => {
    const disabledButton = document.createElement('button');
    disabledButton.disabled = true;
    disabledButton.focus = vi.fn();
    mockModal.appendChild(disabledButton);

    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    // The disabled button should not be focused
    expect(mockButton1.focus).toHaveBeenCalled();
    expect(disabledButton.focus).not.toHaveBeenCalled();
  });

  test('should clean up event listeners and restore body overflow on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
    expect(document.body.style.overflow).toBe('unset');
  });

  test('should handle null modal ref', () => {
    const nullModalRef = createRef<HTMLElement>();
    Object.defineProperty(nullModalRef, 'current', {
      value: null,
      writable: true,
    });

    expect(() => {
      renderHook(() =>
        useKeyTrap({
          isOpen: true,
          onClose: mockOnClose,
          modalRef: nullModalRef,
        })
      );
    }).not.toThrow();

    const keydownEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    expect(() => {
      document.dispatchEvent(keydownEvent);
    }).not.toThrow();
  });

  test('should handle various focusable element types', () => {
    const link = document.createElement('a');
    link.href = '#';
    const select = document.createElement('select');
    const textarea = document.createElement('textarea');
    const divWithTabIndex = document.createElement('div');
    divWithTabIndex.tabIndex = 0;

    mockModal.appendChild(link);
    mockModal.appendChild(select);
    mockModal.appendChild(textarea);
    mockModal.appendChild(divWithTabIndex);

    link.focus = vi.fn();
    select.focus = vi.fn();
    textarea.focus = vi.fn();
    divWithTabIndex.focus = vi.fn();

    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    // Should focus first element (button1)
    expect(mockButton1.focus).toHaveBeenCalled();

    // Test tab trapping with the last element being the div with tabindex
    Object.defineProperty(document, 'activeElement', {
      value: divWithTabIndex,
      writable: true,
    });

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault');
    document.dispatchEvent(tabEvent);

    expect(mockButton1.focus).toHaveBeenCalledTimes(2); // Once on open, once on tab wrap
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('should ignore other key presses', () => {
    renderHook(() =>
      useKeyTrap({
        isOpen: true,
        onClose: mockOnClose,
        modalRef,
      })
    );

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });

    document.dispatchEvent(spaceEvent);
    document.dispatchEvent(enterEvent);
    document.dispatchEvent(arrowEvent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
