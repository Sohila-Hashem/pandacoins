import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/hero-section';
import { describe, it, expect } from 'vitest';

describe('HeroSection', () => {
    it('renders the main heading correctly', () => {
        render(<HeroSection />);
        expect(screen.getByText(/PandaCoins/i)).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(<HeroSection />);
        expect(screen.getByText(/Track your expenses, discover spending patterns/i)).toBeInTheDocument();
    });

    it('renders all feature items', () => {
        render(<HeroSection />);
        expect(screen.getByText('Easy expense tracking')).toBeInTheDocument();
        expect(screen.getByText('Smart monthly insights')).toBeInTheDocument();
        expect(screen.getByText('Month-to-month comparisons')).toBeInTheDocument();
    });
});
