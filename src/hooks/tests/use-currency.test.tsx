import { renderHook, act } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from '@/hooks/use-currency';
import { CURRENCIES } from '@/lib/constants';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';

// ─── helpers ───────────────────────────────────────────────────────────────
const USD = CURRENCIES.find((c) => c.code === 'USD')!;
const EUR = CURRENCIES.find((c) => c.code === 'EUR')!;

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CurrencyProvider>{children}</CurrencyProvider>
);

// ─── tests ─────────────────────────────────────────────────────────────────
describe('useCurrency', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('throws when used outside CurrencyProvider', () => {
        // Suppress the expected React error boundary noise
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useCurrency())).toThrow(
            'useCurrency must be used within a CurrencyProvider'
        );
        spy.mockRestore();
    });

    it('defaults to the first currency (EGP) when localStorage is empty', () => {
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.currency.code).toBe(CURRENCIES[0].code);
    });

    it('loads the previously persisted currency from localStorage', () => {
        localStorage.setItem('currency', JSON.stringify(USD));
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.currency.code).toBe('USD');
    });

    it('updates currency state and persists to localStorage via setCurrency', () => {
        const { result } = renderHook(() => useCurrency(), { wrapper });

        act(() => {
            result.current.setCurrency(EUR);
        });

        expect(result.current.currency.code).toBe('EUR');
        const stored = JSON.parse(localStorage.getItem('currency') ?? 'null');
        expect(stored?.code).toBe('EUR');
    });

    it('marks isInitialized as true after mount', async () => {
        const { result } = renderHook(() => useCurrency(), { wrapper });
        // isInitialized is set synchronously after the effect runs
        expect(result.current.isInitialized).toBe(true);
    });

    it('ignores an unknown currency code stored in localStorage', () => {
        localStorage.setItem('currency', JSON.stringify({ code: 'XYZ', symbol: '?', name: 'Unknown' }));
        const { result } = renderHook(() => useCurrency(), { wrapper });
        // Falls back to the default (CURRENCIES[0]) since XYZ is not in the list
        expect(result.current.currency.code).toBe(CURRENCIES[0].code);
    });
});
