import { render, screen } from '@testing-library/react';
import {
    BetaBadge,
    NewFeatureBadge,
    ProBadge,
    FreeBadge,
    ComingSoonBadge,
} from '@/components/shared/badges';
import { describe, it, expect } from 'vitest';

describe('Badges', () => {
    describe('BetaBadge', () => {
        it('renders "Beta" text', () => {
            render(<BetaBadge />);
            expect(screen.getByText('Beta')).toBeInTheDocument();
        });
    });

    describe('NewFeatureBadge', () => {
        it('renders "New" text', () => {
            render(<NewFeatureBadge />);
            expect(screen.getByText('New')).toBeInTheDocument();
        });
    });

    describe('ProBadge', () => {
        it('renders "Pro" text', () => {
            render(<ProBadge />);
            expect(screen.getByText('Pro')).toBeInTheDocument();
        });
    });

    describe('FreeBadge', () => {
        it('renders "Free" text', () => {
            render(<FreeBadge />);
            expect(screen.getByText('Free')).toBeInTheDocument();
        });
    });

    describe('ComingSoonBadge', () => {
        it('renders "Coming Soon" text', () => {
            render(<ComingSoonBadge />);
            expect(screen.getByText('Coming Soon')).toBeInTheDocument();
        });
    });
});
