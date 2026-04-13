import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/hero-section';
import { describe, it, expect } from 'vitest';

describe('HeroSection', () => {
    it('renders the main heading', () => {
        render(<HeroSection />);
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByText(/Money/i)).toBeInTheDocument();
    });

    it('renders the tagline badge', () => {
        render(<HeroSection />);
        expect(screen.getByText(/Your Personal Finance Companion/i)).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(<HeroSection />);
        expect(screen.getByText(/Track every coin, discover hidden spending patterns/i)).toBeInTheDocument();
    });

    it('renders the CTA buttons', () => {
        render(<HeroSection />);
        expect(screen.getByRole('link', { name: /Start Tracking Now/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Explore Features/i })).toBeInTheDocument();
    });

    it('renders trust badges', () => {
        render(<HeroSection />);
        expect(screen.getByText('Zero Tracking')).toBeInTheDocument();
        expect(screen.getByText('Offline First')).toBeInTheDocument();
        expect(screen.getByText('Smart Insights')).toBeInTheDocument();
    });

    it('"Start Tracking Now" links to #manage-expenses', () => {
        render(<HeroSection />);
        const link = screen.getByRole('link', { name: /Start Tracking Now/i });
        expect(link).toHaveAttribute('href', '#manage-expenses');
    });

    it('"Explore Features" links to #features', () => {
        render(<HeroSection />);
        const link = screen.getByRole('link', { name: /Explore Features/i });
        expect(link).toHaveAttribute('href', '#features');
    });
});
