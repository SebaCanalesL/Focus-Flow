import { test, expect } from '@playwright/test';

test.describe('Drag and Drop - Mobile Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should reorder habits on mobile with touch', async ({ page }) => {
    // Navigate to habits page
    await page.click('[data-testid="habits-nav"]');
    await page.waitForLoadState('networkidle');

    // Get initial order of habits
    const initialHabits = await page.locator('[data-testid="habit-card"]').all();
    expect(initialHabits.length).toBeGreaterThan(1);

    // Get the first habit's text
    const firstHabitText = await initialHabits[0].textContent();
    
    // Find the drag handle of the first habit
    const dragHandle = initialHabits[0].locator('[role="button"][aria-label="Arrastra para reordenar"]');
    await expect(dragHandle).toBeVisible();

    // Perform drag and drop using touch
    const secondHabit = initialHabits[1];
    const secondHabitBox = await secondHabit.boundingBox();
    
    if (secondHabitBox) {
      // Start drag from the first habit's drag handle
      const dragHandleBox = await dragHandle.boundingBox();
      if (dragHandleBox) {
        await page.touchscreen.tap(
          dragHandleBox.x + dragHandleBox.width / 2,
          dragHandleBox.y + dragHandleBox.height / 2
        );
        
        // Wait for drag to activate
        await page.waitForTimeout(200);
        
        // Move to second habit position
        await page.touchscreen.tap(
          secondHabitBox.x + secondHabitBox.width / 2,
          secondHabitBox.y + secondHabitBox.height / 2
        );
      }
    }

    // Wait for reorder to complete
    await page.waitForTimeout(500);

    // Verify the order has changed
    const newHabits = await page.locator('[data-testid="habit-card"]').all();
    const newFirstHabitText = await newHabits[0].textContent();
    
    // The first habit should have moved to a different position
    expect(newFirstHabitText).not.toBe(firstHabitText);
  });

  test('should reorder dashboard cards on mobile', async ({ page }) => {
    // Navigate to dashboard
    await page.click('[data-testid="dashboard-nav"]');
    await page.waitForLoadState('networkidle');

    // Get initial order of cards
    const initialCards = await page.locator('[data-testid="reorderable-card"]').all();
    expect(initialCards.length).toBeGreaterThan(1);

    // Get the first card's content
    const firstCardContent = await initialCards[0].textContent();
    
    // Find the drag handle of the first card
    const dragHandle = initialCards[0].locator('[role="button"][aria-label="Arrastra para reordenar"]');
    await expect(dragHandle).toBeVisible();

    // Perform drag and drop using touch
    const secondCard = initialCards[1];
    const secondCardBox = await secondCard.boundingBox();
    
    if (secondCardBox) {
      const dragHandleBox = await dragHandle.boundingBox();
      if (dragHandleBox) {
        // Touch and hold to start drag
        await page.touchscreen.tap(
          dragHandleBox.x + dragHandleBox.width / 2,
          dragHandleBox.y + dragHandleBox.height / 2
        );
        
        // Wait for drag to activate
        await page.waitForTimeout(200);
        
        // Move to second card position
        await page.touchscreen.tap(
          secondCardBox.x + secondCardBox.width / 2,
          secondCardBox.y + secondCardBox.height / 2
        );
      }
    }

    // Wait for reorder to complete
    await page.waitForTimeout(500);

    // Verify the order has changed
    const newCards = await page.locator('[data-testid="reorderable-card"]').all();
    const newFirstCardContent = await newCards[0].textContent();
    
    expect(newFirstCardContent).not.toBe(firstCardContent);
  });

  test('should reorder routine steps on mobile', async ({ page }) => {
    // Navigate to routines page
    await page.click('[data-testid="routines-nav"]');
    await page.waitForLoadState('networkidle');

    // Create or edit a routine
    const createButton = page.locator('[data-testid="create-routine-button"]');
    if (await createButton.isVisible()) {
      await createButton.click();
    } else {
      // If no create button, try to edit an existing routine
      const editButton = page.locator('[data-testid="edit-routine-button"]').first();
      await editButton.click();
    }

    // Wait for dialog to open
    await page.waitForSelector('[data-testid="routine-dialog"]');

    // Get initial order of steps
    const initialSteps = await page.locator('[data-testid="sortable-step"]').all();
    expect(initialSteps.length).toBeGreaterThan(1);

    // Get the first step's text
    const firstStepText = await initialSteps[0].textContent();
    
    // Find the drag handle of the first step
    const dragHandle = initialSteps[0].locator('[role="button"]').first();
    await expect(dragHandle).toBeVisible();

    // Perform drag and drop using touch
    const secondStep = initialSteps[1];
    const secondStepBox = await secondStep.boundingBox();
    
    if (secondStepBox) {
      const dragHandleBox = await dragHandle.boundingBox();
      if (dragHandleBox) {
        // Touch and hold to start drag
        await page.touchscreen.tap(
          dragHandleBox.x + dragHandleBox.width / 2,
          dragHandleBox.y + dragHandleBox.height / 2
        );
        
        // Wait for drag to activate
        await page.waitForTimeout(200);
        
        // Move to second step position
        await page.touchscreen.tap(
          secondStepBox.x + secondStepBox.width / 2,
          secondStepBox.y + secondStepBox.height / 2
        );
      }
    }

    // Wait for reorder to complete
    await page.waitForTimeout(500);

    // Verify the order has changed
    const newSteps = await page.locator('[data-testid="sortable-step"]').all();
    const newFirstStepText = await newSteps[0].textContent();
    
    expect(newFirstStepText).not.toBe(firstStepText);
  });

  test('should provide visual feedback during drag on mobile', async ({ page }) => {
    // Navigate to habits page
    await page.click('[data-testid="habits-nav"]');
    await page.waitForLoadState('networkidle');

    const habits = await page.locator('[data-testid="habit-card"]').all();
    expect(habits.length).toBeGreaterThan(0);

    const dragHandle = habits[0].locator('[role="button"][aria-label="Arrastra para reordenar"]');
    await expect(dragHandle).toBeVisible();

    // Check that drag handle has proper touch target size
    const dragHandleBox = await dragHandle.boundingBox();
    if (dragHandleBox) {
      expect(dragHandleBox.width).toBeGreaterThanOrEqual(44); // Minimum touch target size
      expect(dragHandleBox.height).toBeGreaterThanOrEqual(44);
    }

    // Test hover state (should work on touch devices too)
    await dragHandle.hover();
    await expect(dragHandle).toHaveClass(/hover:bg-muted/);
  });

  test('should handle long press activation correctly', async ({ page }) => {
    // Navigate to habits page
    await page.click('[data-testid="habits-nav"]');
    await page.waitForLoadState('networkidle');

    const habits = await page.locator('[data-testid="habit-card"]').all();
    expect(habits.length).toBeGreaterThan(0);

    const dragHandle = habits[0].locator('[role="button"][aria-label="Arrastra para reordenar"]');
    
    // Test that short tap doesn't activate drag
    await dragHandle.tap();
    await page.waitForTimeout(50);
    
    // Should not show drag overlay
    const dragOverlay = page.locator('[data-testid="drag-overlay"]');
    await expect(dragOverlay).not.toBeVisible();

    // Test that long press activates drag
    const dragHandleBox = await dragHandle.boundingBox();
    if (dragHandleBox) {
      // Simulate long press
      await page.touchscreen.tap(
        dragHandleBox.x + dragHandleBox.width / 2,
        dragHandleBox.y + dragHandleBox.height / 2
      );
      
      // Wait for activation delay
      await page.waitForTimeout(150);
      
      // Should show drag overlay
      await expect(dragOverlay).toBeVisible();
    }
  });
});
