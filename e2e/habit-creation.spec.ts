import { test, expect } from '@playwright/test';

const UI_URL = process.env.UI_URL || 'http://localhost:3000';

// E2E-02: Test the full user flow for creating a new daily habit.

test.describe('Habit Creation Flow', () => {
  test('should allow a user to create a new daily habit', async ({ page }) => {
    await page.goto(UI_URL);

    // 1. Initial setup: Wait for the page to be ready.
    await expect(page.locator('h1', { hasText: 'Panel de Hábitos' })).toBeVisible({ timeout: 15000 });

    const newHabitName = `Pasear al perro a las ${new Date().getTime()}`;

    // 2. Open the creation dialog.
    await page.locator('button', { hasText: 'Crear Hábito' }).click();
    await expect(page.locator('h2', { hasText: 'Crear un nuevo hábito' })).toBeVisible();

    // 3. Fill out the form.
    await page.locator('input[placeholder="Ej: Leer por 15 minutos"]').fill(newHabitName);
    await page.locator('button', { hasText: 'Diaria' }).click(); // Select daily frequency.

    // 4. Submit the form.
    await page.locator('button[type="submit"]', { hasText: 'Crear Hábito' }).click();

    // 5. Verify the habit was created and is visible on the dashboard.
    await expect(page.locator(`div:has-text("${newHabitName}")`)).toBeVisible();

    // 6. Optional: Verify the toast notification for success.
    await expect(page.locator('div[role="status"]', { hasText: '¡Hábito Creado!' })).toBeVisible();
  });
});
