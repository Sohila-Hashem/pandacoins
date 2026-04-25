import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseDataActions } from '../expense-data-actions';
import * as api from '@/api/expenses';
import { toast } from 'sonner';

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
        promise: vi.fn((promise, _data) => promise),
        loading: vi.fn().mockReturnValue('loading-id'),
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ExpenseDataActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders import and export buttons', () => {
        render(<ExpenseDataActions />);
        expect(screen.getByText('Import CSV')).toBeInTheDocument();
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('calls exportExpenses when Export CSV is clicked', async () => {
        vi.mocked(api.exportExpenses).mockResolvedValue({ success: true });
        render(<ExpenseDataActions />);

        fireEvent.click(screen.getByText('Export CSV'));

        expect(api.exportExpenses).toHaveBeenCalled();
        expect(toast.promise).toHaveBeenCalled();
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
});
