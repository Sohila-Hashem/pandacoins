import { render, screen } from '@testing-library/react';
import { DeleteCustomCategoryDialog } from '../delete-custom-category-dialog';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('DeleteCustomCategoryDialog', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        categoryName: 'Test Category',
        onConfirm: vi.fn(),
    };

    it('renders correctly with category name', () => {
        render(<DeleteCustomCategoryDialog {...defaultProps} />);
        expect(screen.getByText(/Delete Category/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
        expect(screen.getByText(/"Test Category"/i)).toBeInTheDocument();
        expect(screen.getByText(/NOT/)).toBeInTheDocument();
        expect(screen.getByText(/affect any existing expenses/i)).toBeInTheDocument();
    });

    it('calls onConfirm when Delete button is clicked', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        render(<DeleteCustomCategoryDialog {...defaultProps} onConfirm={onConfirm} />);

        const deleteButton = screen.getByRole('button', { name: /Delete/i });
        await user.click(deleteButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenChange when Cancel button is clicked', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(<DeleteCustomCategoryDialog {...defaultProps} onOpenChange={onOpenChange} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        await user.click(cancelButton);

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
