import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportExpenses, importExpenses, ImportMode, ExpensesWorkerType } from '../expenses';
import * as storage from '@/lib/storage';
import * as domain from '@/domain/expense';

vi.mock('@/lib/storage', () => ({
    loadExpenses: vi.fn(),
    saveExpenses: vi.fn(),
    mergeExpensesWithExisting: vi.fn(),
    mergeCustomCategoriesWithExisting: vi.fn(),
}));

vi.mock('@/domain/expense', () => ({
    validateImportedExpenses: vi.fn(),
    downloadExpensesExportFile: vi.fn(),
    isPresetExpenseCategory: vi.fn(),
}));

// Mock Worker
class MockWorker {
    onmessage: ((event: any) => void) | null = null;
    onerror: ((error: any) => void) | null = null;
    postMessage = vi.fn((_data: any) => {
        // Simulate success response from worker
        setTimeout(() => {
            if (this.onmessage) {
                if (_data.type === ExpensesWorkerType.GENERATE_CSV) {
                    this.onmessage({ data: { type: 'SUCCESS', payload: 'mock,csv,content' } });
                } else if (_data.type === ExpensesWorkerType.PARSE_CSV) {
                    this.onmessage({ data: { type: 'SUCCESS', payload: [{ amount: 10 }] } });
                }
            }
        }, 0);
    });
    terminate = vi.fn();
}

globalThis.Worker = MockWorker as any;
globalThis.URL.createObjectURL = vi.fn();

describe('Expenses API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('exportExpenses', () => {
        it('should export expenses successfully', async () => {
            vi.mocked(storage.loadExpenses).mockReturnValue([{ id: '1' } as any]);

            const result = await exportExpenses();

            expect(result.success).toBe(true);
            expect(domain.downloadExpensesExportFile).toHaveBeenCalledWith('mock,csv,content', undefined);
        });

        it('should return error if no expenses to export', async () => {
            vi.mocked(storage.loadExpenses).mockReturnValue([]);

            const result = await exportExpenses();

            expect(result.error).toBe('No expenses to export.');
            expect(domain.downloadExpensesExportFile).not.toHaveBeenCalled();
        });

        it('should handle worker errors', async () => {
            vi.mocked(storage.loadExpenses).mockReturnValue([{ id: '1' } as any]);

            // Mock Worker for this specific test to return error response
            const originalWorker = globalThis.Worker;
            globalThis.Worker = class extends MockWorker {
                postMessage = vi.fn((_data: any) => {
                    setTimeout(() => {
                        if (this.onmessage) {
                            this.onmessage({ data: { type: 'ERROR', error: 'Worker Failed' } } as any);
                        }
                    }, 0);
                });
            } as any;

            const result = await exportExpenses();

            expect(result.error).toBe('Worker Failed');

            globalThis.Worker = originalWorker;
        });

        it('should handle worker fatal errors via onerror', async () => {
            vi.mocked(storage.loadExpenses).mockReturnValue([{ id: '1' } as any]);

            const originalWorker = globalThis.Worker;
            globalThis.Worker = class extends MockWorker {
                postMessage = vi.fn((_data: any) => {
                    setTimeout(() => {
                        if (this.onerror) {
                            this.onerror(new Error('Fatal Worker Error'));
                        }
                    }, 0);
                });
            } as any;

            const result = await exportExpenses();

            expect(result.error).toBe('Fatal Worker Error');

            globalThis.Worker = originalWorker;
        });
    });

    describe('importExpenses', () => {
        const mockFile = new File(['csv content'], 'test.csv', { type: 'text/csv' });
        // Mock text() as it might not be available in all test environments
        mockFile.text = vi.fn().mockResolvedValue('csv content');

        const mockOptions = { mode: ImportMode.MERGE, addMissingCategories: true };

        it('should import expenses successfully (merge mode)', async () => {
            vi.mocked(domain.validateImportedExpenses).mockReturnValue({
                valid: [{ id: '1', category: 'Custom' } as any],
                errors: []
            });
            vi.mocked(domain.isPresetExpenseCategory).mockReturnValue(false);

            const result = await importExpenses(mockFile, mockOptions);

            expect(result.success).toBe(true);
            expect(result.count).toBe(1);
            expect(storage.mergeCustomCategoriesWithExisting).toHaveBeenCalledWith(['Custom']);
            expect(storage.mergeExpensesWithExisting).toHaveBeenCalled();
        });

        it('should import expenses successfully (overwrite mode)', async () => {
            vi.mocked(domain.validateImportedExpenses).mockReturnValue({
                valid: [{ id: '1', category: 'Food' } as any],
                errors: []
            });
            vi.mocked(domain.isPresetExpenseCategory).mockReturnValue(true);

            const result = await importExpenses(mockFile, { ...mockOptions, mode: ImportMode.OVERWRITE });

            expect(result.success).toBe(true);
            expect(storage.saveExpenses).toHaveBeenCalled();
        });

        it('should return error if no valid expenses found', async () => {
            vi.mocked(domain.validateImportedExpenses).mockReturnValue({
                valid: [],
                errors: ['Row 2: Invalid amount']
            });

            const result = await importExpenses(mockFile, mockOptions);

            expect(result.error).toContain('No valid expenses found');
            expect(result.error).toContain('Row 2: Invalid amount');
        });

        it('should handle file read errors', async () => {
            const badFile = new File([], 'bad.csv');
            badFile.text = vi.fn().mockRejectedValue(new Error('Read error'));

            const result = await importExpenses(badFile, mockOptions);

            expect(result.error).toBe('Read error');
        });
    });
});
