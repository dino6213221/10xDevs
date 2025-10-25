import { BasePage } from './BasePage';

export class EditFlashcardPage extends BasePage {
  private readonly pageTitle = 'h1:has-text("Edit Flashcard")';
  private readonly backToFlashcardsLink = 'a[href="/flashcards"]';
  readonly frontInput = this.getByTestId('flashcard-front-input');
  readonly backInput = this.getByTestId('flashcard-back-input');
  readonly submitButton = this.getByTestId('flashcard-submit-button');
  private readonly cancelButton = this.getByTestId('flashcard-cancel-button');
  private readonly loadingState = '.animate-pulse';
  private readonly errorMessage = 'div.bg-red-50[role="alert"]';

  async navigateToEditFlashcard(flashcardId: number): Promise<void> {
    await this.navigate(`/flashcards/${flashcardId}/edit`);
    await this.waitForLoad();
  }

  async getPageTitle(): Promise<string> {
    // @ts-ignore
    return this.page.locator(this.pageTitle).textContent();
  }

  async isPageLoaded(): Promise<boolean> {
    return this.page.locator(this.pageTitle).isVisible();
  }

  async isLoading(): Promise<boolean> {
    return this.page.locator(this.loadingState).isVisible();
  }

  async waitForFormToLoad(): Promise<void> {
    await this.page.locator(this.frontInput).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(this.backInput).waitFor({ state: 'visible', timeout: 10000 });
  }

  async getFrontText(): Promise<string> {
    return this.page.locator(this.frontInput).inputValue();
  }

  async getBackText(): Promise<string> {
    return this.page.locator(this.backInput).inputValue();
  }

  async fillFrontText(text: string): Promise<void> {
    await this.page.locator(this.frontInput).clear();
    await this.page.locator(this.frontInput).fill(text);
  }

  async fillBackText(text: string): Promise<void> {
    await this.page.locator(this.backInput).clear();
    await this.page.locator(this.backInput).fill(text);
  }

  async updateFlashcard(frontText: string, backText: string): Promise<void> {
    await this.fillFrontText(frontText);
    await this.fillBackText(backText);
    await this.page.locator(this.submitButton).click();
  }

  async cancelEdit(): Promise<void> {
    await this.page.locator(this.cancelButton).click();
  }

  async clickBackToFlashcards(): Promise<void> {
    await this.page.locator(this.backToFlashcardsLink).click();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.page.locator(this.errorMessage).textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.page.locator(this.errorMessage).isVisible();
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForURL('**/flashcards');
  }
}
