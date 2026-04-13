import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/shared/logo';
import { describe, it, expect } from 'vitest';

describe('Logo', () => {
    it('renders the logo image', () => {
        render(<Logo />);
        const img = screen.getByAltText('PandaCoins Logo');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/favicon.png');
    });

    it('renders "PandaCoins" text by default', () => {
        render(<Logo />);
        expect(screen.getByRole('heading', { level: 1, name: /PandaCoins/i })).toBeInTheDocument();
    });

    it('hides text when showText is false', () => {
        render(<Logo showText={false} />);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('accepts an extra className on the wrapper', () => {
        const { container } = render(<Logo className="my-custom-class" />);
        expect(container.firstChild).toHaveClass('my-custom-class');
    });
});
