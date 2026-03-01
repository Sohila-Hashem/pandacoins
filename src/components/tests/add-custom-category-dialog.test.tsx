import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AddCustomCategoryDialog } from '../add-custom-category-dialog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build controlled-component props. Individual tests can override any field.
 *
 * The component is fully controlled (all state lives in the parent), so we use
 * vi.fn() stubs for every setter/callback and assert they are called correctly.
 */
function makeProps(overrides: Partial<React.ComponentProps<typeof AddCustomCategoryDialog>> = {}) {
    return {
        dialogOpen: true,           // render with dialog already open so content is visible
        handleDialogOpenChange: vi.fn(),
        newCategoryInput: '',
        setNewCategoryInput: vi.fn(),
        newCategoryError: '',
        setNewCategoryError: vi.fn(),
        handleAddCustomCategory: vi.fn(),
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── Trigger button ───────────────────────────────────────────────────────────

describe('AddCustomCategoryDialog – trigger button', () => {
    it('renders the trigger button with the correct aria-label', () => {
        render(<AddCustomCategoryDialog {...makeProps({ dialogOpen: false })} />);
        expect(screen.getByRole('button', { name: /add custom category/i })).toBeInTheDocument();
    });

    it('calls handleDialogOpenChange(true) when the trigger button is clicked', async () => {
        const user = userEvent.setup();
        const props = makeProps({ dialogOpen: false });
        render(<AddCustomCategoryDialog {...props} />);

        await user.click(screen.getByRole('button', { name: /add custom category/i }));

        expect(props.handleDialogOpenChange).toHaveBeenCalledWith(true);
    });
});

// ─── Dialog content ───────────────────────────────────────────────────────────

describe('AddCustomCategoryDialog – dialog content', () => {
    it('renders the dialog title and description when open', () => {
        render(<AddCustomCategoryDialog {...makeProps()} />);
        expect(screen.getByText(/new category/i)).toBeInTheDocument();
        expect(screen.getByText(/create a custom category/i)).toBeInTheDocument();
    });

    it('renders the input with the current value', () => {
        render(<AddCustomCategoryDialog {...makeProps({ newCategoryInput: 'Hobbies' })} />);
        expect(screen.getByRole('textbox')).toHaveValue('Hobbies');
    });

    it('displays the error message when newCategoryError is set', () => {
        render(<AddCustomCategoryDialog {...makeProps({ newCategoryError: 'Category name cannot be empty.' })} />);
        expect(screen.getByText('Category name cannot be empty.')).toBeInTheDocument();
    });

    it('does not render an error message when newCategoryError is empty', () => {
        render(<AddCustomCategoryDialog {...makeProps({ newCategoryError: '' })} />);
        expect(screen.queryByText(/cannot be empty/i)).not.toBeInTheDocument();
    });
});

// ─── Input interaction ────────────────────────────────────────────────────────

describe('AddCustomCategoryDialog – input interaction', () => {
    it('calls setNewCategoryInput and clears the error when the user types', async () => {
        const user = userEvent.setup();
        const props = makeProps();
        render(<AddCustomCategoryDialog {...props} />);

        await user.type(screen.getByRole('textbox'), 'A');

        expect(props.setNewCategoryInput).toHaveBeenCalled();
        expect(props.setNewCategoryError).toHaveBeenCalledWith('');
    });
});

// ─── Cancel button ────────────────────────────────────────────────────────────

describe('AddCustomCategoryDialog – Cancel button', () => {
    it('calls handleDialogOpenChange(false) when Cancel is clicked', async () => {
        const user = userEvent.setup();
        const props = makeProps();
        render(<AddCustomCategoryDialog {...props} />);

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(props.handleDialogOpenChange).toHaveBeenCalledWith(false);
    });
});

// ─── Add Category button ──────────────────────────────────────────────────────

describe('AddCustomCategoryDialog – Add Category button', () => {
    it('calls setNewCategoryError when input is empty and Add Category is clicked', async () => {
        const user = userEvent.setup();
        const props = makeProps({ newCategoryInput: '' });
        render(<AddCustomCategoryDialog {...props} />);

        await user.click(screen.getByRole('button', { name: /add category/i }));

        expect(props.setNewCategoryError).toHaveBeenCalledWith('Category name cannot be empty.');
        expect(props.handleAddCustomCategory).not.toHaveBeenCalled();
        expect(props.handleDialogOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('calls setNewCategoryError when input is whitespace-only and Add Category is clicked', async () => {
        const user = userEvent.setup();
        const props = makeProps({ newCategoryInput: '   ' });
        render(<AddCustomCategoryDialog {...props} />);

        await user.click(screen.getByRole('button', { name: /add category/i }));

        expect(props.setNewCategoryError).toHaveBeenCalledWith('Category name cannot be empty.');
        expect(props.handleAddCustomCategory).not.toHaveBeenCalled();
    });

    it('calls handleAddCustomCategory with trimmed value, resets state and closes dialog on valid input', async () => {
        const user = userEvent.setup();
        const props = makeProps({ newCategoryInput: '  Hobbies  ' });
        render(<AddCustomCategoryDialog {...props} />);

        await user.click(screen.getByRole('button', { name: /add category/i }));

        expect(props.handleAddCustomCategory).toHaveBeenCalledWith('Hobbies');
        expect(props.setNewCategoryInput).toHaveBeenCalledWith('');
        expect(props.setNewCategoryError).toHaveBeenCalledWith('');
        expect(props.handleDialogOpenChange).toHaveBeenCalledWith(false);
    });
});

// ─── Enter key ────────────────────────────────────────────────────────────────

describe('AddCustomCategoryDialog – Enter key', () => {
    it('submits on Enter when input has a valid value', async () => {
        const user = userEvent.setup();
        const props = makeProps({ newCategoryInput: 'Hobbies' });
        render(<AddCustomCategoryDialog {...props} />);

        await user.type(screen.getByRole('textbox'), '{Enter}');

        expect(props.handleAddCustomCategory).toHaveBeenCalledWith('Hobbies');
        expect(props.handleDialogOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows error on Enter when input is empty', async () => {
        const user = userEvent.setup();
        const props = makeProps({ newCategoryInput: '' });
        render(<AddCustomCategoryDialog {...props} />);

        await user.type(screen.getByRole('textbox'), '{Enter}');

        expect(props.setNewCategoryError).toHaveBeenCalledWith('Category name cannot be empty.');
        expect(props.handleAddCustomCategory).not.toHaveBeenCalled();
    });
});
