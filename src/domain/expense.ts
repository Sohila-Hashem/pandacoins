import { format } from "date-fns";

export const CATEGORIES = [
    { category: 'Food' },
    { category: 'Transport' },
    { category: 'Utilities' },
    { category: 'Entertainment' },
    { category: 'Health' },
    { category: 'Wearables' },
    { category: 'Travel' },
    { category: 'Subscriptions' },
    { category: 'Self Care' },
    { category: 'Gifts' },
    { category: 'Medical' },
    { category: 'Education' },
    { category: 'Installments' },
    { category: 'Debt Payment' },
    { category: 'Withdrawals' },
    { category: 'Bills' },
    { category: 'Donations' },
    { category: 'Bank Fees' },
    { category: 'Fees' },
    { category: 'Investments' },
    { category: 'Savings' },
    { category: 'Loans' },
    { category: 'Taxes' },
    { category: 'Insurance' },
    { category: 'Transfers' },
    { category: 'Other' },
] as const

export const CATEGORIES_SORTED = [...CATEGORIES].sort((a, b) => a.category.localeCompare(b.category));

export type CustomCategory = string
export type PresetCategory = (typeof CATEGORIES)[number]['category']
export type ExpenseCategory = PresetCategory | CustomCategory;

export interface Expense {
    id: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
    description: string;
}

export const getTotalAmount = (expenses: Expense[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export const filterExpensesByMonth = (expenses: Expense[], month: string) => {
    const monthKey = format(new Date(month), 'yyyy-MM');
    return expenses.filter((expense) => format(new Date(expense.date), 'yyyy-MM') === monthKey);
}

export const getAvailableMonths = (expenses: Expense[]) => {
    const months = new Set<string>();
    expenses.forEach((expense) => {
        months.add(format(new Date(expense.date), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
}