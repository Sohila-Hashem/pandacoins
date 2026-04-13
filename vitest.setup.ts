import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock IntersectionObserver (required by motion/react whileInView)
global.IntersectionObserver = class IntersectionObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
} as unknown as typeof IntersectionObserver;

// Mock ScrollIntoView and Pointer Events for Radix UI
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.setPointerCapture = vi.fn();

