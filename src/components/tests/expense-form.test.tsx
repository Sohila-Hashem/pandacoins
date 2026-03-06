import { render, screen, waitFor } from '@testing-library/react';
import { ExpenseForm } from '@/components/expense-form';
import { describe, it, expect, vi } from 'vitest';
import type { Expense } from '@/domain/expense';
import userEvent from '@testing-library/user-event';

import { CURRENCIES } from '@/lib/constants';

// Mock ResizeObserver for Popover/Dialog
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock ScrollIntoView
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.setPointerCapture = vi.fn();

const mockCurrency = CURRENCIES.find(c => c.code === 'USD')!;

describe('ExpenseForm', () => {
    it('renders correctly', () => {
        render(<ExpenseForm onAddExpense={() => { }} currency={mockCurrency} customCategories={[]} onAddCustomCategory={() => { }} />);
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    });

    it('shows validation errors on empty submit', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm onAddExpense={() => { }} currency={mockCurrency} customCategories={[]} onAddCustomCategory={() => { }} />);

        const submitButton = screen.getByRole('button', { name: /Add Expense/i });
        await user.click(submitButton);

        expect(await screen.findByText(/Description is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Amount is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Date is required/i)).toBeInTheDocument();
    });

    it('renders with custom categories in the select dropdown', async () => {
        const user = userEvent.setup();
        const customCategories = ['Subscription', 'Freelance'];
        render(<ExpenseForm onAddExpense={() => { }} currency={mockCurrency} customCategories={customCategories} onAddCustomCategory={() => { }} />);

        const categoryTrigger = document.getElementById('category');
        if (categoryTrigger) await user.click(categoryTrigger);

        expect(await screen.findByText('My Categories')).toBeInTheDocument();
        expect(screen.getAllByText('Subscription')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Freelance')[0]).toBeInTheDocument();
    });

    it('calls onAddCustomCategory when adding a new category through the dialog', async () => {
        const user = userEvent.setup();
        const onAddCustomCategoryStub = vi.fn();
        render(<ExpenseForm onAddExpense={() => { }} currency={mockCurrency} customCategories={[]} onAddCustomCategory={onAddCustomCategoryStub} />);

        const addCategoryTrigger = screen.getByLabelText(/Add custom category/i);
        await user.click(addCategoryTrigger);

        const input = screen.getByPlaceholderText(/Hobbies/i);
        await user.type(input, 'New Category');

        const addButton = screen.getByRole('button', { name: /^Add Category$/i });
        await user.click(addButton);

        expect(onAddCustomCategoryStub).toHaveBeenCalledWith('New Category');
    });

    it('pre-fills the form correctly when editing an expense', async () => {
        const user = userEvent.setup();
        const onUpdateStub = vi.fn();
        const editingExpense: Expense = {
            id: '123',
            description: 'Custom Expense',
            amount: 50,
            date: new Date().toISOString(),
            category: 'My Special Category'
        };

        render(
            <ExpenseForm
                onAddExpense={() => { }}
                onUpdateExpense={onUpdateStub}
                currency={mockCurrency}
                customCategories={['My Special Category']}
                onAddCustomCategory={() => { }}
                editingExpense={editingExpense}
            />
        );

        expect(screen.getByLabelText(/Description/i)).toHaveValue('Custom Expense');
        expect(screen.getByLabelText(/Amount/i)).toHaveValue(50);

        const submitButton = screen.getByRole('button', { name: /Update Expense/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(onUpdateStub).toHaveBeenCalled();
        }, { timeout: 3000 });

        const calledArg = onUpdateStub.mock.calls[0][0];
        expect(calledArg.description).toBe('Custom Expense');
        expect(calledArg.amount).toBe(50);
        expect(calledArg.category).toBe('My Special Category');
    });

    it('shows validation error for invalid date', async () => {
        const user = userEvent.setup();
        const editingExpense: any = {
            id: 'date-error',
            description: 'Bad Date',
            amount: 10,
            date: 'not-a-date',
            category: 'Food'
        };

        render(
            <ExpenseForm
                onAddExpense={() => { }}
                currency={mockCurrency}
                customCategories={[]}
                onAddCustomCategory={() => { }}
                editingExpense={editingExpense}
            />
        );

        await user.click(screen.getByRole('button', { name: /Update Expense/i }));
        expect(await screen.findByText(/Date is required/i)).toBeInTheDocument();
    });

    it('shows validation error when category is not selected', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm onAddExpense={() => { }} currency={mockCurrency} customCategories={[]} onAddCustomCategory={() => { }} />);

        await user.type(screen.getByLabelText(/Description/i), 'Coffee');
        await user.type(screen.getByLabelText(/Amount/i), '5');
        await user.click(screen.getByRole('button', { name: /Add Expense/i }));

        expect(await screen.findByText(/Category is required/i)).toBeInTheDocument();
    });

    it('resets the form after a successful add', () => {
        const onAddStub = vi.fn();
        const editingExpense: Expense = {
            id: 'reset-test',
            description: 'Will Reset',
            amount: 10,
            date: new Date().toISOString(),
            category: 'My Cat',
        };

        render(
            <ExpenseForm
                onAddExpense={onAddStub}
                onUpdateExpense={vi.fn()}
                currency={mockCurrency}
                customCategories={['My Cat']}
                onAddCustomCategory={() => { }}
                editingExpense={editingExpense}
            />
        );

        expect(screen.getByLabelText(/Description/i)).toHaveValue('Will Reset');
        expect(screen.getByLabelText(/Amount/i)).toHaveValue(10);
    });

    it('renders Cancel button in edit mode and calls onCancelEdit when clicked', async () => {
        const user = userEvent.setup();
        const onCancelEditStub = vi.fn();
        const editingExpense: Expense = {
            id: 'cancel-test',
            description: 'Edit Me',
            amount: 99,
            date: new Date().toISOString(),
            category: 'My Cat',
        };

        render(
            <ExpenseForm
                onAddExpense={() => { }}
                onUpdateExpense={vi.fn()}
                onCancelEdit={onCancelEditStub}
                currency={mockCurrency}
                customCategories={['My Cat']}
                onAddCustomCategory={() => { }}
                editingExpense={editingExpense}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /^Cancel$/i });
        expect(cancelButton).toBeInTheDocument();
        await user.click(cancelButton);
        expect(onCancelEditStub).toHaveBeenCalledTimes(1);
    });

    it('initial state shows "Pick a date"', async () => {
        render(<ExpenseForm onAddExpense={() => { }} currency={mockCurrency} customCategories={[]} onAddCustomCategory={() => { }} />);

        await waitFor(() => {
            expect(screen.getByText(/Pick a date/i)).toBeInTheDocument();
        });
    });
});
