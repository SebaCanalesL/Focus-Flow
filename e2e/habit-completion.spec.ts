import { test, expect } from '@playwright/test';

const UI_URL = process.env.UI_URL || 'http://localhost:3000';

// E2E-04: Test marking a habit as complete and verifying the UI update.

test.describe('Habit Completion Flow', () => {
  test("should allow a user to toggle a habit's completion status", async ({ page }) => {
    await page.goto(UI_URL);

    // 1. Wait for habits to be loaded.
    await expect(page.locator('h1', { hasText: 'Panel de Hábitos' })).toBeVisible({ timeout: 15000 });

    // 2. Select a habit to interact with (e.g., 'Leer 10 páginas').
    const habitRow = page.locator('div:has-text("Leer 10 páginas")').first();
    const completeButton = habitRow.locator('button[aria-label="Marcar como completado"]');
    
    await expect(completeButton).toBeVisible();

    // 3. Mark the habit as complete.
    await completeButton.click();

    // 4. Verify the habit now shows as completed.
    await expect(habitRow.locator('button[aria-label="Marcar como incompleto"]')).toBeVisible();

    // 5. Mark the habit as incomplete again to revert the state.
    const incompleteButton = habitRow.locator('button[aria-label="Marcar como incompleto"]');
    await incompleteButton.click();

    // 6. Verify the habit is back to its original state.
    await expect(habitRow.locator('button[aria-label="Marcar como completado"]')).toBeVisible();
  });
});
