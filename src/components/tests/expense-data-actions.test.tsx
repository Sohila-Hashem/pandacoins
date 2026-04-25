import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseDataActions } from '../expense-data-actions';
import * as api from '@/api/expenses';
import { toast } from 'sonner';
import type { Expense } from '@/domain/expense';

vi.mock('@/api/expenses', () => ({
    exportExpenses: vi.fn(),
    importExpenses: vi.fn(),
    ImportMode: {
        MERGE: 'merge',
        OVERWRITE: 'overwrite'
    }
}));

vi.mock('sonner', () => ({
    toast: {
        promise: vi.fn(async (promise, data) => {
            try {
                const res = await promise;
                if (data?.success) {
                    if (typeof data.success === 'function') {
                        data.success(res);
                    }
                }
            } catch (err) {
                if (data?.error) {
                    if (typeof data.error === 'function') {
                        data.error(err);
                    }
                }
            } finally {
                if (data?.finally) {
                    data.finally();
                }
            }
            return promise;
        }),
        loading: vi.fn().mockReturnValue('loading-id'),
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockedExpenses: Expense[] = [{
    id: '1',
    amount: 100,
    category: 'groceries',
    description: 'groceries',
    date: '2022-01-01',
}, {
    id: '2',
    amount: 100,
    category: 'groceries',
    description: 'groceries',
    date: '2022-01-01',
}];

describe('ExpenseDataActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders import and export buttons', () => {
        render(<ExpenseDataActions />);
        expect(screen.getByText('Import CSV')).toBeInTheDocument();
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('triggers file input click when Import CSV button is clicked', () => {
        const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
        render(<ExpenseDataActions />);
        
        fireEvent.click(screen.getByText('Import CSV'));
        
        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });

    it('calls exportExpenses when Export CSV is clicked', async () => {
        vi.mocked(api.exportExpenses).mockResolvedValue({ success: true });
        render(<ExpenseDataActions expensesToExport={mockedExpenses} />);

        fireEvent.click(screen.getByText('Export CSV'));

        // Confirmation dialog should appear
        expect(screen.getByText('Confirm Export')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Export Now'));

        expect(api.exportExpenses).toHaveBeenCalled();
        expect(toast.promise).toHaveBeenCalled();
    });

    it('shows error if trying to export zero expenses', async () => {
        render(<ExpenseDataActions expensesToExport={[]} />);

        fireEvent.click(screen.getByText('Export CSV'));

        expect(toast.error).toHaveBeenCalledWith("No expenses found to export.");
        expect(api.exportExpenses).not.toHaveBeenCalled();
    });

    it('opens dialog when a file is selected', async () => {
        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByText('Import Expenses')).toBeInTheDocument();
        expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    it('calls importExpenses when dialog is confirmed', async () => {
        vi.mocked(api.importExpenses).mockResolvedValue({ success: true, count: 5, skippedCount: 0, errors: [] });
        const onImportSuccess = vi.fn();

        const { container } = render(<ExpenseDataActions onImportSuccess={onImportSuccess} />);

        // Select file
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(input, { target: { files: [file] } });

        // Confirm dialog
        fireEvent.click(screen.getByText('Start Import'));

        await waitFor(() => {
            expect(api.importExpenses).toHaveBeenCalledWith(file, expect.any(Object));
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Import complete!'), expect.any(Object));
            expect(onImportSuccess).toHaveBeenCalled();
        });
    });

    it('shows error toast if import fails', async () => {
        vi.mocked(api.importExpenses).mockResolvedValue({ error: 'Bad file' });

        const { container } = render(<ExpenseDataActions />);

        // Select file
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(input, { target: { files: [file] } });

        // Confirm dialog
        fireEvent.click(screen.getByText('Start Import'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Bad file', expect.any(Object));
        });
    });

    it('shows skipped rows message in success toast', async () => {
        vi.mocked(api.importExpenses).mockResolvedValue({ success: true, count: 5, skippedCount: 2, errors: [] });

        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv'], 'test.csv');
        fireEvent.change(input, { target: { files: [file] } });

        fireEvent.click(screen.getByText('Start Import'));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                'Import complete!',
                expect.objectContaining({
                    description: expect.stringContaining('Skipped 2 invalid rows')
                })
            );
        });
    });

    it('throws error in success callback if data has error (export)', async () => {
        vi.mocked(api.exportExpenses).mockResolvedValue({ error: 'Export failed' });
        render(<ExpenseDataActions expensesToExport={mockedExpenses} />);

        fireEvent.click(screen.getByText('Export CSV'));
        fireEvent.click(screen.getByText('Export Now'));

        // toast.promise handles the success/error callbacks
        const promiseCall = vi.mocked(toast.promise).mock.calls.find(call => call[1]?.success);
        if (!promiseCall) throw new Error('toast.promise success callback not found');

        const successCallback = (promiseCall[1] as any).success;

        expect(() => successCallback({ error: 'Export failed' })).toThrow('Export failed');
        expect(successCallback({ success: true })).toBe('Expenses exported successfully!');
    });

    it('handles unexpected errors during import', async () => {
        vi.mocked(api.importExpenses).mockRejectedValue(new Error('Unexpected Crash'));

        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv content'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(input, { target: { files: [file] } });

        fireEvent.click(screen.getByText('Start Import'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred during import.', expect.any(Object));
        });
    });

    it('shows default error message if result.error is missing', async () => {
        vi.mocked(api.importExpenses).mockResolvedValue({ error: '' });

        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv'], 'test.csv');
        fireEvent.change(input, { target: { files: [file] } });

        fireEvent.click(screen.getByText('Start Import'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Import failed', expect.any(Object));
        });
    });

    it('handles file change with no file', async () => {
        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [] } });
        expect(screen.queryByText('Import Expenses')).not.toBeInTheDocument();
    });

    it('resets file input value after selection', async () => {
        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['csv'], 'test.csv');
        fireEvent.change(input, { target: { files: [file] } });
        
        expect(input.value).toBe('');
    });

    it('disables export button while exporting', async () => {
        // Use a promise that doesn't resolve immediately
        let resolveExport: (value: any) => void = () => {};
        const exportPromise = new Promise((resolve) => { resolveExport = resolve; });
        vi.mocked(api.exportExpenses).mockReturnValue(exportPromise as any);

        render(<ExpenseDataActions expensesToExport={mockedExpenses} />);

        fireEvent.click(screen.getByText('Export CSV'));
        fireEvent.click(screen.getByText('Export Now'));

        expect(screen.getByRole('button', { name: /Export CSV/i })).toBeDisabled();

        await act(async () => {
            resolveExport({ success: true });
        });
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Export CSV/i })).not.toBeDisabled();
        });
    });

    it('disables import button while importing', async () => {
        let resolveImport: (value: any) => void = () => {};
        const importPromise = new Promise((resolve) => { resolveImport = resolve; });
        vi.mocked(api.importExpenses).mockReturnValue(importPromise as any);

        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv'], 'test.csv');
        fireEvent.change(input, { target: { files: [file] } });

        fireEvent.click(screen.getByText('Start Import'));

        expect(screen.getByRole('button', { name: /Import CSV/i })).toBeDisabled();

        await act(async () => {
            resolveImport({ success: true, count: 1, skippedCount: 0, errors: [] });
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Import CSV/i })).not.toBeDisabled();
        });
    });

    it('handles export promise error callback', async () => {
        render(<ExpenseDataActions expensesToExport={mockedExpenses} />);

        fireEvent.click(screen.getByText('Export CSV'));
        fireEvent.click(screen.getByText('Export Now'));

        const promiseCall = vi.mocked(toast.promise).mock.calls.find(call => call[1]?.error);
        if (!promiseCall) throw new Error('toast.promise error callback not found');

        const errorCallback = (promiseCall[1] as any).error;
        expect(errorCallback(new Error('Network error'))).toBe('Network error');
    });

    it('clears pending file when dialog is closed', async () => {
        const { container } = render(<ExpenseDataActions />);
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['csv'], 'test.csv');
        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByText('Import Expenses')).toBeInTheDocument();
        
        // Find and click Cancel button in dialog
        fireEvent.click(screen.getByText('Cancel'));
        
        await waitFor(() => {
            expect(screen.queryByText('Import Expenses')).not.toBeInTheDocument();
        });
    });

    it('closes export confirmation when Cancel is clicked', async () => {
        render(<ExpenseDataActions expensesToExport={mockedExpenses} />);

        fireEvent.click(screen.getByText('Export CSV'));
        expect(screen.getByText('Confirm Export')).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('Cancel'));
        
        await waitFor(() => {
            expect(screen.queryByText('Confirm Export')).not.toBeInTheDocument();
        });
    });
});
