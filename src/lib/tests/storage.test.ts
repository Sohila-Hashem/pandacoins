import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    saveExpenses,
    loadExpenses,
    deleteExpense,
    updateExpense,
    saveCustomCategories,
    loadCustomCategories,
    loadCurrency,
    saveCurrency,
} from '@/lib/storage';
import type { Expense } from '@/domain/expense';

// ─── localStorage mock ────────────────────────────────────────────────────────

const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
const mockRemoveItem = vi.spyOn(Storage.prototype, 'removeItem');

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockExpenses: Expense[] = [
    { id: '1', description: 'Groceries', amount: 50, date: '2026-03-01', category: 'Food' },
    { id: '2', description: 'Bus pass', amount: 20, date: '2026-03-02', category: 'Transport' },
];

// ─── saveExpenses ─────────────────────────────────────────────────────────────

describe('saveExpenses', () => {
    it('serializes and stores expenses under the correct key', () => {
        saveExpenses(mockExpenses);
        expect(mockSetItem).toHaveBeenCalledWith('expenses', JSON.stringify(mockExpenses));
    });

    it('stores an empty array when called with no items', () => {
        saveExpenses([]);
        expect(mockSetItem).toHaveBeenCalledWith('expenses', '[]');
    });
});

// ─── loadExpenses ─────────────────────────────────────────────────────────────

describe('loadExpenses', () => {
    it('parses and returns the stored expenses', () => {
        mockGetItem.mockReturnValue(JSON.stringify(mockExpenses));
        const result = loadExpenses();
        expect(mockGetItem).toHaveBeenCalledWith('expenses');
        expect(result).toEqual(mockExpenses);
    });

    it('returns an empty array when nothing is stored', () => {
        mockGetItem.mockReturnValue(null);
        expect(loadExpenses()).toEqual([]);
    });
});

// ─── deleteExpense ────────────────────────────────────────────────────────────

describe('deleteExpense', () => {
    it('removes the expense with the matching id', () => {
        const result = deleteExpense('1', mockExpenses);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('returns the list unchanged when id is not found', () => {
        const result = deleteExpense('999', mockExpenses);
        expect(result).toHaveLength(2);
    });

    it('returns an empty array when deleting the only expense', () => {
        const result = deleteExpense('1', [mockExpenses[0]]);
        expect(result).toEqual([]);
    });
});

// ─── updateExpense ────────────────────────────────────────────────────────────

describe('updateExpense', () => {
    it('replaces the expense with matching id', () => {
        const updated: Expense = { ...mockExpenses[0], amount: 999, description: 'Updated' };
        const result = updateExpense(updated, mockExpenses);
        expect(result[0]).toEqual(updated);
        expect(result[1]).toEqual(mockExpenses[1]);
    });

    it('leaves other expenses untouched', () => {
        const updated: Expense = { ...mockExpenses[0], amount: 1 };
        const result = updateExpense(updated, mockExpenses);
        expect(result[1]).toEqual(mockExpenses[1]);
    });

    it('returns list unchanged when id is not found', () => {
        const notInList: Expense = { id: '999', description: 'Ghost', amount: 0, date: '2026-01-01', category: 'Other' };
        const result = updateExpense(notInList, mockExpenses);
        expect(result).toEqual(mockExpenses);
    });
});

// ─── saveCurrency ─────────────────────────────────────────────────────────────

describe('saveCurrency', () => {
    it('serializes and stores the currency under the correct key', () => {
        saveCurrency({ code: 'USD', symbol: '$', name: 'US Dollar' });
        expect(mockSetItem).toHaveBeenCalledWith(
            'currency',
            JSON.stringify({ code: 'USD', symbol: '$', name: 'US Dollar' })
        );
    });
});

// ─── loadCurrency ─────────────────────────────────────────────────────────────

describe('loadCurrency', () => {
    it('parses and returns the stored currency', () => {
        const currency = { code: 'EUR', symbol: '€', name: 'Euro' };
        mockGetItem.mockReturnValue(JSON.stringify(currency));
        const result = loadCurrency();
        expect(mockGetItem).toHaveBeenCalledWith('currency');
        expect(result).toEqual(currency);
    });

    it('returns null when nothing is stored', () => {
        mockGetItem.mockReturnValue(null);
        expect(loadCurrency()).toBeNull();
    });
});

// ─── saveCustomCategories ─────────────────────────────────────────────────────

describe('saveCustomCategories', () => {
    it('serializes and stores the categories under the correct key', () => {
        saveCustomCategories(['Food', 'Travel']);
        expect(mockSetItem).toHaveBeenCalledWith('custom_categories', JSON.stringify(['Food', 'Travel']));
    });

    it('stores an empty array when called with no items', () => {
        saveCustomCategories([]);
        expect(mockSetItem).toHaveBeenCalledWith('custom_categories', '[]');
    });
});

// ─── loadCustomCategories ─────────────────────────────────────────────────────

describe('loadCustomCategories', () => {
    it('parses and returns stored categories', () => {
        mockGetItem.mockReturnValue(JSON.stringify(['Food', 'Travel']));
        const result = loadCustomCategories();
        expect(mockGetItem).toHaveBeenCalledWith('custom_categories');
        expect(result).toEqual(['Food', 'Travel']);
    });

    it('returns an empty array when nothing is stored', () => {
        mockGetItem.mockReturnValue(null);
        expect(loadCustomCategories()).toEqual([]);
    });

    it('removes the corrupted entry and returns empty array when JSON is invalid', () => {
        mockGetItem.mockReturnValue('NOT_VALID_JSON{{{');
        const result = loadCustomCategories();
        expect(result).toEqual([]);
        expect(mockRemoveItem).toHaveBeenCalledWith('custom_categories');
    });
});
