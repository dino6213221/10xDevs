import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  private readonly emailInput = this.getByTestId("auth-email-input");
  private readonly passwordInput = this.getByTestId("auth-password-input");
  private readonly submitButton = this.getByTestId("auth-submit-button");
  private readonly errorMessage = ".bg-red-50";
  private readonly signUpLink = 'a[href="/auth/register"]:has-text("create a new account")';
  private readonly forgotPasswordLink = 'a[href="/auth/reset-password"]';

  async navigateToLogin(): Promise<void> {
    await this.navigate("/auth/login");
    await this.waitForLoad();
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.locator(this.emailInput).fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.locator(this.passwordInput).fill(password);
  }

  async clickSignIn(): Promise<void> {
    await this.page.locator(this.submitButton).click();
  }

  async submitLoginForm(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.page.locator(this.errorMessage).textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.page.locator(this.errorMessage).isVisible();
  }

  async clickSignUpLink(): Promise<void> {
    await this.page.locator(this.signUpLink).click();
  }

  async clickForgotPasswordLink(): Promise<void> {
    await this.page.locator(this.forgotPasswordLink).click();
  }

  async isLoginFormVisible(): Promise<boolean> {
    return this.page.locator("form").isVisible();
  }

  async waitForRedirect(): Promise<void> {
    await this.page.waitForURL("**/flashcards");
  }

  async waitForErrorMessage(): Promise<void> {
    await this.page.locator(this.errorMessage).waitFor({ state: "visible", timeout: 5000 });
  }
}
