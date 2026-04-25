import { loadExpenses, mergeExpensesWithExisting, saveExpenses, mergeCustomCategoriesWithExisting } from "@/lib/storage";
import { validateImportedExpenses, downloadExpensesExportFile, type Expense, isPresetExpenseCategory } from "@/domain/expense";

export enum ImportMode {
    MERGE = 'merge',
    OVERWRITE = 'overwrite',
}

export enum ExpensesWorkerType {
    GENERATE_CSV = 'GENERATE_CSV',
    PARSE_CSV = 'PARSE_CSV',
}

export interface ImportOptions {
    mode: ImportMode;
    addMissingCategories: boolean;
}

import CsvWorker from '../workers/csv.worker.ts?worker';

/**
 * Communicates with the CSV Web Worker.
 */
async function runWorker(type: ExpensesWorkerType, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const worker = new CsvWorker();

        worker.onmessage = (event) => {
            const { type: responseType, payload: responsePayload, error } = event.data;
            if (responseType === 'SUCCESS') {
                resolve(responsePayload);
            } else {
                reject(new Error(error || 'Something went wrong. Please try again later.'));
            }
            worker.terminate();
        };

        worker.onerror = (error) => {
            console.error(error);
            reject(error);
            worker.terminate();
        };

        worker.postMessage({ type, payload });
    });
}

export async function exportExpenses(expensesToExport?: Expense[], fileName?: string) {
    try {
        const expenses = expensesToExport || loadExpenses();
        if (expenses.length === 0) {
            return { error: "No expenses to export." };
        }

        const csvContent = await runWorker(ExpensesWorkerType.GENERATE_CSV, expenses);
        downloadExpensesExportFile(csvContent, fileName);

        return { success: true };
    } catch (error) {
        console.error("Export error:", error);
        return { error: error instanceof Error ? error.message : "Failed to export expenses." };
    }
}

export async function importExpenses(file: File, options: ImportOptions) {
    try {
        const text = await file.text();
        const rawData = await runWorker(ExpensesWorkerType.PARSE_CSV, text);

        const { valid, errors } = validateImportedExpenses(rawData);

        if (valid.length === 0 && errors.length > 0) {
            return { error: `No valid expenses found. Errors: ${errors.slice(0, 3).join('; ')}` };
        }

        // Handle custom categories
        if (options.addMissingCategories) {
            const newCustomCategories = valid.filter((expense: Expense) => !isPresetExpenseCategory(expense.category)).map((expense: Expense) => expense.category);
            mergeCustomCategoriesWithExisting(newCustomCategories);
        }

        switch (options.mode) {
            case ImportMode.OVERWRITE:
                saveExpenses(valid);
                break;
            case ImportMode.MERGE:
                mergeExpensesWithExisting(valid);
                break;
        }

        return {
            success: true,
            count: valid.length,
            skippedCount: errors.length,
            errors: errors.length > 5 ? [...errors.slice(0, 5), `...and ${errors.length - 5} more`] : errors
        };
    } catch (error) {
        console.error("Import error:", error);
        return { error: error instanceof Error ? error.message : "Failed to import expenses." };
    }
}
