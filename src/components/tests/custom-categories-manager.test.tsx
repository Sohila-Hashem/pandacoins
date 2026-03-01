import { render, screen } from '@testing-library/react';
import { CustomCategoriesManager } from '../custom-categories-manager';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock Tooltip - Radix Tooltip can be tricky in JSDOM due to focus/hover
// We can just mock the content to be always visible or use a simpler mock if needed.
// However, standard testing-library often works if we just ignore the trigger logic and look for content.
// For simplicity, let's just mock the Tooltip component if it causes issues.
// But first, let's try with real components.

describe('CustomCategoriesManager', () => {
    const defaultProps = {
        customCategories: ['Category 1', 'Category 2'],
        onDeleteCustomCategory: vi.fn(),
        onUpdateCustomCategory: vi.fn(),
        onAddCustomCategory: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders null when there are no custom categories', () => {
        const { container } = render(<CustomCategoriesManager {...defaultProps} customCategories={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders the list of custom categories', () => {
        render(<CustomCategoriesManager {...defaultProps} />);
        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
        expect(screen.getByText(/Total: 2/i)).toBeInTheDocument();
    });

    it('starts editing when pencil icon is clicked', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        // Find edit button for Category 1
        // The button has aria-label="Edit Category 1 category"
        const editButton = screen.getByLabelText(/Edit Category 1 category/i);
        await user.click(editButton);

        // Input should appear with current value
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('Category 1');
    });

    it('shows error when resetting to empty name during edit', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        const input = screen.getByRole('textbox');

        await user.clear(input);
        await user.click(screen.getByLabelText(/Save category name/i));

        expect(screen.getByText(/Category name cannot be empty/i)).toBeInTheDocument();
    });

    it('submits updated name and calls onUpdateCustomCategory', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        const input = screen.getByRole('textbox');

        await user.clear(input);
        await user.type(input, 'Updated Category');
        await user.click(screen.getByLabelText(/Save category name/i));

        expect(defaultProps.onUpdateCustomCategory).toHaveBeenCalledWith('Category 1', 'Updated Category');
    });

    it('cancels editing when X icon is clicked', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        expect(screen.getByRole('textbox')).toBeInTheDocument();

        await user.click(screen.getByLabelText(/Cancel editing/i));
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('opens delete dialog and confirms deletion', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        // Click delete for Category 1
        await user.click(screen.getByLabelText(/Delete Category 1 category/i));

        // Check if dialog is open (looking for its content)
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
        expect(screen.getByText(/"Category 1"/i)).toBeInTheDocument();
        expect(screen.getByText(/NOT/)).toBeInTheDocument();
        expect(screen.getByText(/affect any existing expenses/i)).toBeInTheDocument();

        // Click confirm in dialog - role 'button' with name 'Delete'
        // Note: There are two 'Delete' buttons now: one in the list (Trash2 icon) and one in the dialog.
        // We need to be specific.
        const confirmButton = screen.getByRole('button', { name: /^Delete$/i });
        await user.click(confirmButton);

        expect(defaultProps.onDeleteCustomCategory).toHaveBeenCalledWith('Category 1');
    });

    it('opens add dialog and adds a new category', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        // Click 'Add custom category' button (trigger)
        await user.click(screen.getByLabelText(/Add custom category/i));

        // Check if dialog is open
        expect(screen.getByPlaceholderText(/Hobbies/i)).toBeInTheDocument();

        const input = screen.getByPlaceholderText(/Hobbies/i);
        await user.type(input, 'New Category');

        // Click 'Add Category' button in dialog (the submit button)
        await user.click(screen.getByRole('button', { name: /^Add Category$/i }));

        expect(defaultProps.onAddCustomCategory).toHaveBeenCalledWith('New Category');
    });

    it('saving with the same name is a no-op and collapses the edit row', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        // Do NOT change anything in the input – the value is already 'Category 1'
        await user.click(screen.getByLabelText(/Save category name/i));

        expect(defaultProps.onUpdateCustomCategory).not.toHaveBeenCalled();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('clears the edit error when the user types in the edit input', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        // Trigger the error by saving an empty input
        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        const input = screen.getByRole('textbox');
        await user.clear(input);
        await user.click(screen.getByLabelText(/Save category name/i));
        expect(screen.getByText(/Category name cannot be empty/i)).toBeInTheDocument();

        // Start typing – error should disappear
        await user.type(input, 'A');
        expect(screen.queryByText(/Category name cannot be empty/i)).not.toBeInTheDocument();
    });

    it('saves the edit when Enter is pressed inside the input', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        const input = screen.getByRole('textbox');
        await user.clear(input);
        await user.type(input, 'Renamed{Enter}');

        expect(defaultProps.onUpdateCustomCategory).toHaveBeenCalledWith('Category 1', 'Renamed');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('cancels the edit when Escape is pressed inside the input', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        await user.click(screen.getByLabelText(/Edit Category 1 category/i));
        expect(screen.getByRole('textbox')).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('closes delete dialog without deleting when dialog is dismissed', async () => {
        const user = userEvent.setup();
        render(<CustomCategoriesManager {...defaultProps} />);

        // Open delete dialog
        await user.click(screen.getByLabelText(/Delete Category 1 category/i));
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

        // Click the Cancel button inside the dialog
        await user.click(screen.getByRole('button', { name: /^Cancel$/i }));

        expect(defaultProps.onDeleteCustomCategory).not.toHaveBeenCalled();
        expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
    });
});
