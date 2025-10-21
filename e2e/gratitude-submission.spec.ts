import { test, expect } from '@playwright/test';

const UI_URL = process.env.UI_URL || 'http://localhost:3000';

// E2E-03: Test submitting a gratitude entry and verifying it's saved.

test.describe('Gratitude Submission Flow', () => {
  test('should allow a user to submit a gratitude entry for the current day', async ({ page }) => {
    await page.goto(UI_URL);

    // 1. Navigate to the gratitude section.
    // Assuming there's a button or link to access the gratitude journal.
    // For this example, we'll click on the gratitude habit.
    await page.locator('div', { hasText: 'Agradecer' }).click();

    // 2. Find the textarea and enter a gratitude message.
    const gratitudeText = `Agradecido por las pruebas E2E que funcionan - ${new Date().toISOString()}`;
    const textarea = page.locator('textarea[placeholder*="Agradezco por..."]');
    await expect(textarea).toBeVisible();
    await textarea.fill(gratitudeText);

    // 3. Click the save button.
    await page.locator('button', { hasText: 'Guardar' }).click();

    // 4. Verify the entry was saved.
    // The text area should now be populated with the saved text.
    await expect(textarea).toHaveValue(gratitudeText);

    // 5. Check if the habit is marked as completed.
    const gratitudeHabit = page.locator('div[data-habit-id="gratitude-habit"]');
    await expect(gratitudeHabit).toHaveAttribute('data-completed', 'true');
  });
});
