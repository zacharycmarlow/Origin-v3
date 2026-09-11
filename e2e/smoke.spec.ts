import { test, expect } from '@playwright/test';

test('homepage loads and shows the app title', async ({ page }) => {
  await page.goto('/');
  // The app renders "THE · ORIGIN" in the topbar
  await expect(page.getByText('THE · ORIGIN')).toBeVisible();
});

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Origin/i);
});
