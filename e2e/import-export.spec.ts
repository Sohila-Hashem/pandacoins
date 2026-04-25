import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe.configure({ mode: 'serial' });

test.describe('Import/Export Expenses', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        await page.goto('/');
        await page.waitForLoadState('networkidle');
        // Wait for a key element to be sure the app is ready
        await expect(page.getByRole('form', { name: /Add Expense/i })).toBeVisible();
    });

    test('should export expenses to a CSV file', async ({ page }) => {
        test.slow();
        const exportDesc = `Export Data ${Date.now()}`;

        // 1. Import some data first to have something to export
        const csvContent = 'id,amount,date,category,description\n' +
            `e2e-exp,500,2026-06-01T10:00:00.000Z,Entertainment,${exportDesc}`;

        const importFilePath = path.join(__dirname, 'data-for-export.csv');
        fs.writeFileSync(importFilePath, csvContent);

        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: /Import CSV/i }).click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(importFilePath);

        await expect(page.getByText('Import Expenses')).toBeVisible();
        await page.getByRole('button', { name: 'Start Import' }).click();
        await expect(page.getByText(/Import complete/i)).toBeVisible();

        // 2. Click Export
        await page.getByRole('button', { name: /Export CSV/i }).click();

        // 2b. Confirm Export in dialog
        await expect(page.getByText('Confirm Export')).toBeVisible();
        const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
        await page.getByRole('button', { name: 'Export Now' }).click();
        const download = await downloadPromise;

        // 3. Verify download
        expect(download.suggestedFilename()).toMatch(/^expenses-\d{4}-\d{2}-\d{2}\.csv$/);

        const filePath = path.join(__dirname, `test-export-${Date.now()}.csv`);
        await download.saveAs(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain(exportDesc);
        expect(content).toContain('500');

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (fs.existsSync(importFilePath)) fs.unlinkSync(importFilePath);
    });

    test('should import expenses from a CSV file', async ({ page }) => {
        test.slow();
        const uniqueImportDesc = `Imported Pizza ${Date.now()}`;

        // 1. Create a sample CSV
        const csvContent = 'id,amount,date,category,description\n' +
            `e2e-1,75.50,2026-05-01T10:00:00.000Z,Transport,Imported Taxi\n` +
            `e2e-2,120.00,2026-05-02T10:00:00.000Z,Food,${uniqueImportDesc}`;

        const importFilePath = path.join(__dirname, 'test-import.csv');
        fs.writeFileSync(importFilePath, csvContent);

        // 2. Upload the file
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: /Import CSV/i }).click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(importFilePath);

        // 3. Configure and start import
        await expect(page.getByText('Import Expenses')).toBeVisible();
        await page.getByRole('button', { name: 'Start Import' }).click();

        // 4. Verify success toast
        await expect(page.getByText(/Import complete/i)).toBeVisible({ timeout: 20000 });
        await expect(page.getByText(/Added 2 expenses/i)).toBeVisible();

        // 5. Verify expenses are in the table
        await expect(page.getByText('Imported Taxi')).toBeVisible();
        await expect(page.getByText(uniqueImportDesc)).toBeVisible();

        if (fs.existsSync(importFilePath)) fs.unlinkSync(importFilePath);
    });

    test('should handle invalid CSV rows during import', async ({ page }) => {
        test.slow();
        const validDesc = `Valid Row ${Date.now()}`;

        // 1. Create a CSV with one valid and one invalid row
        const csvContent = 'id,amount,date,category,description\n' +
            `e2e-valid,50,2026-05-01T10:00:00.000Z,Food,${validDesc}\n` +
            'e2e-invalid,NOT_A_NUMBER,invalid-date,Food,Invalid Row';

        const importFilePath = path.join(__dirname, 'test-invalid-import.csv');
        fs.writeFileSync(importFilePath, csvContent);

        // 2. Upload
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: /Import CSV/i }).click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(importFilePath);

        await expect(page.getByText('Import Expenses')).toBeVisible();
        await page.getByRole('button', { name: 'Start Import' }).click();

        // 3. Verify partial success
        await expect(page.getByText(/Import complete/i)).toBeVisible({ timeout: 20000 });
        await expect(page.getByText(/Added 1 expenses/i)).toBeVisible();
        await expect(page.getByText(/Skipped 1 invalid rows/i)).toBeVisible();

        // 4. Verify only valid row appears
        await expect(page.getByText(validDesc)).toBeVisible();

        if (fs.existsSync(importFilePath)) fs.unlinkSync(importFilePath);
    });
});
