import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/shared/footer';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
    it('renders a footer element', () => {
        render(<Footer />);
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders the privacy statement', () => {
        render(<Footer />);
        expect(
            screen.getByText(/Your transparency and privacy are our top priorities/i)
        ).toBeInTheDocument();
    });

    it('renders the StormCode attribution link', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /StormCode/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/sohila-hashem');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders the current year in the copyright notice', () => {
        render(<Footer />);
        const year = new Date().getFullYear().toString();
        expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    });

    it('renders the PandaCoins logo image', () => {
        render(<Footer />);
        const logo = screen.getByAltText('PandaCoins');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/favicon.png');
    });
});
