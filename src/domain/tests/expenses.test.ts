import { describe, it, expect, vi } from "vitest";
import * as dateFns from "date-fns";
import {
    getTotalAmount,
    filterExpensesByMonth,
    filterExpensesByCategory,
    getAvailableMonths,
    validateImportedExpenses,
    mapToExpense,
    mergeExpenses,
    downloadExpensesExportFile,
    isPresetExpenseCategory
} from "@/domain/expense";
import type { Expense } from "@/domain/expense";

vi.mock('date-fns', async (importOriginal) => {
    const actual = await importOriginal<typeof import('date-fns')>();
    return {
        ...actual,
        parseISO: vi.fn(actual.parseISO),
        format: vi.fn(actual.format)
    };
});

const mockExpenses: Expense[] = [
    {
        id: "1",
        date: "2026-10-05T10:00:00.000Z",
        amount: 50,
        category: "Food",
        description: "Lunch",
    },
    {
        id: "2",
        date: "2026-10-15T12:00:00.000Z",
        amount: 150,
        category: "Wearables",
        description: "Clothes",
    },
    {
        id: "3",
        date: "2026-09-20T10:00:00.000Z",
        amount: 100,
        category: "Food",
        description: "Dinner",
    },
    {
        id: "4",
        date: "2026-10-25T14:00:00.000Z",
        amount: 25.50,
        category: "Transport",
        description: "Taxi",
    },
];

describe("Expense Domain Logic", () => {
    describe("Expense Helper Functions", () => {
        describe("getTotalAmount", () => {
            it("calcluates total amount correctly", () => {
                const total = getTotalAmount(mockExpenses);
                // 50 + 150 + 100 + 25.50 = 325.50
                expect(total).toBe(325.50);
            });

            it("returns 0 for empty expenses array", () => {
                expect(getTotalAmount([])).toBe(0);
            });
        });

        describe("filterExpensesByMonth", () => {
            it("returns expenses for the specified month", () => {
                const result = filterExpensesByMonth(mockExpenses, "2026-10");
                expect(result).toHaveLength(3);
                expect(result.map(e => e.id)).toEqual(expect.arrayContaining(["1", "2", "4"]));
                expect(result.find(e => e.id === "3")).toBeUndefined();
            });

            it("returns empty array when no expenses match the month", () => {
                const result = filterExpensesByMonth(mockExpenses, "2026-11");
                expect(result).toHaveLength(0);
            });
        });

        describe("getAvailableMonths", () => {
            it("returns unique months in descending order", () => {
                const months = getAvailableMonths(mockExpenses);
                expect(months).toEqual(["2026-10", "2026-09"]);
            });

            it("returns empty array for empty expenses", () => {
                expect(getAvailableMonths([])).toEqual([]);
            });
        });

        describe("filterExpensesByCategory", () => {
            it("returns only expenses matching the given preset category", () => {
                const result = filterExpensesByCategory(mockExpenses, "Food");
                expect(result).toHaveLength(2);
                expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(["1", "3"]));
            });

            it("returns empty array when no expense matches the category", () => {
                const result = filterExpensesByCategory(mockExpenses, "Entertainment");
                expect(result).toHaveLength(0);
            });

            it("matches a custom category string correctly", () => {
                const expensesWithCustom: Expense[] = [
                    ...mockExpenses,
                    { id: "5", date: "2026-10-01T10:00:00.000Z", amount: 30, category: "My Custom" as any, description: "Custom thing" },
                ];
                const result = filterExpensesByCategory(expensesWithCustom, "My Custom");
                expect(result).toHaveLength(1);
                expect(result[0].id).toBe("5");
            });

            it("returns empty array for empty expenses list", () => {
                expect(filterExpensesByCategory([], "Food")).toHaveLength(0);
            });
        });
    });

    describe('CSV and Import/Export Logic', () => {
        describe('mapToExpense', () => {
            it('should pick only defined fields and ignore others', () => {
                const raw = {
                    amount: 100,
                    date: '2023-01-01',
                    category: 'Food',
                    description: 'Pizza',
                    extraField: 'should be ignored',
                    nested: { obj: 1 }
                };

                const mapped = mapToExpense(raw);
                expect(mapped).toHaveProperty('amount', 100);
                expect(mapped).toHaveProperty('date', '2023-01-01');
                expect(mapped).toHaveProperty('category', 'Food');
                expect(mapped).toHaveProperty('description', 'Pizza');
                expect(mapped).not.toHaveProperty('extraField');
                expect(mapped).not.toHaveProperty('nested');
                expect(mapped).toHaveProperty('id'); // Should generate a uuid if missing
            });

            it('should handle string amounts', () => {
                const raw = { amount: '123.45', date: '2023-01-01', category: 'Food', description: 'Test' };
                const mapped = mapToExpense(raw);
                expect(mapped.amount).toBe(123.45);
            });
        });

        describe('validateImportedExpenses', () => {
            it('should return valid expenses for correct data', () => {
                const data = [
                    { amount: 50, date: '2023-05-01', category: 'Transport', description: 'Train' },
                    { amount: 20, date: '2023-05-02', category: 'Food', description: 'Coffee' }
                ];

                const { valid, errors } = validateImportedExpenses(data);
                expect(valid).toHaveLength(2);
                expect(errors).toHaveLength(0);
                expect(valid[0].amount).toBe(50);
                expect(valid[0].category).toBe('Transport');
            });

            it('should collect errors for invalid data', () => {
                const data = [
                    { amount: -10, date: 'invalid-date', category: '', description: '' }, // All invalid
                    { amount: 100, date: '2023-01-01', category: 'Food', description: 'Valid' }
                ];

                const { valid, errors } = validateImportedExpenses(data);
                expect(valid).toHaveLength(1);
                expect(errors).toHaveLength(1);
                expect(errors[0]).toContain('Row 2');
                expect(errors[0]).toContain('amount:');
                expect(errors[0]).toContain('date:');
            });

            it('should handle unexpected errors during parsing', () => {
                const data = [null];
                const { valid, errors } = validateImportedExpenses(data as any);
                expect(valid).toHaveLength(0);
                expect(errors).toHaveLength(1);
                expect(errors[0]).toContain('Unexpected error');
            });

            it('should handle dates that are already Date objects', () => {
                const now = new Date();
                const data = [{ amount: 10, date: now, category: 'Food', description: 'Date Obj' }];
                const { valid } = validateImportedExpenses(data);
                expect(valid).toHaveLength(1);
                expect(valid[0].date).toBe(now.toISOString());
            });

            it('should handle parseISO failures gracefully', () => {
                const data = [{ amount: 10, date: 'totally-invalid-date-string', category: 'Food', description: 'Fail' }];
                const { valid, errors } = validateImportedExpenses(data);
                expect(valid).toHaveLength(0);
                expect(errors).toHaveLength(1);
            });

            it('should handle parseISO throwing an error', () => {
                const mockedParseISO = vi.mocked(dateFns.parseISO);
                mockedParseISO.mockImplementationOnce(() => {
                    throw new Error('Parse error');
                });
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                const data = [{ amount: 10, date: 'trigger-throw', category: 'Food', description: 'Fail' }];
                const { valid, errors } = validateImportedExpenses(data);

                expect(valid).toHaveLength(0);
                expect(errors).toHaveLength(1);
                expect(consoleSpy).toHaveBeenCalled();

                consoleSpy.mockRestore();
            });
        });

        describe('mergeExpenses', () => {
            it('should merge and overwrite duplicates by ID', () => {
                const current: Expense[] = [
                    { id: '1', amount: 10, date: '2023-01-01', category: 'Food', description: 'Old' },
                    { id: '2', amount: 20, date: '2023-01-01', category: 'Transport', description: 'Keep' }
                ];
                const imported: Expense[] = [
                    { id: '1', amount: 15, date: '2023-01-01', category: 'Food', description: 'New' },
                    { id: '3', amount: 30, date: '2023-01-01', category: 'Bills', description: 'Fresh' }
                ];

                const merged = mergeExpenses(current, imported);
                expect(merged).toHaveLength(3);
                const item1 = merged.find(e => e.id === '1');
                expect(item1?.amount).toBe(15);
                expect(item1?.description).toBe('New');
            });
        });

        describe('downloadExpensesExportFile', () => {
            it('should create a link and trigger download', async () => {
                vi.useFakeTimers();
                const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
                const mockRevokeObjectURL = vi.fn();
                globalThis.URL.createObjectURL = mockCreateObjectURL;
                globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

                const mockClick = vi.fn();
                const mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));
                const mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as any));

                vi.spyOn(document, 'createElement').mockImplementation(() => ({
                    setAttribute: vi.fn(),
                    click: mockClick,
                    style: {},
                } as any));

                downloadExpensesExportFile('csv,content', 'test.csv');

                expect(mockCreateObjectURL).toHaveBeenCalled();
                expect(mockClick).toHaveBeenCalled();
                expect(mockAppendChild).toHaveBeenCalled();
                expect(mockRemoveChild).toHaveBeenCalled();

                await vi.advanceTimersByTimeAsync(300);
                expect(mockRevokeObjectURL).toHaveBeenCalled();

                vi.restoreAllMocks();
                vi.useRealTimers();
            });

            it('should use fallback file name if none provided', async () => {
                vi.useFakeTimers();
                const mockFormat = vi.mocked(dateFns.format);
                mockFormat.mockReturnValue('2023-01-01');

                const mockSetAttribute = vi.fn();
                vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
                    if (tagName === 'a') {
                        return {
                            setAttribute: mockSetAttribute,
                            click: vi.fn(),
                        } as any;
                    }
                    return {} as any;
                });
                vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));
                vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as any));

                downloadExpensesExportFile('csv,content');

                expect(mockSetAttribute).toHaveBeenCalledWith('download', 'expenses-2023-01-01.csv');

                await vi.advanceTimersByTimeAsync(300);
                vi.restoreAllMocks();
                vi.useRealTimers();
            });
        });

        describe('isPresetExpenseCategory', () => {
            it('should return true for preset categories', () => {
                expect(isPresetExpenseCategory('Food')).toBe(true);
                expect(isPresetExpenseCategory('Transport')).toBe(true);
            });

            it('should return false for custom categories', () => {
                expect(isPresetExpenseCategory('My Custom Cat' as any)).toBe(false);
            });
        });
    });
});
