import { format, parseISO } from "date-fns";
import type { CustomCategory } from "@/domain/custom-categories";
import { expenseSchema } from "@/schemas/expense-schema";
import { v7 as uuid7 } from "uuid";

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

export const EXPENSE_EXPORT_FILE_PREFIX = "expenses";
export const EXPENSE_EXPORT_DATE_FORMAT = "yyyy-MM-dd";

export const CATEGORIES_SORTED = [...CATEGORIES].sort((a, b) => a.category.localeCompare(b.category));

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

export const filterExpensesByCategory = (expenses: Expense[], category: string) => {
    return expenses.filter((expense) => expense.category === category);
}

export const getAvailableMonths = (expenses: Expense[]) => {
    const months = new Set<string>();
    expenses.forEach((expense) => {
        months.add(format(new Date(expense.date), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
}

/**
 * Maps a raw expense object to an Expense object.
 * @param raw - The raw expense object.
 * @returns The mapped Expense object.
 */
export const mapToExpense = (raw: any): Partial<Expense> => {
    return {
        id: raw.id || uuid7(),
        amount: typeof raw.amount === 'string' ? Number.parseFloat(raw.amount) : raw.amount,
        date: raw.date, // Keep as string for now, we'll convert for validation
        category: raw.category,
        description: raw.description,
    };
};

/**
 * Validates imported expenses.
 * @param data - The raw data to validate.
 * @returns An object containing the valid expenses and any errors.
 */
export const validateImportedExpenses = (data: any[]): { valid: Expense[], errors: string[] } => {
    const valid: Expense[] = [];
    const errors: string[] = [];

    data.forEach((item, index) => {
        try {
            const mapped = mapToExpense(item);

            // Transform date string to Date object for Zod validation
            const rawDate = (item).date;
            let dateForValidation: Date | undefined;
            if (rawDate) {
                if (typeof rawDate === 'string') {
                    try {
                        dateForValidation = parseISO(rawDate);
                    } catch (e) {
                        console.error("parseISO failed for:", rawDate, e);
                    }
                } else if (rawDate instanceof Date) {
                    dateForValidation = rawDate;
                }
            }

            const forValidation = {
                ...mapped,
                date: dateForValidation
            };

            const result = expenseSchema.safeParse(forValidation);

            if (result.success) {
                valid.push({
                    id: mapped.id!,
                    amount: result.data.amount,
                    date: result.data.date.toISOString(),
                    category: result.data.category as ExpenseCategory,
                    description: result.data.description,
                });
            } else {
                const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                errors.push(`Row ${index + 2}: ${errorMessages}`);
            }
        } catch (err) {
            console.error(err);
            errors.push(`Row ${index + 2}: Unexpected error parsing row.`);
        }
    });

    return { valid, errors };
};

/**
 * Merges new expenses with existing ones.
 * If an ID already exists, the new one overwrites the old one.
 */
export const mergeExpenses = (current: Expense[], imported: Expense[]): Expense[] => {
    const expenseMap = new Map<string, Expense>();

    current.forEach(e => expenseMap.set(e.id, e));
    imported.forEach(e => expenseMap.set(e.id, e));

    return Array.from(expenseMap.values());
};

/**
 * Downloads the expenses export CSV content as a file.
 * @param csvContent - The CSV content to download.
 * @param fileName - The name of the file to download. Defaults to 'expenses-{today}.csv'.
 */
export const downloadExpensesExportFile = (csvContent: string, fileName?: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const fallbackFileName = `${EXPENSE_EXPORT_FILE_PREFIX}-${format(new Date(), EXPENSE_EXPORT_DATE_FORMAT)}.csv`;
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName || fallbackFileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Delay revocation to ensure the browser has started the download
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 300);
}


export const isPresetExpenseCategory = (category: ExpenseCategory): category is PresetCategory => {
    return CATEGORIES_SORTED.some((c) => c.category === category);
}