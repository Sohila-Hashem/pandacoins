import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

// Mock IntersectionObserver (required by motion/react whileInView)
globalThis.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
} as unknown as typeof IntersectionObserver;

// Mock ScrollIntoView and Pointer Events for Radix UI
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.setPointerCapture = vi.fn();

