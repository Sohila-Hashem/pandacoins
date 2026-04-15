import { test, expect } from '@playwright/test';

test.describe('Monthly Report', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should allow generating a monthly report after adding expenses', async ({ page }) => {
        // 1. Add an expense for the current month
        const form = page.getByRole('form', { name: 'Add Expense' });

        const description = 'Report Test Expense';
        await form.getByLabel('Description').fill(description);
        await form.getByLabel('Amount').fill('1500');
        await form.getByRole('combobox', { name: /category/i }).click();
        await page.getByRole('option', { name: 'Food' }).click();

        // Pick date (today)
        await form.getByLabel('Date').click();
        const today = new Date().getDate().toString();
        await page.getByRole('gridcell', { name: today }).first().click();

        // Submit
        await form.getByRole('button', { name: 'Add Expense' }).click();

        // Verify expense is added
        await expect(page.getByText(description)).toBeVisible();

        // 2. Generate Report
        // Locate the Monthly Report card
        const reportCard = page.getByRole('region', { name: 'Monthly Report' });

        // Select the month (First option should be the current month since we just added an expense)
        const monthSelectTrigger = reportCard.getByRole('combobox');
        await monthSelectTrigger.click();

        // Select the first available month (likely current month)
        // If "No expenses yet" is shown, something went wrong with adding/state
        await page.getByRole('option').first().click();

        // Click Generate
        const generateBtn = reportCard.getByRole('button', { name: /generate/i });
        await expect(generateBtn).toBeEnabled();
        await generateBtn.click();

        // 3. Verify Loading and Result
        await expect(reportCard.getByText('Analyzing your spending patterns...')).toBeVisible();

        // Wait for result
        // report text "Money Snapshot" should appear
        await expect(reportCard.getByText('Money Snapshot')).toBeVisible(); // This might timeout if timeout is short, but default is 30s
        await expect(reportCard.getByText('You spent a total of')).toBeVisible();
    });
});
