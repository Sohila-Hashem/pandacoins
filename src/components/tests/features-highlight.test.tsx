import { render, screen } from '@testing-library/react';
import { FeaturesHighlight } from '@/components/features-highlight';
import { describe, it, expect } from 'vitest';

describe('FeaturesHighlight', () => {
    it('renders the section heading', () => {
        render(<FeaturesHighlight />);
        expect(screen.getByText(/Master Your Money with/i)).toBeInTheDocument();
        expect(screen.getByText("Simplicity")).toBeInTheDocument();
    });

    it('renders the subtitle paragraph', () => {
        render(<FeaturesHighlight />);
        expect(
            screen.getByText(/PandaCoins provides the tools you need to track, analyze, and optimize/i)
        ).toBeInTheDocument();
    });

    it('renders all 9 feature card titles', () => {
        render(<FeaturesHighlight />);
        const expectedTitles = [
            'Extreme Simplicity',
            'No Account Needed',
            '100% Free',
            'Privacy First',
            'Straight to the Point',
            'Fully Customizable',
            'Offline Support',
            'Trend Comparison',
            'Local Sovereignty',
        ];
        for (const title of expectedTitles) {
            expect(screen.getByText(title)).toBeInTheDocument();
        }
    });

    it('renders all 9 feature card descriptions', () => {
        render(<FeaturesHighlight />);
        expect(screen.getByText(/Designed for speed and ease of use/i)).toBeInTheDocument();
        expect(screen.getByText(/Start tracking immediately with no sign-up/i)).toBeInTheDocument();
        expect(screen.getByText(/No hidden fees, no subscriptions/i)).toBeInTheDocument();
        expect(screen.getByText(/Your financial data stays on your device/i)).toBeInTheDocument();
        expect(screen.getByText(/Text-based, human-readable analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/Track in any currency and organize your spending/i)).toBeInTheDocument();
        expect(screen.getByText(/Install it as a PWA/i)).toBeInTheDocument();
        expect(screen.getByText(/Compare months with a single click/i)).toBeInTheDocument();
        expect(screen.getByText(/Export and import your data anytime/i)).toBeInTheDocument();
    });

    it('renders a "Coming Soon" badge on the "Local Sovereignty" card', () => {
        render(<FeaturesHighlight />);
        expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('renders exactly one "Coming Soon" badge', () => {
        render(<FeaturesHighlight />);
        expect(screen.getAllByText('Coming Soon')).toHaveLength(1);
    });
});
