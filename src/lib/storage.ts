import type { CustomCategory, Expense } from "@/domain/expense";
import type { Currency } from "@/lib/constants";

const STORAGE_KEYS = {
    EXPENSES: "expenses",
    CURRENCY: "currency",
    CUSTOM_CATEGORIES: "custom_categories",
};

export const saveExpenses = (expenses: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export const loadExpenses = (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
}

export const deleteExpense = (id: string, expenses: Expense[]) => {
    return expenses.filter((e: Expense) => e.id !== id);
}

export const updateExpense = (expense: Expense, expenses: Expense[]) => {
    return expenses.map((e: Expense) => (e.id === expense.id ? expense : e))
}

export const loadCurrency = (): Currency | null => {
    const currency = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return currency ? JSON.parse(currency) : null;
}

export const saveCurrency = (currency: Currency) => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
}

export const loadCustomCategories = (): CustomCategory[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    if (!data) {
        return [];
    }
    try {
        const parsed = JSON.parse(data);
        return parsed as CustomCategory[];
    } catch {
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
        return []
    }
}

export const saveCustomCategories = (categories: CustomCategory[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
}