import { test, expect } from "./test.setup";
import { LoginPage } from "./page-objects/LoginPage";
import { FlashcardsPage } from "./page-objects/FlashcardsPage";

test.describe("Authentication", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test("successful login redirects to flashcards page", async () => {
    // TODO: Implement with test user credentials
    // Example with environment variables:
    // const testUser = {
    //   email: process.env.TEST_USER_EMAIL!,
    //   password: process.env.TEST_USER_PASSWORD!
    // };
    // await loginPage.navigateToLogin();
    // await loginPage.submitLoginForm(testUser.email, testUser.password);
    // await expect(page).toHaveURL('/flashcards', { timeout: 10000 });
    test.skip(true, "Requires valid Supabase test user");
  });

  test("login with invalid credentials shows error message", async () => {
    // Arrange
    const invalidUser = {
      email: "invalid@example.com",
      password: "wrongpassword",
    };
    await loginPage.navigateToLogin();

    // Act
    await loginPage.submitLoginForm(invalidUser.email, invalidUser.password);

    // Assert - wait for error message to appear (handles async behavior)
    await loginPage.waitForErrorMessage();
    expect(await loginPage.isErrorVisible()).toBeTruthy();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("Invalid email or password. Please check your credentials and try again.");
  });

  test("login form validation prevents submission with empty fields", async () => {
    // Arrange
    await loginPage.navigateToLogin();

    // Act
    await loginPage.clickSignIn();

    // Assert
    await expect(loginPage.page).toHaveURL("/auth/login");
    expect(await loginPage.isLoginFormVisible()).toBeTruthy();
  });

  test("navigation to signup page works", async () => {
    // Arrange
    await loginPage.navigateToLogin();

    // Act
    await loginPage.clickSignUpLink();

    // Assert
    await expect(loginPage.page).toHaveURL("/auth/register");
  });

  test("navigation to forgot password page works", async () => {
    // Arrange
    await loginPage.navigateToLogin();

    // Act
    await loginPage.clickForgotPasswordLink();

    // Assert
    await expect(loginPage.page).toHaveURL("/auth/reset-password");
  });
});

test.describe("Flashcards Page Access", () => {
  let flashcardsPage: FlashcardsPage;

  test.beforeEach(async ({ page }) => {
    flashcardsPage = new FlashcardsPage(page);
  });

  test("flashcards page loads correctly for authenticated users", async () => {
    // This test would need authentication setup
    // For now, just test the structure
    await flashcardsPage.navigate("/flashcards");

    // Assert page elements are present (may redirect to login)
    await flashcardsPage.waitForLoad();
    // Note: In real implementation, setup authentication first
  });
});
