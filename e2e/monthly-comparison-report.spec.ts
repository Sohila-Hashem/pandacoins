
import { CATEGORIES } from '@/domain/expense';
import { test, expect, type Page } from '@playwright/test';
import { format, subMonths } from 'date-fns';

const today = new Date();
const currentMonth = format(today, "yyyy-MM-dd")
const previousMonth = subMonths(currentMonth, 1);
const currentMonthLabel = format(currentMonth, 'MMMM yyyy');
const previousMonthLabel = format(previousMonth, 'MMMM yyyy');

const PREVIOUS_MONTH_SELECTED_DAY = '15';
const ADD_EXPENSE_BUTTON_TEXT = 'Add Expense';
const DESCRIPTION_INPUT_LABEL = 'Description';
const AMOUNT_INPUT_LABEL = 'Amount';
const DATE_INPUT_LABEL = 'Date';
const MONTHLY_COMPARISON_CARD_LABEL = 'Monthly Comparison';
const MONTHLY_COMPARISON_COMPARE_BUTTON_TEXT = 'Compare';
const MONTHLY_COMPARISON_REPORT_LABEL = 'Comparison Report';
const MONTHLY_COMPARISON_LOADING_TEXT = 'Crunching the numbers...';
const GO_TO_PREVIOUS_MONTH_BUTTON_LABEL = 'Go to the Previous Month';
const NO_EXPENSES_YET_TEXT = 'No expenses found';
const NO_EXPENSES_YET_OPTION_TEXT = 'No expenses yet';
const USD_SYMBOL = '$';

// Helper to add expense
const addExpense = async (page: Page, desc: string, amount: string, isPreviousMonth: boolean) => {
    // Fill Description
    await page.getByLabel(DESCRIPTION_INPUT_LABEL).fill(desc);
    // Fill Amount
    await page.getByLabel(AMOUNT_INPUT_LABEL).fill(amount);

    // Select Category
    const form = page.getByRole('form', { name: /Add Expense/i });
    await form.getByRole('combobox', { name: /category/i }).click();
    await page.getByRole('option', { name: CATEGORIES[0].category }).click();

    // Select Date
    await selectDate(page, PREVIOUS_MONTH_SELECTED_DAY, isPreviousMonth);

    // Submit
    await page.getByRole('button', { name: ADD_EXPENSE_BUTTON_TEXT }).click();

    // Verify and simple wait for toast/modal or list update
    await expect(page.getByText(desc)).toBeVisible();
};

const selectDate = async (page: Page, day: string, goToPreviousMonth = false) => {
    await page.getByLabel(DATE_INPUT_LABEL).click();

    if (goToPreviousMonth) {
        await page.getByLabel(GO_TO_PREVIOUS_MONTH_BUTTON_LABEL).click();
        await expect(page.getByText(previousMonthLabel)).toBeVisible();
    }

    const calendar = page.getByRole('grid');
    await expect(calendar).toBeVisible();
    await calendar.getByText(day, { exact: true }).click();
};

const runComparison = async (page: Page, monthLabel: string) => {
    const compareCard = page.getByRole('region', { name: MONTHLY_COMPARISON_CARD_LABEL });
    await compareCard.getByRole('combobox').click();
    await page.getByRole('option', { name: monthLabel }).click();
    await compareCard.getByRole('button', { name: MONTHLY_COMPARISON_COMPARE_BUTTON_TEXT }).click();

    // Wait for loading to start and finish
    await expect(compareCard.getByText(MONTHLY_COMPARISON_LOADING_TEXT)).toBeHidden({ timeout: 10000 });

    const reportArea = compareCard.getByLabel(MONTHLY_COMPARISON_REPORT_LABEL);
    await expect(reportArea).toBeVisible({ timeout: 10000 });
    return reportArea;
};

test.describe('Monthly Comparison Report', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Clear local storage and reload to ensure clean state
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForLoadState('networkidle');

        // ensure there are no expenses after clearing local storage
        await expect(page.getByText(NO_EXPENSES_YET_TEXT)).toBeVisible();

        // Open Customization Sheet
        await page.getByRole('button', { name: /customization/i }).click();

        // Select USD from the list
        await page.getByRole('button', { name: /USD/ }).click();

        // Close sheet (click outside or escape)
        await page.keyboard.press('Escape');
    });

    test('should toggle theme', async ({ page }) => {
        // Open Customization Sheet
        const toggleBtn = page.getByRole('button', { name: /customization/i });
        if (await toggleBtn.count() > 0) {
            await toggleBtn.click();
            await page.getByRole('button', { name: 'Dark' }).click();
            await expect(page.locator('html')).toHaveClass(/dark/);
            await page.keyboard.press('Escape');
        }
    });

    test('should generate a comparison report for two consecutive months', async ({ page }) => {
        // Add expense for current month ($150)
        await addExpense(page, 'Current Month Expense', '150', false);

        // Add expense for previous month ($100)
        await addExpense(page, 'Previous Month Expense', '100', true);

        // Interact with Comparison Component
        const reportArea = await runComparison(page, currentMonthLabel);
        const reportText = await reportArea.innerText();

        expect(reportText).toContain('Month Comparison');
        expect(reportText).toContain(`This month: ${USD_SYMBOL}150`);
        expect(reportText).toContain(`Last month: ${USD_SYMBOL}100`);
        expect(reportText).toContain(`Difference: +${USD_SYMBOL}50`);
        expect(reportText).toContain('You spent 50.0% MORE than last month');
        expect(reportText).toContain('Whoa there, big spender!');
    });

    test('should handle case with no previous month data', async ({ page }) => {
        const currentMonthLabel = format(currentMonth, 'MMMM yyyy');

        // Add expense ONLY for current month
        await page.getByLabel(DESCRIPTION_INPUT_LABEL).fill('Only Current Expense');
        await page.getByLabel(AMOUNT_INPUT_LABEL).fill('200');
        const form = page.getByRole('form', { name: /Add Expense/i });
        await form.getByRole('combobox', { name: /category/i }).click();
        await page.getByRole('option', { name: 'Food' }).click(); // Assuming 'Food' exists

        await page.getByLabel(DATE_INPUT_LABEL).click();
        const calendar = page.getByRole('grid');
        await expect(calendar).toBeVisible();
        await calendar.getByText('15', { exact: true }).click();

        await page.getByRole('button', { name: ADD_EXPENSE_BUTTON_TEXT }).click();
        await expect(page.getByText('Only Current Expense')).toBeVisible();

        // Interact with Comparison Component
        const reportArea = await runComparison(page, currentMonthLabel);
        const reportText = await reportArea.innerText();

        expect(reportText).toContain(`This month: ${USD_SYMBOL}200`);
        expect(reportText).toContain(`Last month: ${USD_SYMBOL}0`);
        expect(reportText).toContain(`Difference: +${USD_SYMBOL}200`);
        expect(reportText).toContain('Pretty much the same as last month!');
    });

    test('should handle empty state with no expenses at all', async ({ page }) => {
        // 1. Locate the card securely
        // We look for a container that has the heading "Compare Months"
        const compareCard = page.getByRole('region', { name: MONTHLY_COMPARISON_CARD_LABEL });

        // Ensure card is visible first (handling animation)
        await expect(compareCard).toBeVisible();

        const selectTrigger = compareCard.getByRole('combobox');

        // 2. Interact with dropdown
        await selectTrigger.click();

        // Should see "No expenses yet" disabled item
        const noExpensesItem = page.getByRole('option', { name: NO_EXPENSES_YET_OPTION_TEXT });
        await expect(noExpensesItem).toBeVisible();
        await expect(noExpensesItem).toBeDisabled();

        // 3. Close dropdown to ensure no interference
        await page.keyboard.press('Escape');

        // 4. Ensure "Compare" button is disabled
        const compareButton = compareCard.getByRole('button', { name: MONTHLY_COMPARISON_COMPARE_BUTTON_TEXT });
        await expect(compareButton).toBeVisible();
        await expect(compareButton).toBeDisabled();
    });
});
