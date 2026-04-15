import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '@/components/shared/loading-overlay';
import { describe, it, expect } from 'vitest';

// @/assets/shapes/background-shape is stubbed via the vitest alias in vite.config.ts
// so the component can be imported without a transform error in jsdom.

describe('LoadingOverlay', () => {
    it('renders the default loading description when none is provided', () => {
        render(<LoadingOverlay />);
        expect(
            screen.getByText(/Please wait while we load your data/i)
        ).toBeInTheDocument();
    });

    it('renders a custom description when provided', () => {
        render(<LoadingOverlay description="Fetching your profile..." />);
        expect(screen.getByText('Fetching your profile...')).toBeInTheDocument();
    });

    it('renders the Logo inside the overlay', () => {
        render(<LoadingOverlay />);
        // Logo renders an <img> with alt "PandaCoins Logo"
        expect(screen.getByAltText('PandaCoins Logo')).toBeInTheDocument();
    });

    it('renders a spinner icon', () => {
        const { container } = render(<LoadingOverlay />);
        // Loader2Icon renders a lucide SVG — check it appears somewhere in the overlay
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThan(0);
    });
});
