import { test, expect } from './test.setup';

test.describe('Navigation', () => {
  test('homepage redirects to login for unauthenticated users', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');

    // Assert - unauthenticated users get redirected to login
    await expect(page).toHaveURL('/auth/login');
    await expect(page).toHaveTitle('Sign In');
  });

  test('login page displays navigation correctly', async ({ page }) => {
    // Arrange & Act
    await page.goto('/auth/login');

    // Assert - check login page content is displayed
    await expect(page).toHaveTitle('Sign In');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
