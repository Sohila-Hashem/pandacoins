import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImportOptionsDialog } from '../import-options-dialog';
import { ImportMode } from '@/api/expenses';

describe('ImportOptionsDialog', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        fileName: 'test.csv',
    };

    it('renders correctly when open', () => {
        render(<ImportOptionsDialog {...defaultProps} />);
        expect(screen.getByText('Import Expenses')).toBeInTheDocument();
        expect(screen.getByText('test.csv')).toBeInTheDocument();
        expect(screen.getByText('Merge')).toBeInTheDocument();
        expect(screen.getByText('Overwrite')).toBeInTheDocument();
    });

    it('calls onClose when Cancel is clicked', () => {
        render(<ImportOptionsDialog {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('toggles mode between Merge and Overwrite', () => {
        render(<ImportOptionsDialog {...defaultProps} />);
        
        const mergeBtn = screen.getByText('Merge').closest('button')!;
        const overwriteBtn = screen.getByText('Overwrite').closest('button')!;

        // Overwrite selected
        fireEvent.click(overwriteBtn);
        fireEvent.click(screen.getByText('Start Import'));
        expect(defaultProps.onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            mode: ImportMode.OVERWRITE
        }));

        // Merge selected
        fireEvent.click(mergeBtn);
        fireEvent.click(screen.getByText('Start Import'));
        expect(defaultProps.onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            mode: ImportMode.MERGE
        }));
    });

    it('toggles "Auto-add missing categories" checkbox', () => {
        render(<ImportOptionsDialog {...defaultProps} />);
        const checkboxBtn = screen.getByLabelText(/Enable auto-add missing categories|Disable auto-add missing categories/);

        // Initially true (based on default state in component)
        expect(checkboxBtn).toHaveAttribute('aria-pressed', 'true');

        // Toggle to false
        fireEvent.click(checkboxBtn);
        expect(checkboxBtn).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(screen.getByText('Start Import'));
        expect(defaultProps.onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            addMissingCategories: false
        }));

        // Toggle back to true
        fireEvent.click(checkboxBtn);
        expect(checkboxBtn).toHaveAttribute('aria-pressed', 'true');
        fireEvent.click(screen.getByText('Start Import'));
        expect(defaultProps.onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            addMissingCategories: true
        }));
    });
});
