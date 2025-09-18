import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('displays homepage with hero section', async ({ page }) => {
        await page.goto('/');

        // Check hero section
        await expect(page.getByRole('heading', { name: /secure paste sharing/i })).toBeVisible();
        await expect(page.getByText(/share code, text, and notes securely/i)).toBeVisible();

        // Check CTA buttons
        await expect(page.getByRole('link', { name: /create paste/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /learn more/i })).toBeVisible();
    });

    test('navigation works correctly', async ({ page }) => {
        await page.goto('/');

        // Check header navigation
        await expect(page.getByRole('link', { name: /privatepaste/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /create/i })).toBeVisible();

        // Test theme toggle
        const themeToggle = page.getByRole('button', { name: /toggle theme/i });
        await expect(themeToggle).toBeVisible();
        await themeToggle.click();
    });

    test('features section displays correctly', async ({ page }) => {
        await page.goto('/');

        // Check features
        await expect(page.getByText(/syntax highlighting/i)).toBeVisible();
        await expect(page.getByText(/password protection/i)).toBeVisible();
        await expect(page.getByText(/expiration options/i)).toBeVisible();
        await expect(page.getByText(/privacy focused/i)).toBeVisible();
    });
});

test.describe('Create Paste Flow', () => {
    test('can navigate to create paste page', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('link', { name: /create paste/i }).click();
        await expect(page).toHaveURL('/create');

        // Check create page elements
        await expect(page.getByRole('heading', { name: /create new paste/i })).toBeVisible();
    });

    test('create paste form renders correctly', async ({ page }) => {
        await page.goto('/create');

        // Check form elements
        await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /language/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /create paste/i })).toBeVisible();

        // Check advanced settings toggle
        const advancedToggle = page.getByRole('button', { name: /advanced settings/i });
        await expect(advancedToggle).toBeVisible();
        await advancedToggle.click();

        // Check advanced options appear
        await expect(page.getByRole('checkbox', { name: /password protect/i })).toBeVisible();
        await expect(page.getByRole('checkbox', { name: /private paste/i })).toBeVisible();
    });
});

test.describe('Theme Toggle', () => {
    test('can toggle between light and dark themes', async ({ page }) => {
        await page.goto('/');

        // Check initial theme (should be light by default)
        const html = page.locator('html');
        await expect(html).not.toHaveClass(/dark/);

        // Toggle to dark theme
        await page.getByRole('button', { name: /toggle theme/i }).click();
        await expect(html).toHaveClass(/dark/);

        // Toggle back to light theme
        await page.getByRole('button', { name: /toggle theme/i }).click();
        await expect(html).not.toHaveClass(/dark/);
    });
});

test.describe('Responsive Design', () => {
    test('mobile navigation works correctly', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Mobile menu should be visible
        const mobileMenuButton = page.getByRole('button', { name: /open main menu/i });
        if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            await expect(page.getByRole('link', { name: /create/i })).toBeVisible();
        }
    });

    test('desktop layout displays correctly', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        // Check desktop layout
        await expect(page.getByRole('link', { name: /privatepaste/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /create/i })).toBeVisible();
    });
});
