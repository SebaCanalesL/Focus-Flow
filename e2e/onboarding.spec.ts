import { test, expect } from '@playwright/test';

const UI_URL = process.env.UI_URL || 'http://localhost:3000';

test.describe('Onboarding Flow', () => {
  // E2E-01: Verify that a new user gets the default habits created automatically.
  test('should create initial habits for a new user', async ({ page }) => {
    await page.goto(UI_URL);

    // Wait for the main dashboard to load. A good indicator is the presence of the main heading.
    await expect(page.locator('h1', { hasText: 'Panel de Hábitos' })).toBeVisible({ timeout: 15000 });

    // Check for the presence of the three default habits.
    // These texts should match the `name` property in `INITIAL_HABITS`.
    await expect(page.locator('div', { hasText: 'Agradecer 3 aspectos de mi vida' })).toBeVisible();
    await expect(page.locator('div', { hasText: 'Revisión de gastos semanal' })).toBeVisible();
    await expect(page.locator('div', { hasText: 'Leer 10 páginas' })).toBeVisible();
  });
});
