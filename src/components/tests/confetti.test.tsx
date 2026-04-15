import { render, act } from '@testing-library/react';
import { Confetti } from '@/components/shared/confetti';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Confetti', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders nothing when trigger is false', () => {
        const { container } = render(<Confetti trigger={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders 120 confetti pieces when trigger is true', () => {
        const { container } = render(<Confetti trigger={true} />);
        expect(container.firstChild).toHaveClass('fixed');
        expect(container.firstChild?.childNodes.length).toBe(120);
    });

    it('renders the wrapper with pointer-events-none so it does not block UI', () => {
        const { container } = render(<Confetti trigger={true} />);
        expect(container.firstChild).toHaveClass('pointer-events-none');
    });

    it('clears pieces after 5000ms', () => {
        const { container } = render(<Confetti trigger={true} />);
        expect(container).not.toBeEmptyDOMElement();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(container).toBeEmptyDOMElement();
    });

    it('does not clear pieces before 5000ms', () => {
        const { container } = render(<Confetti trigger={true} />);

        act(() => {
            vi.advanceTimersByTime(4999);
        });

        expect(container).not.toBeEmptyDOMElement();
    });

    it('re-triggers when trigger flips from false to true', () => {
        const { container, rerender } = render(<Confetti trigger={false} />);
        expect(container).toBeEmptyDOMElement();

        rerender(<Confetti trigger={true} />);
        expect(container.firstChild?.childNodes.length).toBe(120);
    });
});
