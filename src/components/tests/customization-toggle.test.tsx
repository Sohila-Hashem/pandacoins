import { render, screen, waitFor } from '@testing-library/react';
import { CustomizationToggle } from '@/components/customization-toggle';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';

// ─── Mock next-themes ──────────────────────────────────────────────────────
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
}));

// ─── Mock useCurrency ──────────────────────────────────────────────────────
const mockSetCurrency = vi.fn();
vi.mock('@/hooks/use-currency', () => ({
    useCurrency: () => ({
        currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
        setCurrency: mockSetCurrency,
    }),
}));

const openCustomizationSheet = (user: UserEvent) => {
    render(<CustomizationToggle />);
    user.click(screen.getByRole('button', { name: /Open customization/i }));
};

describe('CustomizationToggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the trigger button with a screen-reader label', () => {
        render(<CustomizationToggle />);
        expect(screen.getByRole('button', { name: /Open customization/i })).toBeInTheDocument();
    });

    it('opens the sheet when the trigger is clicked', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);
        expect(await screen.findByText('Customization')).toBeInTheDocument();
    });

    it('shows the "Visual Theme" section in the sheet', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);
        expect(await screen.findByText('Visual Theme')).toBeInTheDocument();
    });

    it('renders Light, Dark, and System theme buttons in the sheet', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);
        expect(await screen.findByRole('button', { name: /Light/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Dark/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /System/i })).toBeInTheDocument();
    });

    it('calls setTheme with "dark" when the Dark button is clicked', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);
        await user.click(await screen.findByRole('button', { name: /Dark/i }));

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('shows the "Primary Currency" section in the sheet', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);

        expect(await screen.findByText('Primary Currency')).toBeInTheDocument();
    });

    it('renders currency options inside the sheet', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);

        // USD is the active currency – its code should appear inside the sheet
        await waitFor(() => {
            expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
        });
    });

    it('calls setCurrency when a currency row is clicked', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);

        // Click EUR row button
        const eurButton = await screen.findByRole('button', { name: /EUR/i });
        await user.click(eurButton);

        expect(mockSetCurrency).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'EUR' })
        );
    });

    it('shows the auto-save footer note', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);

        expect(
            await screen.findByText(/Changes are saved automatically/i)
        ).toBeInTheDocument();
    });

    it('highlights the currently active currency (USD) with a checkmark', async () => {
        const user = userEvent.setup();
        openCustomizationSheet(user);

        // The active currency button contains a Check icon (lucide svg)
        // The USD row should have an svg check icon rendered inside it
        const usdButtons = await screen.findAllByRole('button', { name: /USD/i });
        // At least one of them should contain the check icon (svg)
        const hasCheck = usdButtons.some((btn) => btn.querySelector('svg') !== null);
        expect(hasCheck).toBe(true);
    });
});
